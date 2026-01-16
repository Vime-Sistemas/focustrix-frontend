import axios, { type AxiosRequestConfig } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CrmPage } from "@/pages/crm";
import { LoginPage } from "@/pages/login";
import { OrgCreatePage } from "@/pages/org-create";
import { OrgSelectPage, type Org } from "@/pages/org-select";
import { RegisterPage } from "@/pages/register";
import type { ApiRequest } from "@/lib/api";

import "./App.css";

type Stage = "login" | "register" | "orgSelect" | "orgCreate" | "app";
type AuthUser = { id: string; email: string };

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const STORAGE_KEYS = {
  access: "fx:accessToken",
  refresh: "fx:refreshToken",
  org: "fx:orgId",
};

function App() {
  const [stage, setStage] = useState<Stage>("login");
  const [initializing, setInitializing] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [orgCreateLoading, setOrgCreateLoading] = useState(false);
  const [orgCreateError, setOrgCreateError] = useState<string | null>(null);
  const isAuthenticated = Boolean(accessToken && user);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE,
        headers: { "Content-Type": "application/json" },
      }),
    [],
  );

  const persistTokens = useCallback((access: string | null, refresh: string | null) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    if (access) localStorage.setItem(STORAGE_KEYS.access, access);
    else localStorage.removeItem(STORAGE_KEYS.access);
    if (refresh) localStorage.setItem(STORAGE_KEYS.refresh, refresh);
    else localStorage.removeItem(STORAGE_KEYS.refresh);
  }, []);

  const persistOrg = useCallback((orgId?: string) => {
    setSelectedOrg(orgId);
    if (orgId) localStorage.setItem(STORAGE_KEYS.org, orgId);
    else localStorage.removeItem(STORAGE_KEYS.org);
  }, []);

  const clearAuth = useCallback(() => {
    persistTokens(null, null);
    persistOrg(undefined);
    setUser(null);
    setStage("login");
  }, [persistTokens, persistOrg]);

  const authHeaders = useCallback(
    (tokenOverride?: string | null, withOrg?: boolean) => {
      const headers: Record<string, string> = {};
      const token = tokenOverride ?? accessToken;
      if (token) headers.Authorization = `Bearer ${token}`;
      if (withOrg) {
        if (!selectedOrg) throw new Error("Selecione uma organizacao primeiro");
        headers["x-org-id"] = selectedOrg;
      }
      return headers;
    },
    [accessToken, selectedOrg],
  );

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return false;
    try {
      const { data } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>("/auth/refresh", { refreshToken });
      persistTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      return true;
    } catch (error) {
      clearAuth();
      return false;
    }
  }, [api, clearAuth, persistTokens, refreshToken]);

  const apiRequest: ApiRequest = useCallback(
    async <T,>(
      config: AxiosRequestConfig,
      options?: { withOrg?: boolean; retrying?: boolean; tokenOverride?: string | null },
    ): Promise<T> => {
      const headers = {
        ...(config.headers as Record<string, string> | undefined),
        ...authHeaders(options?.tokenOverride ?? undefined, options?.withOrg),
      };

      try {
        const response = await api.request<T>({ ...config, headers });
        return response.data;
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        if (status === 401 && !options?.retrying) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            return apiRequest<T>(config, { ...options, retrying: true });
          }
        }

        if (axios.isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string } | undefined)?.message ||
            error.message ||
            `Erro ao chamar ${String(config.url)}`;
          throw new Error(message);
        }
        throw error;
      }
    },
    [api, authHeaders, refreshAccessToken],
  );

  const loadOrgs = async (tokenOverride?: string) => {
    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const data: {
        organization: { id: string; name: string };
        role: Org["role"];
        status: string;
      }[] = await apiRequest(
        { url: "/orgs", method: "GET" },
        { tokenOverride },
      );

      setOrgs(
        data.map((item) => ({
          id: item.organization.id,
          name: item.organization.name,
          role: item.role,
        })),
      );
    } catch (error) {
      setOrgsError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar as organizacoes",
      );
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    const storedAccess = localStorage.getItem(STORAGE_KEYS.access);
    const storedRefresh = localStorage.getItem(STORAGE_KEYS.refresh);
    const storedOrg = localStorage.getItem(STORAGE_KEYS.org) ?? undefined;

    if (storedOrg) setSelectedOrg(storedOrg);

    if (!storedAccess || !storedRefresh) {
      setInitializing(false);
      return;
    }

    persistTokens(storedAccess, storedRefresh);

    apiRequest<{ user: AuthUser }>(
      { url: "/auth/me", method: "GET" },
      { tokenOverride: storedAccess },
    )
      .then((res) => {
        setUser(res.user);
        return loadOrgs(storedAccess);
      })
      .then(() => {
        setStage(storedOrg ? "app" : "orgSelect");
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    if (
      !isAuthenticated &&
      (stage === "orgSelect" || stage === "orgCreate" || stage === "app")
    ) {
      setStage("login");
    }
  }, [isAuthenticated, stage]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data: {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      } = await apiRequest(
        { url: "/auth/login", method: "POST", data: { email, password } },
        { tokenOverride: null },
      );

      persistTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await loadOrgs(data.accessToken);
      setStage("orgSelect");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Falha no login");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data: {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      } = await apiRequest(
        { url: "/auth/register", method: "POST", data: { email, password } },
        { tokenOverride: null },
      );

      persistTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await loadOrgs(data.accessToken);
      setStage("orgSelect");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Falha no cadastro",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateOrg = async (name: string, domain?: string) => {
    setOrgCreateLoading(true);
    setOrgCreateError(null);
    try {
      const newOrg = await apiRequest<Org>({
        url: "/orgs",
        method: "POST",
        data: { name, domain },
      });
      const normalized: Org = {
        id: newOrg.id,
        name: newOrg.name,
        role: "OWNER",
      };
      setOrgs((prev) => [...prev, normalized]);
      persistOrg(normalized.id);
      setStage("app");
    } catch (error) {
      setOrgCreateError(
        error instanceof Error ? error.message : "Erro ao criar organizacao",
      );
    } finally {
      setOrgCreateLoading(false);
    }
  };

  const selectOrg = (orgId: string) => {
    persistOrg(orgId);
    setStage("app");
  };

  if (initializing) return null;

  if (stage === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setStage("register")}
        loading={authLoading}
        error={authError ?? undefined}
      />
    );
  }

  if (stage === "register") {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onGoLogin={() => setStage("login")}
        loading={authLoading}
        error={authError ?? undefined}
      />
    );
  }

  if (stage === "orgSelect") {
    return (
      <OrgSelectPage
        orgs={orgs}
        loading={orgsLoading}
        error={orgsError ?? undefined}
        onSelect={selectOrg}
        onCreateNew={() => setStage("orgCreate")}
      />
    );
  }

  if (stage === "orgCreate") {
    return (
      <OrgCreatePage
        onCreate={handleCreateOrg}
        onBack={() => setStage("orgSelect")}
        loading={orgCreateLoading}
        error={orgCreateError ?? undefined}
      />
    );
  }

  return <CrmPage selectedOrg={selectedOrg} apiRequest={apiRequest} />;
}

export default App;

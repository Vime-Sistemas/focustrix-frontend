import { useCallback, useEffect, useState } from "react"
import type { ApiRequest } from "@/lib/api"

export type Profile = { id: string; email: string }

interface UseProfileArgs {
  apiRequest: ApiRequest
}

export function useProfile({ apiRequest }: UseProfileArgs) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<{ user: Profile }>({ url: "/auth/me", method: "GET" })
      setProfile(res.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    void load()
  }, [load])

  const updateProfile = useCallback(async (input: { email: string }) => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await apiRequest<{ user: Profile }>({ url: "/auth/profile", method: "PUT", data: input })
      setProfile(res.user)
      return res.user
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao atualizar perfil"
      setSaveError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [apiRequest])

  const changePassword = useCallback(async (input: { currentPassword: string; newPassword: string }) => {
    setPasswordChanging(true)
    setPasswordError(null)
    try {
      const res = await apiRequest<{ accessToken: string; refreshToken: string; user: Profile }>({
        url: "/auth/change-password",
        method: "POST",
        data: input,
      })
      setProfile(res.user)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao alterar senha"
      setPasswordError(message)
      throw err
    } finally {
      setPasswordChanging(false)
    }
  }, [apiRequest])

  return {
    profile,
    loading,
    error,
    saving,
    saveError,
    passwordChanging,
    passwordError,
    updateProfile,
    changePassword,
    refetch: load,
  }
}

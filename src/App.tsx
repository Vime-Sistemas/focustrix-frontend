import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AppShell } from "@/components/app-shell"
import { DataTable, type Column } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"

import "./App.css"

type Stage = "login" | "register" | "orgSelect" | "orgCreate" | "app"

type Account = { id: string; name: string; domain?: string; industry?: string; owner: string }
type Contact = { id: string; name: string; email?: string; phone?: string; account?: string }
type Deal = { id: string; name: string; amount?: string; stage: string; owner: string }
type Task = { id: string; title: string; status: string; due?: string; assignee: string }
type Org = { id: string; name: string; role: "OWNER" | "ADMIN" | "MEMBER" }

const navItems = [
  { label: "Contas", value: "accounts" },
  { label: "Contatos", value: "contacts" },
  { label: "Negócios", value: "deals" },
  { label: "Tarefas", value: "tasks" },
]

function App() {
  const [stage, setStage] = useState<Stage>("login")
  const [active, setActive] = useState("accounts")
  const [loading, setLoading] = useState(true)
  const [orgs, setOrgs] = useState<Org[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>()

  // Mock data for lists
  const accounts: Account[] = useMemo(
    () => [
      { id: "1", name: "Acme Cloud", domain: "acme.dev", industry: "SaaS", owner: "Joao" },
      { id: "2", name: "Nova AI", domain: "nova.ai", industry: "AI", owner: "Maria" },
    ],
    [],
  )

  const contacts: Contact[] = useMemo(
    () => [
      { id: "1", name: "Ana Silva", email: "ana@acme.dev", phone: "+55 11 99999-0000", account: "Acme Cloud" },
      { id: "2", name: "Bruno Lima", email: "bruno@nova.ai", phone: "+55 21 98888-0000", account: "Nova AI" },
    ],
    [],
  )

  const deals: Deal[] = useMemo(
    () => [
      { id: "1", name: "Contrato Enterprise", amount: "R$ 120.000", stage: "Proposta", owner: "Joao" },
      { id: "2", name: "Renovacao 2025", amount: "R$ 80.000", stage: "Discovery", owner: "Maria" },
    ],
    [],
  )

  const tasks: Task[] = useMemo(
    () => [
      { id: "1", title: "Enviar proposta", status: "IN_PROGRESS", due: "Hoje", assignee: "Joao" },
      { id: "2", title: "Agendar demo", status: "TODO", due: "Amanha", assignee: "Maria" },
    ],
    [],
  )

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Mock orgs load
    const timer = setTimeout(
      () => setOrgs([{ id: "org-1", name: "Tech Labs", role: "OWNER" }, { id: "org-2", name: "Acme Ventures", role: "ADMIN" }]),
      300,
    )
    return () => clearTimeout(timer)
  }, [])

  const accountColumns: Column<Account>[] = [
    { key: "name", header: "Nome" },
    { key: "domain", header: "Dominio" },
    { key: "industry", header: "Industria" },
    { key: "owner", header: "Dono" },
  ]

  const contactColumns: Column<Contact>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    { key: "account", header: "Conta" },
  ]

  const dealColumns: Column<Deal>[] = [
    { key: "name", header: "Negocio" },
    { key: "amount", header: "Valor" },
    {
      key: "stage",
      header: "Etapa",
      render: (item) => <Badge variant="outline">{item.stage}</Badge>,
    },
    { key: "owner", header: "Dono" },
  ]

  const taskColumns: Column<Task>[] = [
    { key: "title", header: "Tarefa" },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={item.status === "DONE" ? "default" : "secondary"}>{item.status}</Badge>
      ),
    },
    { key: "due", header: "Vencimento" },
    { key: "assignee", header: "Responsavel" },
  ]

  const renderTable = () => {
    switch (active) {
      case "accounts":
        return (
          <DataTable
            title="Contas"
            description="Organizacoes que voce acompanha."
            columns={accountColumns}
            data={accounts}
            loading={loading}
            action={<Button size="sm">Nova conta</Button>}
          />
        )
      case "contacts":
        return (
          <DataTable
            title="Contatos"
            description="Pessoas-chave das contas."
            columns={contactColumns}
            data={contacts}
            loading={loading}
            action={<Button size="sm">Novo contato</Button>}
          />
        )
      case "deals":
        return (
          <DataTable
            title="Negocios"
            description="Oportunidades em andamento."
            columns={dealColumns}
            data={deals}
            loading={loading}
            action={<Button size="sm">Novo negocio</Button>}
          />
        )
      case "tasks":
        return (
          <DataTable
            title="Tarefas"
            description="Acoes pendentes."
            columns={taskColumns}
            data={tasks}
            loading={loading}
            action={<Button size="sm">Nova tarefa</Button>}
          />
        )
      default:
        return null
    }
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStage("orgSelect")
  }

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStage("orgSelect")
  }

  const handleCreateOrg = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const newOrg: Org = { id: "org-new", name: "Nova Organizacao", role: "OWNER" }
    setOrgs((prev) => [...prev, newOrg])
    setSelectedOrg(newOrg.id)
    setStage("app")
  }

  const selectOrg = (orgId: string) => {
    setSelectedOrg(orgId)
    setStage("app")
  }

  if (stage === "login") {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
              Fx
            </div>
            <div>
              <p className="text-xs uppercase tracking-tight text-slate-500">Focustrix</p>
              <h1 className="text-xl font-semibold text-slate-900">Entrar</h1>
            </div>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="voce@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" required placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
              <div className="text-sm text-slate-600">
                Nao tem conta?{" "}
                <button
                  type="button"
                  className="font-semibold text-emerald-600"
                  onClick={() => setStage("register")}
                >
                  Criar conta
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (stage === "register") {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
              Fx
            </div>
            <div>
              <p className="text-xs uppercase tracking-tight text-slate-500">Focustrix</p>
              <h1 className="text-xl font-semibold text-slate-900">Criar conta</h1>
            </div>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" required placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input id="email-register" name="email" type="email" required placeholder="voce@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Senha</Label>
                  <Input id="password-register" name="password" type="password" required placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <Input id="confirm-password" name="confirmPassword" type="password" required placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full">
                  Continuar
                </Button>
              </form>
              <div className="text-sm text-slate-600">
                Ja tem conta?{" "}
                <button
                  type="button"
                  className="font-semibold text-emerald-600"
                  onClick={() => setStage("login")}
                >
                  Entrar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (stage === "orgSelect") {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
          <div className="mb-8 space-y-2">
            <p className="text-xs uppercase tracking-tight text-slate-500">Selecione uma organizacao</p>
            <h1 className="text-2xl font-semibold text-slate-900">Onde voce quer trabalhar?</h1>
            <p className="text-sm text-slate-600">Escolha uma das organizacoes ou crie uma nova.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {orgs.length === 0 ? (
              [...Array(4)].map((_, idx) => <Skeleton key={idx} className="h-20 w-full" />)
            ) : (
              orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => selectOrg(org.id)}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{org.name}</p>
                      <p className="text-sm text-slate-600">Papel: {org.role}</p>
                    </div>
                    <Badge variant="secondary">Entrar</Badge>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={() => setStage("orgCreate")}>Criar nova organizacao</Button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "orgCreate") {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
          <div className="mb-8 space-y-2">
            <p className="text-xs uppercase tracking-tight text-slate-500">Nova organizacao</p>
            <h1 className="text-2xl font-semibold text-slate-900">Crie sua primeira organizacao</h1>
            <p className="text-sm text-slate-600">Defina nome e dominio opcional.</p>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              <form className="space-y-4" onSubmit={handleCreateOrg}>
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nome</Label>
                  <Input id="org-name" required placeholder="Ex.: Tech Labs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-domain">Dominio (opcional)</Label>
                  <Input id="org-domain" placeholder="empresa.com" />
                </div>
                <Button type="submit" className="w-full">
                  Criar e entrar
                </Button>
              </form>
              <Button variant="outline" className="w-full" onClick={() => setStage("orgSelect")}>
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <AppShell
      navItems={navItems}
      active={active}
      onNavChange={setActive}
      onQuickCreate={(type) => console.log("quick create", type)}
    >
      <PageHeader
        title="CRM focado em tecnologia"
        description={selectedOrg ? `Organizacao: ${selectedOrg}` : "Visao consolidada de contas, contatos, negocios e tarefas."}
        className="mb-6"
      >
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle>Resumo rapido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Contas", "Contatos", "Negocios", "Tarefas"].map((label) => (
              <div
                key={label}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "--" : "em andamento"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageHeader>

      <Separator className="mb-6" />
      {renderTable()}
    </AppShell>
  )
}

export default App

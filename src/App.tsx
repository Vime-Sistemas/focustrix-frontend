import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AppShell } from "@/components/app-shell"
import { DataTable, type Column } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"

import "./App.css"

type Account = { id: string; name: string; domain?: string; industry?: string; owner: string }
type Contact = { id: string; name: string; email?: string; phone?: string; account?: string }
type Deal = { id: string; name: string; amount?: string; stage: string; owner: string }
type Task = { id: string; title: string; status: string; due?: string; assignee: string }

const navItems = [
  { label: "Contas", value: "accounts" },
  { label: "Contatos", value: "contacts" },
  { label: "Negócios", value: "deals" },
  { label: "Tarefas", value: "tasks" },
]

function App() {
  const [active, setActive] = useState("accounts")
  const [loading, setLoading] = useState(true)

  const accounts: Account[] = useMemo(
    () => [
      { id: "1", name: "Acme Cloud", domain: "acme.dev", industry: "SaaS", owner: "João" },
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
      { id: "1", name: "Contrato Enterprise", amount: "R$ 120.000", stage: "Proposta", owner: "João" },
      { id: "2", name: "Renovação 2025", amount: "R$ 80.000", stage: "Discovery", owner: "Maria" },
    ],
    [],
  )

  const tasks: Task[] = useMemo(
    () => [
      { id: "1", title: "Enviar proposta", status: "IN_PROGRESS", due: "Hoje", assignee: "João" },
      { id: "2", title: "Agendar demo", status: "TODO", due: "Amanhã", assignee: "Maria" },
    ],
    [],
  )

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const accountColumns: Column<Account>[] = [
    { key: "name", header: "Nome" },
    { key: "domain", header: "Domínio" },
    { key: "industry", header: "Indústria" },
    { key: "owner", header: "Dono" },
  ]

  const contactColumns: Column<Contact>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    { key: "account", header: "Conta" },
  ]

  const dealColumns: Column<Deal>[] = [
    { key: "name", header: "Negócio" },
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
    { key: "assignee", header: "Responsável" },
  ]

  const renderTable = () => {
    switch (active) {
      case "accounts":
        return (
          <DataTable
            title="Contas"
            description="Organizações que você acompanha."
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
            title="Negócios"
            description="Oportunidades em andamento."
            columns={dealColumns}
            data={deals}
            loading={loading}
            action={<Button size="sm">Novo negócio</Button>}
          />
        )
      case "tasks":
        return (
          <DataTable
            title="Tarefas"
            description="Ações pendentes."
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

  return (
    <AppShell
      navItems={navItems}
      active={active}
      onNavChange={setActive}
      onQuickCreate={(type) => console.log("quick create", type)}
    >
      <PageHeader
        title="CRM focado em tecnologia"
        description="Visão consolidada de contas, contatos, negócios e tarefas."
        className="mb-6"
      >
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle>Resumo rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Contas", "Contatos", "Negócios", "Tarefas"].map((label) => (
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

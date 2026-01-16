import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell } from "@/components/app-shell"
import { DataTable, type Column } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Building2, Users, Briefcase, CheckSquare } from "lucide-react"
import type { ApiRequest } from "@/lib/api"
import {
  useAccounts,
  useContacts,
  useDeals,
  usePipelineStages,
  useTasks,
} from "@/hooks/use-crm-resources"

export type NavValue = "accounts" | "contacts" | "deals" | "tasks"

export interface CrmPageProps {
  selectedOrg?: string
  apiRequest: ApiRequest
}

type AccountRow = { id: string; name: string; domain?: string; industry?: string; owner: string }
type ContactRow = { id: string; name: string; email?: string; phone?: string; account?: string }
type DealRow = { id: string; name: string; amount?: string; stage: string; owner: string }
type TaskRow = { id: string; title: string; status: string; due?: string; assignee: string }

const navItems = [
  { label: "Contas", value: "accounts" },
  { label: "Contatos", value: "contacts" },
  { label: "Negócios", value: "deals" },
  { label: "Tarefas", value: "tasks" },
]

export function CrmPage({ selectedOrg, apiRequest }: CrmPageProps) {
  const [active, setActive] = useState<NavValue>("accounts")
  const enabled = Boolean(selectedOrg)

  const accountsQuery = useAccounts({ apiRequest, enabled })
  const contactsQuery = useContacts({ apiRequest, enabled })
  const stagesQuery = usePipelineStages({ apiRequest, enabled })
  const dealsQuery = useDeals({ apiRequest, enabled })
  const tasksQuery = useTasks({ apiRequest, enabled })

  const stageLookup = useMemo(() => {
    const lookup = new Map<string, string>()
    stagesQuery.data.forEach((stage) => lookup.set(stage.id, stage.name))
    return lookup
  }, [stagesQuery.data])

  const accounts: AccountRow[] = useMemo(
    () =>
      accountsQuery.data.map((account) => ({
        id: account.id,
        name: account.name,
        domain: account.domain ?? "—",
        industry: account.industry ?? "—",
        owner: account.ownerId ?? "—",
      })),
    [accountsQuery.data],
  )

  const contacts: ContactRow[] = useMemo(
    () =>
      contactsQuery.data.map((contact) => ({
        id: contact.id,
        name: [contact.firstName, contact.lastName].filter(Boolean).join(" "),
        email: contact.email ?? "—",
        phone: contact.phone ?? "—",
        account: contact.accountId ?? "—",
      })),
    [contactsQuery.data],
  )

  const deals: DealRow[] = useMemo(
    () =>
      dealsQuery.data.map((deal) => ({
        id: deal.id,
        name: deal.name,
        amount: formatCurrency(deal.amount, deal.currency ?? "USD"),
        stage: stageLookup.get(deal.stageId) ?? "—",
        owner: deal.ownerId ?? "—",
      })),
    [dealsQuery.data, stageLookup],
  )

  const tasks: TaskRow[] = useMemo(
    () =>
      tasksQuery.data.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        due: task.dueDate ? formatDate(task.dueDate) : "—",
        assignee: task.ownerId ?? "—",
      })),
    [tasksQuery.data],
  )

  // Columns Definitions
  const accountColumns: Column<AccountRow>[] = [
    { key: "name", header: "Nome", className: "font-medium text-slate-900" },
    { key: "domain", header: "Domínio", render: (i) => <span className="text-emerald-600 hover:underline cursor-pointer">{i.domain}</span> },
    { key: "industry", header: "Indústria" },
    { key: "owner", header: "Owner" },
  ]

  const contactColumns: Column<ContactRow>[] = [
    { key: "name", header: "Nome", className: "font-medium text-slate-900" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    { key: "account", header: "Conta Associada" },
  ]

  const dealColumns: Column<DealRow>[] = [
    { key: "name", header: "Negócio", className: "font-medium text-slate-900" },
    { key: "amount", header: "Valor", className: "font-medium" },
    { 
      key: "stage", 
      header: "Etapa", 
      render: (item) => (
        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-normal">
          {item.stage}
        </Badge>
      ) 
    },
    { key: "owner", header: "Owner" },
  ]

  const taskColumns: Column<TaskRow>[] = [
    { key: "title", header: "Tarefa", className: "font-medium text-slate-900" },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const styles = {
          IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
          TODO: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
          DONE: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
          CANCELED: "bg-slate-100 text-slate-500 border-slate-200",
        }
        return <Badge variant="outline" className={`border ${styles[item.status as keyof typeof styles]}`}>{item.status.replace("_", " ")}</Badge>
      },
    },
    { key: "due", header: "Vencimento" },
    { key: "assignee", header: "Responsável" },
  ]

  const views: Record<NavValue, { data: AccountRow[] | ContactRow[] | DealRow[] | TaskRow[]; loading: boolean; error: string | null }> = {
    accounts: { data: accounts, loading: accountsQuery.loading, error: accountsQuery.error },
    contacts: { data: contacts, loading: contactsQuery.loading, error: contactsQuery.error },
    deals: { data: deals, loading: dealsQuery.loading, error: dealsQuery.error || stagesQuery.error },
    tasks: { data: tasks, loading: tasksQuery.loading, error: tasksQuery.error },
  }

  const activeView = views[active]
  const tableError = activeView.error
    ? <span className="text-sm text-rose-600">{activeView.error}</span>
    : undefined

  const stats = useMemo(() => {
    const pipelineTotal = dealsQuery.data.reduce((total, deal) => total + toNumber(deal.amount), 0)
    const pendingTasks = tasksQuery.data.filter((task) => task.status !== "DONE").length

    return [
      { label: "Contas Ativas", value: accountsQuery.loading ? "--" : accounts.length, icon: Building2 },
      { label: "Contatos", value: contactsQuery.loading ? "--" : contacts.length, icon: Users },
      {
        label: "Pipeline Total",
        value: dealsQuery.loading ? "--" : formatCurrency(pipelineTotal, "BRL"),
        icon: Briefcase,
      },
      { label: "Tarefas Pendentes", value: tasksQuery.loading ? "--" : pendingTasks, icon: CheckSquare },
    ]
  }, [accountsQuery.loading, accounts.length, contactsQuery.loading, contacts.length, dealsQuery.data, dealsQuery.loading, tasksQuery.data, tasksQuery.loading])

  return (
    <AppShell
      navItems={navItems}
      active={active}
      onNavChange={(value) => setActive(value as NavValue)}
      onQuickCreate={(type) => console.log("quick create", type)}
    >
      <PageHeader
        title="Dashboard"
        description={selectedOrg ? `Organização: ${selectedOrg}` : "Visão geral de performance e atividades."}
        className="mb-8"
      >
        <Card className="mt-6 border-slate-200 shadow-sm bg-white">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-emerald-100"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-emerald-500 shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50">
                  <stat.icon size={18} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageHeader>

      {active === "accounts" && (
        <DataTable
          title="Contas"
          description="Base de clientes e prospects."
          columns={accountColumns}
          data={accounts}
          loading={activeView.loading}
          empty={tableError}
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Nova conta</Button>}
        />
      )}
      {active === "contacts" && (
        <DataTable
          title="Contatos"
          description="Stakeholders e decisores."
          columns={contactColumns}
          data={contacts}
          loading={activeView.loading}
          empty={tableError}
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Novo contato</Button>}
        />
      )}
      {active === "deals" && (
        <DataTable
          title="Pipeline"
          description="Oportunidades ativas."
          columns={dealColumns}
          data={deals}
          loading={activeView.loading}
          empty={tableError}
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Novo negócio</Button>}
        />
      )}
      {active === "tasks" && (
        <DataTable
          title="Minhas Tarefas"
          description="Atividades pendentes."
          columns={taskColumns}
          data={tasks}
          loading={activeView.loading}
          empty={tableError}
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Nova tarefa</Button>}
        />
      )}
    </AppShell>
  )
}

const formatCurrency = (value: string | number | null | undefined, currency: string) => {
  const numeric = toNumber(value)
  if (!Number.isFinite(numeric) || numeric === 0) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(numeric)
}

const formatDate = (value: string) => new Date(value).toLocaleDateString("pt-BR")

const toNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}
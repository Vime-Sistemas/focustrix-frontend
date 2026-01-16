import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell } from "@/components/app-shell"
import { DataTable, type Column } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Building2, Users, Briefcase, CheckSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ApiRequest } from "@/lib/api"
import {
  useAccounts,
  useContacts,
  useDeals,
  usePipelineStages,
  useTasks,
  type CreateAccountInput,
  type CreateContactInput,
  type CreateDealInput,
  type CreateTaskInput,
} from "@/hooks/use-crm-resources"

export type NavValue = "accounts" | "contacts" | "deals" | "tasks"

export interface CrmPageProps {
  selectedOrg?: string
  apiRequest: ApiRequest
}

type AccountRow = { id: string; name: string; domain?: string; industry?: string; owner: string; actions: string }
type ContactRow = { id: string; name: string; email?: string; phone?: string; account?: string; actions: string }
type DealRow = { id: string; name: string; amount?: string; stage: string; owner: string; actions: string }
type TaskRow = { id: string; title: string; status: string; due?: string; assignee: string; actions: string }

const navItems = [
  { label: "Contas", value: "accounts" },
  { label: "Contatos", value: "contacts" },
  { label: "Negócios", value: "deals" },
  { label: "Tarefas", value: "tasks" },
]

export function CrmPage({ selectedOrg, apiRequest }: CrmPageProps) {
  const [active, setActive] = useState<NavValue>("accounts")
  const [dialog, setDialog] = useState<{ type: NavValue; mode: "create" | "edit"; id?: string } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
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
        actions: "",
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
        actions: "",
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
        actions: "",
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
        actions: "",
      })),
    [tasksQuery.data],
  )

  // Columns Definitions
  const renderActions = (type: NavValue) => (id: string) => (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setDialog({ type, mode: "edit", id })}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-rose-600 hover:text-rose-700"
        onClick={() => handleDelete(type, id)}
      >
        Excluir
      </Button>
    </div>
  )

  const accountColumns: Column<AccountRow>[] = [
    { key: "name", header: "Nome", className: "font-medium text-slate-900" },
    { key: "domain", header: "Domínio", render: (i) => <span className="text-emerald-600 hover:underline cursor-pointer">{i.domain}</span> },
    { key: "industry", header: "Indústria" },
    { key: "owner", header: "Owner" },
    { key: "actions", header: "", render: (item) => renderActions("accounts")(item.id), className: "text-right w-[180px]" },
  ]

  const contactColumns: Column<ContactRow>[] = [
    { key: "name", header: "Nome", className: "font-medium text-slate-900" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    { key: "account", header: "Conta Associada" },
    { key: "actions", header: "", render: (item) => renderActions("contacts")(item.id), className: "text-right w-[180px]" },
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
      ),
    },
    { key: "owner", header: "Owner" },
    { key: "actions", header: "", render: (item) => renderActions("deals")(item.id), className: "text-right w-[180px]" },
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
    { key: "actions", header: "", render: (item) => renderActions("tasks")(item.id), className: "text-right w-[180px]" },
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

  const closeDialog = () => {
    setDialog(null)
    setFormError(null)
    setFormLoading(false)
  }

  const handleDelete = async (type: NavValue, id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir?")
    if (!confirmed) return
    try {
      if (type === "accounts") await accountsQuery.remove(id)
      if (type === "contacts") await contactsQuery.remove(id)
      if (type === "deals") await dealsQuery.remove(id)
      if (type === "tasks") await tasksQuery.remove(id)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Falha ao excluir")
    }
  }

  const handleSubmit = async (values: CreateAccountInput | CreateContactInput | CreateDealInput | CreateTaskInput) => {
    if (!dialog) return
    setFormLoading(true)
    setFormError(null)
    try {
      if (dialog.type === "accounts") {
        if (dialog.mode === "edit" && dialog.id) await accountsQuery.update(dialog.id, values as CreateAccountInput)
        else await accountsQuery.create(values as CreateAccountInput)
      }
      if (dialog.type === "contacts") {
        if (dialog.mode === "edit" && dialog.id) await contactsQuery.update(dialog.id, values as CreateContactInput)
        else await contactsQuery.create(values as CreateContactInput)
      }
      if (dialog.type === "deals") {
        if (dialog.mode === "edit" && dialog.id) await dealsQuery.update(dialog.id, values as CreateDealInput)
        else await dealsQuery.create(values as CreateDealInput)
      }
      if (dialog.type === "tasks") {
        if (dialog.mode === "edit" && dialog.id) await tasksQuery.update(dialog.id, values as CreateTaskInput)
        else await tasksQuery.create(values as CreateTaskInput)
      }
      closeDialog()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Falha ao salvar")
    } finally {
      setFormLoading(false)
    }
  }

  const accountOptions = accountsQuery.data.map((item) => ({ value: item.id, label: item.name }))
  const contactOptions = contactsQuery.data.map((item) => ({ value: item.id, label: [item.firstName, item.lastName].filter(Boolean).join(" ") }))
  const stageOptions = stagesQuery.data.map((item) => ({ value: item.id, label: item.name }))

  const activeDeal = dialog?.type === "deals" && dialog.id
    ? dealsQuery.data.find((deal) => deal.id === dialog.id)
    : undefined
  const activeAccount = dialog?.type === "accounts" && dialog.id
    ? accountsQuery.data.find((account) => account.id === dialog.id)
    : undefined
  const activeContact = dialog?.type === "contacts" && dialog.id
    ? contactsQuery.data.find((contact) => contact.id === dialog.id)
    : undefined
  const activeTask = dialog?.type === "tasks" && dialog.id
    ? tasksQuery.data.find((task) => task.id === dialog.id)
    : undefined

  return (
    <AppShell
      navItems={navItems}
      active={active}
      onNavChange={(value) => setActive(value as NavValue)}
      onQuickCreate={(type) => setDialog({ type: type as NavValue, mode: "create" })}
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
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setDialog({ type: "accounts", mode: "create" })}>Nova conta</Button>}
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
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setDialog({ type: "contacts", mode: "create" })}>Novo contato</Button>}
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
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setDialog({ type: "deals", mode: "create" })}>Novo negócio</Button>}
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
          action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setDialog({ type: "tasks", mode: "create" })}>Nova tarefa</Button>}
        />
      )}

      <Dialog open={Boolean(dialog)} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent>
          {dialog ? (
            <>
              <DialogHeader>
                <DialogTitle>{dialog.mode === "create" ? "Criar" : "Editar"} {labelFor(dialog.type)}</DialogTitle>
                <DialogDescription>Preencha os campos abaixo.</DialogDescription>
              </DialogHeader>

              {dialog.type === "accounts" && (
                <AccountForm
                  initial={toAccountInitial(activeAccount)}
                  loading={formLoading}
                  error={formError}
                  onSubmit={(values) => handleSubmit(values)}
                  onCancel={closeDialog}
                />
              )}

              {dialog.type === "contacts" && (
                <ContactForm
                  initial={toContactInitial(activeContact)}
                  accounts={accountOptions}
                  loading={formLoading}
                  error={formError}
                  onSubmit={(values) => handleSubmit(values)}
                  onCancel={closeDialog}
                />
              )}

              {dialog.type === "deals" && (
                <DealForm
                  initial={toDealInitial(activeDeal)}
                  stages={stageOptions}
                  accounts={accountOptions}
                  contacts={contactOptions}
                  loading={formLoading}
                  error={formError}
                  onSubmit={(values) => handleSubmit(values)}
                  onCancel={closeDialog}
                />
              )}

              {dialog.type === "tasks" && (
                <TaskForm
                  initial={toTaskInitial(activeTask)}
                  accounts={accountOptions}
                  contacts={contactOptions}
                  deals={dealsQuery.data.map((d) => ({ value: d.id, label: d.name }))}
                  loading={formLoading}
                  error={formError}
                  onSubmit={(values) => handleSubmit(values)}
                  onCancel={closeDialog}
                />
              )}
            </>
          ) : null}
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

const labelFor = (type: NavValue) => {
  if (type === "accounts") return "conta"
  if (type === "contacts") return "contato"
  if (type === "deals") return "negócio"
  return "tarefa"
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

const normalizeString = (value?: string | null) => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

const toDateInputValue = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

type Option = { value: string; label: string }

function AccountForm({ initial, loading, error, onSubmit, onCancel }: {
  initial: CreateAccountInput
  loading: boolean
  error: string | null
  onSubmit: (values: CreateAccountInput) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<CreateAccountInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateAccountInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      name: values.name,
      domain: normalizeString(values.domain),
      industry: normalizeString(values.industry),
      size: normalizeString(values.size),
      website: normalizeString(values.website),
      phone: normalizeString(values.phone),
      ownerId: normalizeString(values.ownerId) ?? null,
    })
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={values.name} onChange={handleChange("name") as any} required />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="domain">Domínio</Label>
          <Input id="domain" value={values.domain ?? ""} onChange={handleChange("domain") as any} placeholder="acme.com" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="industry">Indústria</Label>
            <Input id="industry" value={values.industry ?? ""} onChange={handleChange("industry") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="size">Tamanho</Label>
            <Input id="size" value={values.size ?? ""} onChange={handleChange("size") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={values.website ?? ""} onChange={handleChange("website") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={values.phone ?? ""} onChange={handleChange("phone") as any} />
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}

function ContactForm({ initial, accounts, loading, error, onSubmit, onCancel }: {
  initial: CreateContactInput
  accounts: Option[]
  loading: boolean
  error: string | null
  onSubmit: (values: CreateContactInput) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<CreateContactInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateContactInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      firstName: values.firstName,
      lastName: normalizeString(values.lastName),
      email: normalizeString(values.email),
      phone: normalizeString(values.phone),
      title: normalizeString(values.title),
      accountId: normalizeString(values.accountId) ?? null,
      ownerId: normalizeString(values.ownerId) ?? null,
    })
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="firstName">Nome</Label>
            <Input id="firstName" value={values.firstName} onChange={handleChange("firstName") as any} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input id="lastName" value={values.lastName ?? ""} onChange={handleChange("lastName") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={values.email ?? ""} onChange={handleChange("email") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={values.phone ?? ""} onChange={handleChange("phone") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="title">Cargo</Label>
            <Input id="title" value={values.title ?? ""} onChange={handleChange("title") as any} />
          </div>
          <div className="grid gap-1">
            <Label>Conta</Label>
            <Select value={values.accountId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, accountId: val || undefined }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {accounts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}

function DealForm({ initial, stages, accounts, contacts, loading, error, onSubmit, onCancel }: {
  initial: CreateDealInput
  stages: Option[]
  accounts: Option[]
  contacts: Option[]
  loading: boolean
  error: string | null
  onSubmit: (values: CreateDealInput) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<CreateDealInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateDealInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const amountNumber = values.amount === undefined || values.amount === null || values.amount === ("" as any)
      ? undefined
      : Number(values.amount)

    await onSubmit({
      name: values.name,
      stageId: values.stageId,
      accountId: normalizeString(values.accountId) ?? null,
      contactId: normalizeString(values.contactId) ?? null,
      ownerId: normalizeString(values.ownerId) ?? null,
      amount: Number.isNaN(amountNumber) ? undefined : amountNumber,
      currency: normalizeString(values.currency) ?? "BRL",
      expectedClose: values.expectedClose ? new Date(values.expectedClose).toISOString() : undefined,
    })
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="deal-name">Nome</Label>
          <Input id="deal-name" value={values.name} onChange={handleChange("name") as any} required />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Etapa</Label>
            <Select value={values.stageId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, stageId: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Selecione</SelectItem>
                {stages.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" type="number" step="0.01" value={values.amount?.toString() ?? ""} onChange={handleChange("amount") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="currency">Moeda</Label>
            <Input id="currency" value={values.currency ?? "BRL"} onChange={handleChange("currency") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="expectedClose">Fechamento esperado</Label>
            <Input id="expectedClose" type="date" value={toDateInputValue(values.expectedClose)} onChange={handleChange("expectedClose") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Conta</Label>
            <Select value={values.accountId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, accountId: val || undefined }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {accounts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Contato</Label>
            <Select value={values.contactId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, contactId: val || undefined }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {contacts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}

function TaskForm({ initial, accounts, contacts, deals, loading, error, onSubmit, onCancel }: {
  initial: CreateTaskInput
  accounts: Option[]
  contacts: Option[]
  deals: Option[]
  loading: boolean
  error: string | null
  onSubmit: (values: CreateTaskInput) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<CreateTaskInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateTaskInput) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      title: values.title,
      description: normalizeString(values.description) ?? null,
      status: values.status ?? "TODO",
      priority: values.priority ?? "MEDIUM",
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      ownerId: normalizeString(values.ownerId) ?? null,
      accountId: normalizeString(values.accountId) ?? null,
      contactId: normalizeString(values.contactId) ?? null,
      dealId: normalizeString(values.dealId) ?? null,
    })
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="task-title">Título</Label>
          <Input id="task-title" value={values.title} onChange={handleChange("title") as any} required />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="task-desc">Descrição</Label>
          <Textarea id="task-desc" value={values.description ?? ""} onChange={handleChange("description") as any} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Status</Label>
            <Select value={values.status ?? "TODO"} onValueChange={(val) => setValues((prev) => ({ ...prev, status: val as CreateTaskInput["status"] }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                <SelectItem value="DONE">DONE</SelectItem>
                <SelectItem value="CANCELED">CANCELED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Prioridade</Label>
            <Select value={values.priority ?? "MEDIUM"} onValueChange={(val) => setValues((prev) => ({ ...prev, priority: val as CreateTaskInput["priority"] }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="task-due">Vencimento</Label>
            <Input id="task-due" type="date" value={toDateInputValue(values.dueDate)} onChange={handleChange("dueDate") as any} />
          </div>
          <div className="grid gap-1">
            <Label>Negócio</Label>
            <Select value={values.dealId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, dealId: val || undefined }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {deals.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="grid gap-1">
            <Label>Conta</Label>
            <Select value={values.accountId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, accountId: val || undefined }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {accounts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Contato</Label>
            <Select value={values.contactId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, contactId: val || undefined }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {contacts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="task-owner">Responsável</Label>
            <Input id="task-owner" value={values.ownerId ?? ""} onChange={handleChange("ownerId") as any} />
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}

const toAccountInitial = (item?: { name: string; domain: string | null; industry: string | null; size: string | null; website: string | null; phone: string | null; ownerId: string | null }): CreateAccountInput => ({
  name: item?.name ?? "",
  domain: item?.domain ?? "",
  industry: item?.industry ?? "",
  size: item?.size ?? "",
  website: item?.website ?? "",
  phone: item?.phone ?? "",
  ownerId: item?.ownerId ?? undefined,
})

const toContactInitial = (item?: { firstName: string; lastName: string | null; email: string | null; phone: string | null; title: string | null; accountId: string | null; ownerId: string | null }): CreateContactInput => ({
  firstName: item?.firstName ?? "",
  lastName: item?.lastName ?? "",
  email: item?.email ?? "",
  phone: item?.phone ?? "",
  title: item?.title ?? "",
  accountId: item?.accountId ?? undefined,
  ownerId: item?.ownerId ?? undefined,
})

const toDealInitial = (item?: { name: string; stageId: string; amount: string | number | null; currency: string | null; expectedClose: string | null; accountId: string | null; contactId: string | null; ownerId: string | null }): CreateDealInput => ({
  name: item?.name ?? "",
  stageId: item?.stageId ?? "",
  amount: item?.amount ?? undefined,
  currency: item?.currency ?? "BRL",
  expectedClose: item?.expectedClose ?? undefined,
  accountId: item?.accountId ?? undefined,
  contactId: item?.contactId ?? undefined,
  ownerId: item?.ownerId ?? undefined,
})

const toTaskInitial = (item?: { title: string; description: string | null; status: CreateTaskInput["status"]; priority: CreateTaskInput["priority"]; dueDate: string | null; ownerId: string | null; accountId: string | null; contactId: string | null; dealId: string | null }): CreateTaskInput => ({
  title: item?.title ?? "",
  description: item?.description ?? "",
  status: item?.status ?? "TODO",
  priority: item?.priority ?? "MEDIUM",
  dueDate: item?.dueDate ?? undefined,
  ownerId: item?.ownerId ?? undefined,
  accountId: item?.accountId ?? undefined,
  contactId: item?.contactId ?? undefined,
  dealId: item?.dealId ?? undefined,
})
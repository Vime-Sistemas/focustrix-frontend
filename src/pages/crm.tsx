import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { Building2, Users, Briefcase, CheckSquare } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { AccountForm, toAccountInitial } from "@/features/crm/accounts/account-form"
import { AccountTable } from "@/features/crm/accounts/account-table"
import { ContactForm, toContactInitial } from "@/features/crm/contacts/contact-form"
import { ContactTable } from "@/features/crm/contacts/contact-table"
import { DealForm, toDealInitial } from "@/features/crm/deals/deal-form"
import { DealTable } from "@/features/crm/deals/deal-table"
import { StageForm } from "@/features/crm/deals/stage-form"
import { TaskForm, toTaskInitial } from "@/features/crm/tasks/task-form"
import { TaskTable } from "@/features/crm/tasks/task-table"
import { DeleteConfirmDialog } from "@/features/crm/shared/delete-confirm-dialog"
import { formatCurrency, toNumber, type Option } from "@/features/crm/shared/utils"

export type NavValue = "accounts" | "contacts" | "deals" | "tasks"

export interface CrmPageProps {
  selectedOrg?: string
  apiRequest: ApiRequest
}

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
  const [stageDialogOpen, setStageDialogOpen] = useState(false)
  const [stageFormLoading, setStageFormLoading] = useState(false)
  const [stageFormError, setStageFormError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: NavValue; id: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
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

  const stats = useMemo(() => {
    const pipelineTotal = dealsQuery.data.reduce((total, deal) => total + toNumber(deal.amount), 0)
    const pendingTasks = tasksQuery.data.filter((task) => task.status !== "DONE").length

    return [
      { label: "Contas Ativas", value: accountsQuery.loading ? "--" : accountsQuery.data.length, icon: Building2 },
      { label: "Contatos", value: contactsQuery.loading ? "--" : contactsQuery.data.length, icon: Users },
      {
        label: "Pipeline Total",
        value: dealsQuery.loading ? "--" : formatCurrency(pipelineTotal, "BRL"),
        icon: Briefcase,
      },
      { label: "Tarefas Pendentes", value: tasksQuery.loading ? "--" : pendingTasks, icon: CheckSquare },
    ]
  }, [accountsQuery.loading, accountsQuery.data.length, contactsQuery.loading, contactsQuery.data.length, dealsQuery.data, dealsQuery.loading, tasksQuery.data, tasksQuery.loading])

  const closeDialog = () => {
    setDialog(null)
    setFormError(null)
    setFormLoading(false)
  }

  const createStageInline = () => setStageDialogOpen(true)

  const handleCreateStage = async (name: string) => {
    if (!name || name.trim().length === 0) return
    setStageFormLoading(true)
    setStageFormError(null)
    try {
      await apiRequest({ url: "/pipeline-stages", method: "POST", data: { name: name.trim(), order: stagesQuery.data.length + 1 } }, { withOrg: true })
      await stagesQuery.refetch()
      setStageDialogOpen(false)
    } catch (err) {
      setStageFormError(err instanceof Error ? err.message : "Falha ao criar etapa")
    } finally {
      setStageFormLoading(false)
    }
  }

  const requestDelete = (type: NavValue, id: string) => setConfirmDelete({ type, id })

  const confirmDeletion = async () => {
    if (!confirmDelete) return
    setDeleteLoading(true)
    try {
      const { type, id } = confirmDelete
      if (type === "accounts") await accountsQuery.remove(id)
      if (type === "contacts") await contactsQuery.remove(id)
      if (type === "deals") await dealsQuery.remove(id)
      if (type === "tasks") await tasksQuery.remove(id)
      setConfirmDelete(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Falha ao excluir")
    } finally {
      setDeleteLoading(false)
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

  const accountOptions: Option[] = accountsQuery.data.map((item) => ({ value: item.id, label: item.name }))
  const contactOptions: Option[] = contactsQuery.data.map((item) => ({ value: item.id, label: [item.firstName, item.lastName].filter(Boolean).join(" ") }))
  const stageOptions: Option[] = stagesQuery.data.map((item) => ({ value: item.id, label: item.name }))

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
      onQuickCreate={(type) => setDialog({ type: type === "contact" ? "contacts" : "deals", mode: "create" })}
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
        <AccountTable
          data={accountsQuery.data}
          loading={accountsQuery.loading}
          error={accountsQuery.error}
          onCreate={() => setDialog({ type: "accounts", mode: "create" })}
          onEdit={(id) => setDialog({ type: "accounts", mode: "edit", id })}
          onDelete={(id) => requestDelete("accounts", id)}
        />
      )}
      {active === "contacts" && (
        <ContactTable
          data={contactsQuery.data}
          loading={contactsQuery.loading}
          error={contactsQuery.error}
          onCreate={() => setDialog({ type: "contacts", mode: "create" })}
          onEdit={(id) => setDialog({ type: "contacts", mode: "edit", id })}
          onDelete={(id) => requestDelete("contacts", id)}
        />
      )}
      {active === "deals" && (
        <DealTable
          data={dealsQuery.data}
          stageLookup={stageLookup}
          loading={dealsQuery.loading || stagesQuery.loading}
          error={dealsQuery.error || stagesQuery.error}
          onCreate={() => setDialog({ type: "deals", mode: "create" })}
          onEdit={(id) => setDialog({ type: "deals", mode: "edit", id })}
          onDelete={(id) => requestDelete("deals", id)}
        />
      )}
      {active === "tasks" && (
        <TaskTable
          data={tasksQuery.data}
          loading={tasksQuery.loading}
          error={tasksQuery.error}
          onCreate={() => setDialog({ type: "tasks", mode: "create" })}
          onEdit={(id) => setDialog({ type: "tasks", mode: "edit", id })}
          onDelete={(id) => requestDelete("tasks", id)}
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
                  createStage={createStageInline}
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
      
      <Dialog open={stageDialogOpen} onOpenChange={(open) => (!open ? setStageDialogOpen(false) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar etapa</DialogTitle>
            <DialogDescription>Adicione uma nova etapa ao pipeline.</DialogDescription>
          </DialogHeader>
          <StageForm
            loading={stageFormLoading}
            error={stageFormError}
            onSubmit={async (name) => await handleCreateStage(name)}
            onCancel={() => setStageDialogOpen(false)}
          />
          <DialogFooter />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={Boolean(confirmDelete)}
        loading={deleteLoading}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeletion}
      />
    </AppShell>
  )
}

const labelFor = (type: NavValue) => {
  if (type === "accounts") return "conta"
  if (type === "contacts") return "contato"
  if (type === "deals") return "negócio"
  return "tarefa"
}
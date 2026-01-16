import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/components/data-table"
import type { TaskDto } from "@/hooks/use-crm-resources"
import { formatDate } from "../shared/utils"

type TaskRow = { id: string; title: string; status: string; due?: string; assignee: string; actions: string }

interface TaskTableProps {
  data: TaskDto[]
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskTable({ data, loading, error, onCreate, onEdit, onDelete }: TaskTableProps) {
  const rows: TaskRow[] = useMemo(
    () =>
      data.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        due: task.dueDate ? formatDate(task.dueDate) : "—",
        assignee: task.ownerId ?? "—",
        actions: "",
      })),
    [data],
  )

  const renderActions = (id: string) => (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(id)}>
        Editar
      </Button>
      <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={() => onDelete(id)}>
        Excluir
      </Button>
    </div>
  )

  const columns: Column<TaskRow>[] = [
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
    { key: "actions", header: "", render: (item) => renderActions(item.id), className: "text-right w-[180px]" },
  ]

  const empty = error ? <span className="text-sm text-rose-600">{error}</span> : undefined

  return (
    <DataTable
      title="Minhas Tarefas"
      description="Atividades pendentes."
      columns={columns}
      data={rows}
      loading={loading}
      empty={empty}
      action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onCreate}>Nova tarefa</Button>}
    />
  )
}

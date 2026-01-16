import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, type Column } from "@/components/data-table"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Timer, 
  ArrowUp, 
  ArrowRight, 
  ArrowDown, 
  LayoutList, 
  KanbanSquare,
  Building2,
  Briefcase,
  User,
  Plus
} from "lucide-react"
import type { TaskDto } from "@/hooks/use-crm-resources"
import { formatDate } from "../shared/utils"

// Extensão do tipo para facilitar renderização
type TaskRow = TaskDto & { priorityLabel: string }

interface TaskTableProps {
  data: TaskDto[]
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskTable({ data, loading, error, onCreate, onEdit, onDelete }: TaskTableProps) {
  const [viewMode, setViewMode] = useState<"list" | "board">("list")

  const rows: TaskRow[] = useMemo(() => data.map(t => ({ ...t, priorityLabel: t.priority })), [data])

  // --- Helpers Visuais ---

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH": return <ArrowUp size={14} className="text-red-500" />
      case "LOW": return <ArrowDown size={14} className="text-slate-400" />
      default: return <ArrowRight size={14} className="text-amber-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
      TODO: "bg-slate-100 text-slate-600 border-slate-200",
      DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELED: "bg-red-50 text-red-600 border-red-200",
    }
    const labels = {
      IN_PROGRESS: "Em Andamento",
      TODO: "A Fazer",
      DONE: "Concluído",
      CANCELED: "Cancelado"
    }
    return (
      <Badge variant="outline" className={`font-normal ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  // --- Definição das Colunas (Modo Lista) ---

  const columns: Column<TaskRow>[] = [
    {
      key: "title",
      header: "Tarefa",
      className: "w-[350px]",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div title={`Prioridade: ${row.priority}`} className="w-4 flex items-center justify-center">
              {getPriorityIcon(row.priority)}
            </div>
            <span className={`font-medium ${row.status === 'DONE' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                {row.title}
            </span>
          </div>
          {/* Context Icons (Indicam vínculos) */}
          <div className="flex items-center gap-3 pl-6">
             {row.accountId && (
               <span title="Vinculado a Conta" className="flex items-center">
                 <Building2 size={12} className="text-slate-400" />
               </span>
             )}
             {row.dealId && (
               <span title="Vinculado a Negócio" className="flex items-center">
                 <Briefcase size={12} className="text-slate-400" />
               </span>
             )}
             {row.contactId && (
               <span title="Vinculado a Contato" className="flex items-center">
                 <User size={12} className="text-slate-400" />
               </span>
             )}
             {row.description && <span className="text-xs text-slate-400 truncate max-w-[260px]">{row.description}</span>}
          </div>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: "dueDate",
      header: "Vencimento",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
           <Calendar size={14} className="text-slate-400" />
           <span>{row.dueDate ? formatDate(row.dueDate) : "—"}</span>
        </div>
      )
    },
    {
      key: "ownerId",
      header: "Resp.",
      render: () => (
        <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-100">
            US
        </div>
      )
    },
    {
      key: "id",
      header: "",
      className: "w-[50px]",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.id)}>
              <Pencil className="mr-2 h-4 w-4 text-slate-500" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(row.id)} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">
              <Trash className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ]

  // --- Renderização do Kanban (Modo Quadro) ---

  const renderBoard = () => {
    const cols = [
        { id: "TODO", label: "A Fazer", icon: Circle, color: "text-slate-500" },
        { id: "IN_PROGRESS", label: "Em Andamento", icon: Timer, color: "text-blue-500" },
        { id: "DONE", label: "Concluído", icon: CheckCircle2, color: "text-emerald-500" }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pb-10 overflow-x-auto">
            {cols.map(col => {
                const tasksInCol = rows.filter(t => t.status === col.id)
                const Icon = col.icon
                
                return (
                    <div key={col.id} className="flex flex-col gap-4">
                        {/* Header da Coluna */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-2 font-medium text-slate-700">
                                <Icon size={16} className={col.color} />
                                {col.label}
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                    {tasksInCol.length}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900" onClick={onCreate}>
                                <Plus size={14} />
                            </Button>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-3 min-h-[200px]">
                            {tasksInCol.map(task => (
                                <div key={task.id} className="group relative bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer" onClick={() => onEdit(task.id)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {getPriorityIcon(task.priority)}
                                            <span className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {task.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            {task.dueDate && (
                                                <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500' : ''}`}>
                                                    <Calendar size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'})}
                                                </div>
                                            )}
                                        </div>
                                        {/* Avatar Mini */}
                                        <div className="h-5 w-5 rounded-full bg-slate-100 text-[9px] flex items-center justify-center text-slate-500 font-bold">
                                            US
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tasksInCol.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300 text-sm">
                                    Vazio
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
  }

  // --- Wrapper Principal ---

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>
  }

  return (
    <div className="space-y-4">
        {/* Header da Tabela com Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">Minhas Tarefas</h2>
                <p className="text-sm text-slate-500">Gerencie suas atividades diárias.</p>
            </div>
            
            <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "board")} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="list" className="flex items-center gap-2"><LayoutList size={14} /> Lista</TabsTrigger>
                        <TabsTrigger value="board" className="flex items-center gap-2"><KanbanSquare size={14} /> Quadro</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button size="sm" onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus size={16} className="mr-1" /> Nova
                </Button>
            </div>
        </div>

        {/* Renderização Condicional */}
        {viewMode === "list" ? (
            <DataTable
                title="" // Título removido pois já está no header customizado acima
                columns={columns}
                data={rows}
                loading={loading}
                empty={
                    <div className="text-center py-10">
                        <p className="text-slate-500">Nenhuma tarefa encontrada.</p>
                    </div>
                }
            />
        ) : (
            renderBoard()
        )}
    </div>
  )
}
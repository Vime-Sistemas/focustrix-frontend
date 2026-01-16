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
import type { TaskDto, AccountDto, ContactDto, DealDto } from "@/hooks/use-crm-resources"
import { formatDate } from "../shared/utils"

// Tipos para as props
interface TaskTableProps {
  data: TaskDto[]
  // Novos dados para o "Lookup"
  accounts: AccountDto[]
  contacts: ContactDto[]
  deals: DealDto[]
  // ---
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskTable({ data, accounts, contacts, deals, loading, error, onCreate, onEdit, onDelete }: TaskTableProps) {
  const [viewMode, setViewMode] = useState<"list" | "board">("list")

  // 1. CRIANDO OS LOOKUP MAPS (Performance: O(1) de acesso)
  // Transformamos arrays em Maps onde a chave é o ID e o valor é o Nome
  const lookups = useMemo(() => {
    return {
      accounts: new Map(accounts.map(a => [a.id, a.name])),
      contacts: new Map(contacts.map(c => [c.id, [c.firstName, c.lastName].filter(Boolean).join(" ")])),
      deals: new Map(deals.map(d => [d.id, d.name])),
      // Mapeamento de donos (Owner)
      // Como a API de tarefas retorna o ownerId, você poderia passar a lista de usuários aqui também.
      // Por enquanto, vou simular uma formatação visual.
    }
  }, [accounts, contacts, deals])

  // Helpers de Renderização
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

  // Componente Auxiliar para mostrar o Contexto (Conta, Negócio, Contato)
  // Isso evita repetição de código na Lista e no Kanban
  const TaskContextBadges = ({ task }: { task: TaskDto }) => {
    const accountName = task.accountId ? lookups.accounts.get(task.accountId) : null
    const dealName = task.dealId ? lookups.deals.get(task.dealId) : null
    const contactName = task.contactId ? lookups.contacts.get(task.contactId) : null

    if (!accountName && !dealName && !contactName) return null

    return (
      <div className="flex flex-wrap items-center gap-2 mt-1.5">
        {dealName && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title="Negócio">
            <Briefcase size={10} />
            <span className="truncate max-w-[120px]">{dealName}</span>
          </div>
        )}
        {accountName && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 border border-transparent px-1.5 py-0.5" title="Conta">
            <Building2 size={10} />
            <span className="truncate max-w-[120px]">{accountName}</span>
          </div>
        )}
        {contactName && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 border border-transparent px-1.5 py-0.5" title="Contato">
            <User size={10} />
            <span className="truncate max-w-[100px]">{contactName}</span>
          </div>
        )}
      </div>
    )
  }

  // --- Colunas (Modo Lista) ---
  const columns: Column<TaskDto>[] = [
    {
      key: "title",
      header: "Tarefa & Contexto",
      className: "w-[400px]",
      render: (row) => (
        <div className="flex flex-col gap-0.5 py-1">
          <div className="flex items-start gap-2">
            <div title={`Prioridade: ${row.priority}`} className="mt-1">{getPriorityIcon(row.priority)}</div>
            <div>
                <span className={`font-medium text-sm ${row.status === 'DONE' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                    {row.title}
                </span>
                {row.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{row.description}</p>
                )}
            </div>
          </div>
          
          {/* Aqui usamos o helper para mostrar os nomes reais */}
          <div className="pl-6">
            <TaskContextBadges task={row} />
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
        <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold border border-slate-200" title="Responsável">
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

  // --- Kanban (Modo Quadro) ---
  const renderBoard = () => {
    const cols = [
        { id: "TODO", label: "A Fazer", icon: Circle, color: "text-slate-500" },
        { id: "IN_PROGRESS", label: "Em Andamento", icon: Timer, color: "text-blue-500" },
        { id: "DONE", label: "Concluído", icon: CheckCircle2, color: "text-emerald-500" }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pb-10 overflow-x-auto">
            {cols.map(col => {
                const tasksInCol = data.filter(t => t.status === col.id)
                const Icon = col.icon
                
                return (
                    <div key={col.id} className="flex flex-col gap-4">
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

                        <div className="flex flex-col gap-3 min-h-[150px]">
                            {tasksInCol.map(task => (
                                <div key={task.id} className="group relative bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col gap-2" onClick={() => onEdit(task.id)}>
                                    
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5">{getPriorityIcon(task.priority)}</div>
                                        <span className={`text-sm font-medium leading-tight ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    
                                    {/* Mostra os nomes reais no Kanban também */}
                                    <TaskContextBadges task={task} />

                                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            {task.dueDate && (
                                                <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500' : ''}`}>
                                                    <Calendar size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'})}
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-5 w-5 rounded-full bg-slate-100 text-[9px] flex items-center justify-center text-slate-500 font-bold border border-slate-200">
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

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>
  }

  return (
    <div className="space-y-4">
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

        {viewMode === "list" ? (
            <DataTable
                title=""
                columns={columns}
                data={data}
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
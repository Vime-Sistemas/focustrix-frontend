import { useMemo } from "react"
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
import { DataTable, type Column } from "@/components/data-table"
import { MoreHorizontal, Pencil, Trash, Calendar, DollarSign, KanbanSquare, ArrowUpRight } from "lucide-react"
import type { DealDto } from "@/hooks/use-crm-resources"
import { formatCurrency } from "../shared/utils"

// Tipo estendido para renderização
type DealRow = DealDto & { formattedAmount: string; stageName: string }

interface DealTableProps {
  data: DealDto[]
  stageLookup: Map<string, string>
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function DealTable({ data, stageLookup, loading, error, onCreate, onEdit, onDelete }: DealTableProps) {
  
  const rows: DealRow[] = useMemo(() => {
    return data.map((deal) => ({
        ...deal,
        formattedAmount: formatCurrency(deal.amount, deal.currency ?? "BRL"),
        stageName: stageLookup.get(deal.stageId) ?? "Desconhecido",
    }))
  }, [data, stageLookup])

  // Função para formatar data (Ex: 01 Mar, 2026)
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    })
  }

  const columns: Column<DealRow>[] = [
    {
      key: "name",
      header: "Oportunidade",
      className: "w-[300px]",
      render: (row) => (
        <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-base">{row.name}</span>
            {/* Se tivéssemos o nome da conta aqui (lookup), seria ideal exibir. 
                Como temos apenas o ID, exibimos o ID de forma discreta ou ocultamos */}
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[200px]">
                Ref: {row.id.slice(-6).toUpperCase()}
            </span>
        </div>
      )
    },
    {
      key: "amount",
      header: "Valor Estimado",
      render: (row) => (
        <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                <DollarSign size={14} />
            </div>
            <span className="font-mono font-medium text-slate-700 tabular-nums text-sm">
                {row.formattedAmount}
            </span>
        </div>
      )
    },
    {
      key: "stageId",
      header: "Etapa & Status",
      render: (row) => (
        <div className="flex flex-col items-start gap-1.5">
             <Badge variant="outline" className="bg-white text-slate-700 border-slate-300 font-medium">
                {row.stageName}
             </Badge>
             {/* Indicador de Status do sistema (OPEN/WON/LOST) */}
             <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${row.status === 'OPEN' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {row.status}
                </span>
             </div>
        </div>
      )
    },
    {
      key: "expectedClose",
      header: "Previsão",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span>{formatDate(row.expectedClose)}</span>
        </div>
      )
    },
    {
        key: "ownerId",
        header: "Resp.",
        render: () => (
            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold" title="Responsável">
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
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.id)}>
              <Pencil className="mr-2 h-4 w-4 text-slate-500" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Mover etapa")}>
              <ArrowUpRight className="mr-2 h-4 w-4 text-slate-500" />
              Mover etapa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                onClick={() => onDelete(row.id)}
                className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ]

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-3">
            <KanbanSquare className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Sem negócios ativos</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
            O pipeline está vazio. Crie uma oportunidade para começar a acompanhar suas vendas.
        </p>
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Criar Negócio
        </Button>
    </div>
  )

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 border border-red-200 text-center">
          <p className="text-sm text-red-600">Erro ao carregar pipeline: {error}</p>
      </div>
    )
  }

  return (
    <DataTable
      title="Pipeline de Vendas"
      description="Gerencie suas oportunidades e previsões de fechamento."
      columns={columns}
      data={rows}
      loading={loading}
      empty={emptyState}
      action={
        rows.length > 0 ? (
            <Button size="sm" onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <span className="mr-1">+</span> Novo negócio
            </Button>
        ) : null
      }
    />
  )
}
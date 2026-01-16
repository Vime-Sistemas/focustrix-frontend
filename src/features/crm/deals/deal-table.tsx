import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/components/data-table"
import type { DealDto } from "@/hooks/use-crm-resources"
import { formatCurrency } from "../shared/utils"

type DealRow = { id: string; name: string; amount?: string; stage: string; owner: string; actions: string }

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
  const rows: DealRow[] = useMemo(
    () =>
      data.map((deal) => ({
        id: deal.id,
        name: deal.name,
        amount: formatCurrency(deal.amount, deal.currency ?? "USD"),
        stage: stageLookup.get(deal.stageId) ?? "—",
        owner: deal.ownerId ?? "—",
        actions: "",
      })),
    [data, stageLookup],
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

  const columns: Column<DealRow>[] = [
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
    { key: "actions", header: "", render: (item) => renderActions(item.id), className: "text-right w-[180px]" },
  ]

  const empty = error ? <span className="text-sm text-rose-600">{error}</span> : undefined

  return (
    <DataTable
      title="Pipeline"
      description="Oportunidades ativas."
      columns={columns}
      data={rows}
      loading={loading}
      empty={empty}
      action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onCreate}>Novo negócio</Button>}
    />
  )
}

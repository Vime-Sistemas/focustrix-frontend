import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/components/data-table"
import type { AccountDto } from "@/hooks/use-crm-resources"

type AccountRow = { id: string; name: string; domain?: string; industry?: string; owner: string; actions: string }

interface AccountTableProps {
  data: AccountDto[]
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function AccountTable({ data, loading, error, onCreate, onEdit, onDelete }: AccountTableProps) {
  const rows: AccountRow[] = useMemo(
    () =>
      data.map((account) => ({
        id: account.id,
        name: account.name,
        domain: account.domain ?? "—",
        industry: account.industry ?? "—",
        owner: account.ownerId ?? "—",
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

  const columns: Column<AccountRow>[] = [
    { key: "name", header: "Nome", className: "font-medium text-slate-900" },
    { key: "domain", header: "Domínio", render: (i) => <span className="text-emerald-600 hover:underline cursor-pointer">{i.domain}</span> },
    { key: "industry", header: "Indústria" },
    { key: "owner", header: "Owner" },
    { key: "actions", header: "", render: (item) => renderActions(item.id), className: "text-right w-[180px]" },
  ]

  const empty = error ? <span className="text-sm text-rose-600">{error}</span> : undefined

  return (
    <DataTable
      title="Contas"
      description="Base de clientes e prospects."
      columns={columns}
      data={rows}
      loading={loading}
      empty={empty}
      action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onCreate}>Nova conta</Button>}
    />
  )
}

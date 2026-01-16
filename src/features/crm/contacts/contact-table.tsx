import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/components/data-table"
import type { ContactDto } from "@/hooks/use-crm-resources"

type ContactRow = { id: string; name: string; email?: string; phone?: string; account?: string; actions: string }

interface ContactTableProps {
  data: ContactDto[]
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ContactTable({ data, loading, error, onCreate, onEdit, onDelete }: ContactTableProps) {
  const rows: ContactRow[] = useMemo(
    () =>
      data.map((contact) => ({
        id: contact.id,
        name: [contact.firstName, contact.lastName].filter(Boolean).join(" "),
        email: contact.email ?? "—",
        phone: contact.phone ?? "—",
        account: contact.accountId ?? "—",
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

  const columns: Column<ContactRow>[] = [
    { key: "name", header: "Nome", className: "font-medium text-slate-900" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    { key: "account", header: "Conta Associada" },
    { key: "actions", header: "", render: (item) => renderActions(item.id), className: "text-right w-[180px]" },
  ]

  const empty = error ? <span className="text-sm text-rose-600">{error}</span> : undefined

  return (
    <DataTable
      title="Contatos"
      description="Stakeholders e decisores."
      columns={columns}
      data={rows}
      loading={loading}
      empty={empty}
      action={<Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onCreate}>Novo contato</Button>}
    />
  )
}

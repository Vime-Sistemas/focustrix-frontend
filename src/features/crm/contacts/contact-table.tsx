import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { DataTable, type Column } from "@/components/data-table"
import { MoreHorizontal, Pencil, Trash, Mail, Phone, User, Copy, Building2 } from "lucide-react"
import type { ContactDto } from "@/hooks/use-crm-resources"

// Criamos um tipo estendido para facilitar a renderização
type ContactRow = ContactDto & { fullName: string; initials: string }

interface ContactTableProps {
  data: ContactDto[]
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ContactTable({ data, loading, error, onCreate, onEdit, onDelete }: ContactTableProps) {
  
  // Pré-processamento dos dados para facilitar a renderização
  const rows: ContactRow[] = useMemo(() => {
    return data.map((contact) => {
        const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ")
        const initials = ((contact.firstName?.[0] || "") + (contact.lastName?.[0] || "")).toUpperCase()
        return {
            ...contact,
            fullName,
            initials: initials || "??"
        }
    })
  }, [data])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Se tiver toast: toast.success("Email copiado!")
    console.log("Copiado:", text)
  }

  const columns: Column<ContactRow>[] = [
    {
      key: "fullName",
      header: "Nome & Cargo",
      className: "w-[300px]",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-xs">
              {row.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 leading-tight">{row.fullName}</span>
            {row.title ? (
                <span className="text-xs text-slate-500 mt-0.5">{row.title}</span>
            ) : (
                <span className="text-[10px] text-slate-400 mt-0.5 italic">Sem cargo definido</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "email",
      header: "Canais de Contato",
      render: (row) => (
        <div className="flex flex-col gap-1.5">
            {row.email ? (
                <div className="flex items-center gap-2 text-sm text-slate-700 group cursor-pointer" onClick={() => copyToClipboard(row.email!)} title="Clique para copiar">
                    <Mail size={13} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    <span className="group-hover:text-slate-900 transition-colors">{row.email}</span>
                </div>
            ) : (
                <span className="text-xs text-slate-400 flex items-center gap-2"><Mail size={13}/> —</span>
            )}
            
            {row.phone ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={13} className="text-slate-400" />
                    <span>{row.phone}</span>
                </div>
            ) : null}
        </div>
      )
    },
    {
      key: "accountId",
      header: "Empresa",
      render: (row) => (
        <div className="flex items-center">
            {row.accountId ? (
                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-normal gap-1.5 pl-2">
                    <Building2 size={12} className="text-slate-400" />
                    {/* Idealmente aqui mostraríamos o NOME da conta, não o ID. 
                        Como o dado bruto é o ID, deixamos assim ou usamos um placeholder visual */}
                    <span className="truncate max-w-[120px]">Ver Empresa</span>
                </Badge>
            ) : (
                <span className="text-xs text-slate-400">—</span>
            )}
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
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.id)}>
              <Pencil className="mr-2 h-4 w-4 text-slate-500" />
              Editar contato
            </DropdownMenuItem>
            {row.email && (
                <DropdownMenuItem onClick={() => copyToClipboard(row.email!)}>
                <Copy className="mr-2 h-4 w-4 text-slate-500" />
                Copiar email
                </DropdownMenuItem>
            )}
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
            <User className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Sua lista está vazia</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
            Adicione contatos para vincular a contas e começar a negociar.
        </p>
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Adicionar contato
        </Button>
    </div>
  )

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 border border-red-200 text-center">
          <p className="text-sm text-red-600">Erro ao carregar contatos: {error}</p>
      </div>
    )
  }

  return (
    <DataTable
      title="Contatos"
      description="Pessoas-chave e decisores das suas contas."
      columns={columns}
      data={rows}
      loading={loading}
      empty={emptyState}
      action={
        rows.length > 0 ? (
            <Button size="sm" onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <span className="mr-1">+</span> Novo contato
            </Button>
        ) : null
      }
    />
  )
}
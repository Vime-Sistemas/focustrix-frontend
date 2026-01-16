import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { DataTable, type Column } from "@/components/data-table"
import { MoreHorizontal, Pencil, Trash, Globe, Phone, ExternalLink, Building2 } from "lucide-react"
import type { AccountDto } from "@/hooks/use-crm-resources"

interface AccountTableProps {
  data: AccountDto[]
  loading: boolean
  error?: string | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function AccountTable({ data, loading, error, onCreate, onEdit, onDelete }: AccountTableProps) {
  
  // Definição das Colunas
  const columns: Column<AccountDto>[] = [
    {
      key: "name",
      header: "Empresa",
      className: "w-[300px]",
      render: (account) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold text-xs">
              {account.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 leading-tight">{account.name}</span>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
               {account.domain ? (
                 <a 
                    href={account.domain.startsWith('http') ? account.domain : `https://${account.domain}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-emerald-600 hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                 >
                    {account.domain} <ExternalLink size={9} />
                 </a>
               ) : (
                 <span>Sem domínio</span>
               )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "industry",
      header: "Segmento & Tamanho",
      render: (account) => (
        <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-slate-700">{account.industry || "—"}</span>
            {account.size && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-slate-50 text-slate-600 border-slate-200">
                    {account.size}
                </Badge>
            )}
        </div>
      )
    },
    {
      key: "phone",
      header: "Contato",
      render: (account) => (
        <div className="flex flex-col gap-1">
            {account.phone ? (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Phone size={13} className="text-slate-400" />
                    <span>{account.phone}</span>
                </div>
            ) : (
                <span className="text-xs text-slate-400">—</span>
            )}
            {account.website && account.website !== account.domain && (
                 <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Globe size={12} />
                    <a href={account.website} target="_blank" rel="noreferrer" className="hover:underline">Website</a>
                </div>
            )}
        </div>
      )
    },
    {
        key: "ownerId",
        header: "Responsável",
        render: (account) => (
            // Como só temos o ID, mostramos um placeholder visual.
            // Idealmente aqui você faria um lookup do nome do usuário.
            <div className="flex items-center gap-2" title={`ID: ${account.ownerId}`}>
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-medium">
                    {/* Placeholder para Owner */}
                    US
                </div>
            </div>
        )
    },
    {
      key: "id", // Usando ID como chave para a coluna de ações
      header: "",
      className: "w-[50px]",
      render: (account) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(account.id)}>
              <Pencil className="mr-2 h-4 w-4 text-slate-500" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`https://${account.domain}`, '_blank')} disabled={!account.domain}>
              <Globe className="mr-2 h-4 w-4 text-slate-500" />
              Visitar site
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                onClick={() => onDelete(account.id)}
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
            <Building2 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Nenhuma conta encontrada</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
            Comece adicionando as empresas que você está prospectando ou atendendo.
        </p>
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Adicionar primeira conta
        </Button>
    </div>
  )

  if (error) {
      return (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-center">
            <p className="text-sm text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      )
  }

  return (
    <DataTable
      title="Contas"
      description="Gerencie sua base de clientes e organizações."
      columns={columns}
      data={data}
      loading={loading}
      empty={emptyState}
      action={
        // Só mostra o botão superior se tiver dados, senão mostra o emptyState bonito
        data.length > 0 ? (
            <Button size="sm" onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <span className="mr-1">+</span> Nova conta
            </Button>
        ) : null
      }
    />
  )
}
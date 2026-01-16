import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckSquare, Calendar, Flag, Briefcase, Building2, User, Link as LinkIcon } from "lucide-react"
import type { CreateTaskInput } from "@/hooks/use-crm-resources"
import { normalizeString, toDateInputValue, type Option } from "../shared/utils"

interface TaskFormProps {
  initial: CreateTaskInput
  accounts: Option[]
  contacts: Option[]
  deals: Option[]
  loading: boolean
  error: string | null
  onSubmit: (values: CreateTaskInput) => Promise<void>
  onCancel: () => void
}

export function TaskForm({ initial, accounts, contacts, deals, loading, error, onSubmit, onCancel }: TaskFormProps) {
  const [values, setValues] = useState<CreateTaskInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateTaskInput) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSelectChange = (field: keyof CreateTaskInput, value: string) => {
     // Tratamento especial para enums vs strings opcionais
     const finalValue = value === "__none" ? undefined : value;
     setValues((prev) => ({ ...prev, [field]: finalValue }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      title: values.title,
      description: normalizeString(values.description) ?? null,
      status: values.status ?? "TODO",
      priority: values.priority ?? "MEDIUM",
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      ownerId: normalizeString(values.ownerId) ?? null,
      accountId: normalizeString(values.accountId) ?? null,
      contactId: normalizeString(values.contactId) ?? null,
      dealId: normalizeString(values.dealId) ?? null,
    })
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      
      {/* Cabeçalho da Tarefa */}
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="task-title" className="text-slate-600 font-medium">O que precisa ser feito?</Label>
            <div className="relative">
                <CheckSquare size={18} className="absolute left-3 top-3.5 text-emerald-500" />
                <Input 
                    id="task-title" 
                    value={values.title} 
                    onChange={handleChange("title")} 
                    required 
                    placeholder="Ex: Enviar proposta revisada"
                    className="pl-10 text-lg h-12 focus-visible:ring-emerald-500 font-medium shadow-sm"
                />
            </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="task-desc" className="text-slate-600">Descrição / Detalhes</Label>
            <Textarea 
                id="task-desc" 
                value={values.description ?? ""} 
                onChange={handleChange("description")} 
                placeholder="Adicione notas, links ou instruções..."
                className="min-h-[80px] focus-visible:ring-emerald-500 resize-none"
            />
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Barra de Controle (Status, Prioridade, Data) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Status</Label>
            <Select 
                value={values.status ?? "TODO"} 
                onValueChange={(val) => handleSelectChange("status", val)}
            >
              <SelectTrigger className="focus:ring-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">A Fazer</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                <SelectItem value="DONE">Concluído</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wide flex items-center gap-1">
                <Flag size={12} /> Prioridade
            </Label>
            <Select 
                value={values.priority ?? "MEDIUM"} 
                onValueChange={(val) => handleSelectChange("priority", val)}
            >
              <SelectTrigger className="focus:ring-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW"><span className="text-slate-600">Baixa</span></SelectItem>
                <SelectItem value="MEDIUM"><span className="text-blue-600 font-medium">Média</span></SelectItem>
                <SelectItem value="HIGH"><span className="text-amber-600 font-bold">Alta</span></SelectItem>
              </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="task-due" className="text-xs font-semibold uppercase text-slate-500 tracking-wide flex items-center gap-1">
                <Calendar size={12} /> Vencimento
            </Label>
            <Input 
                id="task-due" 
                type="date" 
                value={toDateInputValue(values.dueDate)} 
                onChange={handleChange("dueDate")} 
                className="focus-visible:ring-emerald-500"
            />
        </div>
      </div>

      {/* Painel de Contexto (Vínculos) */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <LinkIcon size={14} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Contexto Vinculado</h3>
         </div>

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
                <Label className="text-slate-600 text-xs flex items-center gap-1">
                    <Briefcase size={12} /> Negócio Relacionado
                </Label>
                <Select value={values.dealId ?? ""} onValueChange={(val) => handleSelectChange("dealId", val)}>
                  <SelectTrigger className="bg-white h-9 text-sm">
                    <SelectValue placeholder="Selecione um negócio..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none" className="text-slate-400">Nenhum</SelectItem>
                    {deals.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-600 text-xs flex items-center gap-1">
                    <Building2 size={12} /> Conta
                </Label>
                <Select value={values.accountId ?? ""} onValueChange={(val) => handleSelectChange("accountId", val)}>
                  <SelectTrigger className="bg-white h-9 text-sm">
                    <SelectValue placeholder="Selecione a conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none" className="text-slate-400">Nenhuma</SelectItem>
                    {accounts.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-600 text-xs flex items-center gap-1">
                    <User size={12} /> Contato
                </Label>
                <Select value={values.contactId ?? ""} onValueChange={(val) => handleSelectChange("contactId", val)}>
                  <SelectTrigger className="bg-white h-9 text-sm">
                    <SelectValue placeholder="Selecione o contato..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none" className="text-slate-400">Nenhum</SelectItem>
                    {contacts.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            
            {/* Responsável (Input simples mantido conforme props, mas estilizado) */}
            <div className="space-y-2">
                <Label htmlFor="task-owner" className="text-slate-600 text-xs">ID Responsável</Label>
                <Input 
                    id="task-owner" 
                    value={values.ownerId ?? ""} 
                    onChange={handleChange("ownerId")} 
                    className="bg-white h-9 text-sm"
                    placeholder="Opcional"
                />
            </div>
         </div>
      </div>

      {error && (
         <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
            {error}
         </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-600 hover:text-slate-900">
            Cancelar
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-6" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Tarefa"}
        </Button>
      </div>
    </form>
  )
}

export const toTaskInitial = (item?: { title: string; description: string | null; status: CreateTaskInput["status"]; priority: CreateTaskInput["priority"]; dueDate: string | null; ownerId: string | null; accountId: string | null; contactId: string | null; dealId: string | null }): CreateTaskInput => ({
  title: item?.title ?? "",
  description: item?.description ?? "",
  status: item?.status ?? "TODO",
  priority: item?.priority ?? "MEDIUM",
  dueDate: item?.dueDate ?? undefined,
  ownerId: item?.ownerId ?? undefined,
  accountId: item?.accountId ?? undefined,
  contactId: item?.contactId ?? undefined,
  dealId: item?.dealId ?? undefined,
})
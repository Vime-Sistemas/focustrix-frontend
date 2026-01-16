import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, Briefcase, Building2, UserCircle2 } from "lucide-react"
import type { CreateContactInput } from "@/hooks/use-crm-resources"
import { normalizeString, type Option } from "../shared/utils"

interface ContactFormProps {
  initial: CreateContactInput
  accounts: Option[]
  loading: boolean
  error: string | null
  onSubmit: (values: CreateContactInput) => Promise<void>
  onCancel: () => void
}

export function ContactForm({ initial, accounts, loading, error, onSubmit, onCancel }: ContactFormProps) {
  const [values, setValues] = useState<CreateContactInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateContactInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSelectChange = (field: keyof CreateContactInput, value: string) => {
    setValues((prev) => ({ 
        ...prev, 
        [field]: value === "__none" ? undefined : value 
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      firstName: values.firstName,
      lastName: normalizeString(values.lastName),
      email: normalizeString(values.email),
      phone: normalizeString(values.phone),
      title: normalizeString(values.title),
      accountId: normalizeString(values.accountId) ?? null,
      ownerId: normalizeString(values.ownerId) ?? null,
    })
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      
      {/* Header / Avatar Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300 border border-slate-200">
            <UserCircle2 size={40} />
        </div>
        <div>
            <h3 className="text-sm font-medium text-slate-900">Dados Pessoais</h3>
            <p className="text-xs text-slate-500">Informações básicas de identificação.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-slate-600">Nome</Label>
            <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                    id="firstName" 
                    value={values.firstName} 
                    onChange={handleChange("firstName")} 
                    required 
                    className="pl-9 focus-visible:ring-emerald-500"
                    placeholder="Ex: Ana"
                />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-slate-600">Sobrenome</Label>
            <Input 
                id="lastName" 
                value={values.lastName ?? ""} 
                onChange={handleChange("lastName")}
                className="focus-visible:ring-emerald-500" 
                placeholder="Ex: Silva"
            />
          </div>
        </div>

        {/* Contact Info 

[Image of Contact Form Layout]
 */} 
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-600">Email Corporativo</Label>
            <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                    id="email" 
                    type="email" 
                    value={values.email ?? ""} 
                    onChange={handleChange("email")} 
                    className="pl-9 focus-visible:ring-emerald-500"
                    placeholder="nome@empresa.com"
                />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-600">Telefone / Celular</Label>
            <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                    id="phone" 
                    value={values.phone ?? ""} 
                    onChange={handleChange("phone")} 
                    className="pl-9 focus-visible:ring-emerald-500"
                    placeholder="+55 (11) 99999-9999"
                />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 my-2" />

      {/* Professional Context */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Contexto Profissional</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-600 flex items-center gap-2">
                <Briefcase size={14} /> Cargo / Função
            </Label>
            <Input 
                id="title" 
                value={values.title ?? ""} 
                onChange={handleChange("title")} 
                className="bg-white focus-visible:ring-emerald-500"
                placeholder="Ex: CTO, Gerente de Vendas"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 flex items-center gap-2">
                <Building2 size={14} /> Empresa (Conta)
            </Label>
            <Select 
                value={values.accountId ?? ""} 
                onValueChange={(val) => handleSelectChange("accountId", val)}
            >
              <SelectTrigger className="w-full bg-white focus:ring-emerald-500">
                <SelectValue placeholder="Vincular a uma organização..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none" className="text-slate-400">Sem vínculo</SelectItem>
                {accounts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-600 hover:text-slate-900">
            Cancelar
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Contato"}
        </Button>
      </div>
    </form>
  )
}

export const toContactInitial = (item?: { firstName: string; lastName: string | null; email: string | null; phone: string | null; title: string | null; accountId: string | null; ownerId: string | null }): CreateContactInput => ({
  firstName: item?.firstName ?? "",
  lastName: item?.lastName ?? "",
  email: item?.email ?? "",
  phone: item?.phone ?? "",
  title: item?.title ?? "",
  accountId: item?.accountId ?? undefined,
  ownerId: item?.ownerId ?? undefined,
})
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Globe, Users, LayoutGrid, Phone, Link as LinkIcon } from "lucide-react"
import type { CreateAccountInput } from "@/hooks/use-crm-resources"
import { normalizeString } from "../shared/utils"

interface AccountFormProps {
  initial: CreateAccountInput
  loading: boolean
  error: string | null
  onSubmit: (values: CreateAccountInput) => Promise<void>
  onCancel: () => void
}

export function AccountForm({ initial, loading, error, onSubmit, onCancel }: AccountFormProps) {
  const [values, setValues] = useState<CreateAccountInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateAccountInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      name: values.name,
      domain: normalizeString(values.domain),
      industry: normalizeString(values.industry),
      size: normalizeString(values.size),
      website: normalizeString(values.website),
      phone: normalizeString(values.phone),
      ownerId: normalizeString(values.ownerId) ?? null,
    })
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      
      {/* Header Visual */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Building2 size={32} />
        </div>
        <div>
            <h3 className="text-sm font-medium text-slate-900">Nova Empresa</h3>
            <p className="text-xs text-slate-500">Cadastre uma nova organização cliente.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Identidade Principal */}
        <div className="grid gap-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-600">Nome da Empresa</Label>
                <Input 
                    id="name" 
                    value={values.name} 
                    onChange={handleChange("name")} 
                    required 
                    placeholder="Ex: Acme Corporation"
                    className="text-lg h-12 focus-visible:ring-emerald-500"
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="domain" className="text-slate-600">Domínio Corporativo</Label>
                <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                        id="domain" 
                        value={values.domain ?? ""} 
                        onChange={handleChange("domain")} 
                        placeholder="empresa.com" 
                        className="pl-10 focus-visible:ring-emerald-500 font-mono text-sm"
                    />
                </div>
                <p className="text-[10px] text-slate-400">Usado para enriquecimento automático de dados.</p>
            </div>
        </div>
      </div>

      <div className="border-t border-slate-100 my-2" />

      {/* Dados Firmográficos (Cinza) */}
      <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Detalhes & Contato</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-slate-600 flex items-center gap-2">
                <LayoutGrid size={14} /> Indústria / Setor
            </Label>
            <Input 
                id="industry" 
                value={values.industry ?? ""} 
                onChange={handleChange("industry")} 
                className="bg-white focus-visible:ring-emerald-500"
                placeholder="Ex: SaaS, Varejo, Fintech"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size" className="text-slate-600 flex items-center gap-2">
                <Users size={14} /> Tamanho da Empresa
            </Label>
            <Input 
                id="size" 
                value={values.size ?? ""} 
                onChange={handleChange("size")} 
                className="bg-white focus-visible:ring-emerald-500"
                placeholder="Ex: 50-200 funcionários"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-slate-600 flex items-center gap-2">
                <LinkIcon size={14} /> Website
            </Label>
            <Input 
                id="website" 
                value={values.website ?? ""} 
                onChange={handleChange("website")} 
                className="bg-white focus-visible:ring-emerald-500"
                placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-600 flex items-center gap-2">
                <Phone size={14} /> Telefone Geral
            </Label>
            <Input 
                id="phone" 
                value={values.phone ?? ""} 
                onChange={handleChange("phone")} 
                className="bg-white focus-visible:ring-emerald-500"
                placeholder="+55 (11) 3333-0000"
            />
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
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-6" disabled={loading}>
          {loading ? "Criando..." : "Criar Conta"}
        </Button>
      </div>
    </form>
  )
}

export const toAccountInitial = (item?: { name: string; domain: string | null; industry: string | null; size: string | null; website: string | null; phone: string | null; ownerId: string | null }): CreateAccountInput => ({
  name: item?.name ?? "",
  domain: item?.domain ?? "",
  industry: item?.industry ?? "",
  size: item?.size ?? "",
  website: item?.website ?? "",
  phone: item?.phone ?? "",
  ownerId: item?.ownerId ?? undefined,
})
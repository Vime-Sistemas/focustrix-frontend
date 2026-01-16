import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, DollarSign, Building2, User, PlusCircle } from "lucide-react"
import type { CreateDealInput } from "@/hooks/use-crm-resources"
import { normalizeString, toDateInputValue, type Option } from "../shared/utils"

interface DealFormProps {
  initial: CreateDealInput
  stages: Option[]
  accounts: Option[]
  contacts: Option[]
  loading: boolean
  error: string | null
  onSubmit: (values: CreateDealInput) => Promise<void>
  onCancel: () => void
  createStage?: () => void
}

export function DealForm({ initial, stages, accounts, contacts, loading, error, onSubmit, onCancel, createStage }: DealFormProps) {
  const [values, setValues] = useState<CreateDealInput>(initial)

  useEffect(() => setValues(initial), [initial])

  const handleChange = (field: keyof CreateDealInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSelectChange = (field: keyof CreateDealInput, value: string) => {
    setValues((prev) => ({ 
        ...prev, 
        [field]: value === "__none" ? undefined : value 
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const amountNumber = values.amount === undefined || values.amount === null || values.amount === ("" as any)
      ? undefined
      : Number(values.amount)

    await onSubmit({
      name: values.name,
      stageId: values.stageId,
      accountId: normalizeString(values.accountId) ?? null,
      contactId: normalizeString(values.contactId) ?? null,
      ownerId: normalizeString(values.ownerId) ?? null,
      amount: Number.isNaN(amountNumber) ? undefined : amountNumber,
      currency: normalizeString(values.currency) ?? "BRL",
      expectedClose: values.expectedClose ? new Date(values.expectedClose).toISOString() : undefined,
    })
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      
      {/* Seção Principal */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deal-name" className="text-slate-600">Nome do Negócio</Label>
          <Input 
            id="deal-name" 
            placeholder="Ex.: Implantação Sistema ERP" 
            value={values.name} 
            onChange={handleChange("name")} 
            required 
            className="h-11 text-base focus-visible:ring-emerald-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Pipeline Stage */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <Label className="text-slate-600">Etapa do Pipeline</Label>
                {createStage && (
                    <button 
                        type="button" 
                        onClick={createStage}
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium transition-colors"
                    >
                        <PlusCircle size={12} /> Nova etapa
                    </button>
                )}
             </div>
            <Select 
                value={values.stageId ?? ""} 
                onValueChange={(val) => handleSelectChange("stageId", val)}
            >
              <SelectTrigger className="focus:ring-emerald-500">
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none" className="text-slate-400">Selecione...</SelectItem>
                {stages.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data de Fechamento */}
          <div className="space-y-2">
            <Label htmlFor="expectedClose" className="text-slate-600 flex items-center gap-1">
                <CalendarIcon size={14} className="text-slate-400" />
                Fechamento Previsto
            </Label>
            <Input 
                id="expectedClose" 
                type="date" 
                value={toDateInputValue(values.expectedClose)} 
                onChange={handleChange("expectedClose")} 
                className="focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        {/* Valores Financeiros */}
        <div className="grid gap-4 sm:grid-cols-3">
             <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="amount" className="text-slate-600 flex items-center gap-1">
                    <DollarSign size={14} className="text-slate-400" />
                    Valor Estimado
                </Label>
                <div className="relative">
                    <Input 
                        id="amount" 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00"
                        value={values.amount?.toString() ?? ""} 
                        onChange={handleChange("amount")} 
                        className="pl-9 focus-visible:ring-emerald-500 font-mono"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-600">Moeda</Label>
                <Select 
                    value={values.currency ?? "BRL"} 
                    onValueChange={(val) => handleSelectChange("currency", val)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <div className="border-t border-slate-100 my-4" />

      {/* Relacionamentos (Contas e Contatos) */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Relacionamentos</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-600 flex items-center gap-2">
                <Building2 size={14} /> Conta (Empresa)
            </Label>
            <Select 
                value={values.accountId ?? ""} 
                onValueChange={(val) => handleSelectChange("accountId", val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Vincular empresa..." />
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
            <Label className="text-slate-600 flex items-center gap-2">
                <User size={14} /> Contato Principal
            </Label>
            <Select 
                value={values.contactId ?? ""} 
                onValueChange={(val) => handleSelectChange("contactId", val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Vincular pessoa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none" className="text-slate-400">Nenhum</SelectItem>
                {contacts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded text-sm text-red-600">
            {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-600 hover:text-slate-900">
            Cancelar
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" disabled={loading}>
          {loading ? "Salvando..." : "Criar Negócio"}
        </Button>
      </div>
    </form>
  )
}

export const toDealInitial = (item?: { name: string; stageId: string; amount: string | number | null; currency: string | null; expectedClose: string | null; accountId: string | null; contactId: string | null; ownerId: string | null }): CreateDealInput => ({
  name: item?.name ?? "",
  stageId: item?.stageId ?? "",
  amount: item?.amount ?? undefined,
  currency: item?.currency ?? "BRL",
  expectedClose: item?.expectedClose ?? undefined,
  accountId: item?.accountId ?? undefined,
  contactId: item?.contactId ?? undefined,
  ownerId: item?.ownerId ?? undefined,
})
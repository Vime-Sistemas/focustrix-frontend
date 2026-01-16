import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="deal-name">Nome</Label>
          <Input id="deal-name" value={values.name} onChange={handleChange("name") as any} required />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Etapa</Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Select value={values.stageId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, stageId: val === "__none" ? "" : val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Selecione</SelectItem>
                    {stages.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => createStage && createStage()}>Criar etapa</Button>
              </div>
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" type="number" step="0.01" value={values.amount?.toString() ?? ""} onChange={handleChange("amount") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="currency">Moeda</Label>
            <Input id="currency" value={values.currency ?? "BRL"} onChange={handleChange("currency") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="expectedClose">Fechamento esperado</Label>
            <Input id="expectedClose" type="date" value={toDateInputValue(values.expectedClose)} onChange={handleChange("expectedClose") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Conta</Label>
            <Select value={values.accountId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, accountId: val === "__none" ? undefined : val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Nenhum</SelectItem>
                {accounts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Contato</Label>
            <Select value={values.contactId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, contactId: val === "__none" ? undefined : val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Nenhum</SelectItem>
                {contacts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
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

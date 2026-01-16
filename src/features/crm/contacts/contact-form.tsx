import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="firstName">Nome</Label>
            <Input id="firstName" value={values.firstName} onChange={handleChange("firstName") as any} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input id="lastName" value={values.lastName ?? ""} onChange={handleChange("lastName") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={values.email ?? ""} onChange={handleChange("email") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={values.phone ?? ""} onChange={handleChange("phone") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="title">Cargo</Label>
            <Input id="title" value={values.title ?? ""} onChange={handleChange("title") as any} />
          </div>
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

export const toContactInitial = (item?: { firstName: string; lastName: string | null; email: string | null; phone: string | null; title: string | null; accountId: string | null; ownerId: string | null }): CreateContactInput => ({
  firstName: item?.firstName ?? "",
  lastName: item?.lastName ?? "",
  email: item?.email ?? "",
  phone: item?.phone ?? "",
  title: item?.title ?? "",
  accountId: item?.accountId ?? undefined,
  ownerId: item?.ownerId ?? undefined,
})

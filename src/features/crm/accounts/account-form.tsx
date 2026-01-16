import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={values.name} onChange={handleChange("name") as any} required />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="domain">Domínio</Label>
          <Input id="domain" value={values.domain ?? ""} onChange={handleChange("domain") as any} placeholder="acme.com" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="industry">Indústria</Label>
            <Input id="industry" value={values.industry ?? ""} onChange={handleChange("industry") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="size">Tamanho</Label>
            <Input id="size" value={values.size ?? ""} onChange={handleChange("size") as any} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={values.website ?? ""} onChange={handleChange("website") as any} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={values.phone ?? ""} onChange={handleChange("phone") as any} />
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

export const toAccountInitial = (item?: { name: string; domain: string | null; industry: string | null; size: string | null; website: string | null; phone: string | null; ownerId: string | null }): CreateAccountInput => ({
  name: item?.name ?? "",
  domain: item?.domain ?? "",
  industry: item?.industry ?? "",
  size: item?.size ?? "",
  website: item?.website ?? "",
  phone: item?.phone ?? "",
  ownerId: item?.ownerId ?? undefined,
})

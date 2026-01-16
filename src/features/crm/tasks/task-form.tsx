import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="task-title">Título</Label>
          <Input id="task-title" value={values.title} onChange={handleChange("title") as any} required />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="task-desc">Descrição</Label>
          <Textarea id="task-desc" value={values.description ?? ""} onChange={handleChange("description") as any} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label>Status</Label>
            <Select value={values.status ?? "TODO"} onValueChange={(val) => setValues((prev) => ({ ...prev, status: val as CreateTaskInput["status"] }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                <SelectItem value="DONE">DONE</SelectItem>
                <SelectItem value="CANCELED">CANCELED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Prioridade</Label>
            <Select value={values.priority ?? "MEDIUM"} onValueChange={(val) => setValues((prev) => ({ ...prev, priority: val as CreateTaskInput["priority"] }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="task-due">Vencimento</Label>
            <Input id="task-due" type="date" value={toDateInputValue(values.dueDate)} onChange={handleChange("dueDate") as any} />
          </div>
          <div className="grid gap-1">
            <Label>Negócio</Label>
            <Select value={values.dealId ?? ""} onValueChange={(val) => setValues((prev) => ({ ...prev, dealId: val === "__none" ? undefined : val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Nenhum</SelectItem>
                {deals.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          <div className="grid gap-1">
            <Label htmlFor="task-owner">Responsável</Label>
            <Input id="task-owner" value={values.ownerId ?? ""} onChange={handleChange("ownerId") as any} />
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

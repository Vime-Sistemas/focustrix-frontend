import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StageFormProps {
  loading: boolean
  error: string | null
  onSubmit: (name: string) => Promise<void>
  onCancel: () => void
}

export function StageForm({ loading, error, onSubmit, onCancel }: StageFormProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    setName("")
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(name)
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label htmlFor="stage-name">Nome da etapa</Label>
          <Input id="stage-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  )
}

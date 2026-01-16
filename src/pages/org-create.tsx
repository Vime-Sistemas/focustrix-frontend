import type { FormEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface OrgCreatePageProps {
  onCreate: (name: string, domain?: string) => void
  onBack: () => void
}

export function OrgCreatePage({ onCreate, onBack }: OrgCreatePageProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") || "")
    const domain = String(form.get("domain") || "") || undefined
    onCreate(name, domain)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-tight text-slate-500">Nova organizacao</p>
          <h1 className="text-2xl font-semibold text-slate-900">Crie sua primeira organizacao</h1>
          <p className="text-sm text-slate-600">Defina nome e dominio opcional.</p>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="org-name">Nome</Label>
                <Input id="org-name" name="name" required placeholder="Ex.: Tech Labs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-domain">Dominio (opcional)</Label>
                <Input id="org-domain" name="domain" placeholder="empresa.com" />
              </div>
              <Button type="submit" className="w-full">
                Criar e entrar
              </Button>
            </form>
            <Button variant="outline" className="w-full" onClick={onBack}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

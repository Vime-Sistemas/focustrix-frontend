import type { FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Building2, Globe } from "lucide-react"

interface OrgCreatePageProps {
  onCreate: (name: string, domain?: string) => void
  onBack: () => void
  loading?: boolean
  error?: string
}

export function OrgCreatePage({ onCreate, onBack, loading, error }: OrgCreatePageProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") || "")
    const domain = String(form.get("domain") || "") || undefined
    onCreate(name, domain)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6">
      <div className="w-full max-w-lg">
        <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="pl-0 text-slate-500 hover:text-slate-900 hover:bg-transparent">
                ← Voltar para seleção
            </Button>
        </div>

        <Card className="border-slate-200 shadow-lg overflow-hidden">
            <div className="h-2 bg-emerald-500 w-full" />
            <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Building2 size={20} />
                </div>
                <CardTitle className="text-xl">Configurar nova organização</CardTitle>
                <CardDescription>
                    Crie um espaço dedicado para gerenciar as vendas e processos do seu time.
                </CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Label htmlFor="org-name">Nome da Empresa</Label>
                <Input 
                    id="org-name" 
                    name="name" 
                    required 
                    placeholder="Ex.: Tech Solutions Ltda" 
                    className="focus-visible:ring-emerald-500 text-lg py-5"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="org-domain" className="flex items-center gap-2">
                    <Globe size={14} className="text-slate-400" />
                    Domínio do Workspace (Opcional)
                </Label>
                <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-3 text-slate-500 text-sm">
                        focustrix.com/
                    </span>
                    <Input 
                        id="org-domain" 
                        name="domain" 
                        placeholder="minha-empresa" 
                        className="rounded-l-none focus-visible:ring-emerald-500"
                    />
                </div>
                <p className="text-[0.8rem] text-slate-500">
                    Isso criará uma URL personalizada para seu time acessar o CRM.
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                    {error}
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                    {loading ? "Configurando..." : "Criar Organização"}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
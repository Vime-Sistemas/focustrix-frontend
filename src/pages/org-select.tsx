import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export type Org = { id: string; name: string; role: "OWNER" | "ADMIN" | "MEMBER" }

interface OrgSelectPageProps {
  orgs: Org[]
  loading: boolean
  onSelect: (orgId: string) => void
  onCreateNew: () => void
}

export function OrgSelectPage({ orgs, loading, onSelect, onCreateNew }: OrgSelectPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-tight text-slate-500">Selecione uma organizacao</p>
          <h1 className="text-2xl font-semibold text-slate-900">Onde voce quer trabalhar?</h1>
          <p className="text-sm text-slate-600">Escolha uma das organizacoes ou crie uma nova.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {loading
            ? [...Array(4)].map((_, idx) => <Skeleton key={idx} className="h-20 w-full" />)
            : orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onSelect(org.id)}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{org.name}</p>
                      <p className="text-sm text-slate-600">Papel: {org.role}</p>
                    </div>
                    <Badge variant="secondary">Entrar</Badge>
                  </div>
                </button>
              ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={onCreateNew}>
            Criar nova organizacao
          </Button>
        </div>
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Plus, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"

export type Org = { id: string; name: string; role: "OWNER" | "ADMIN" | "MEMBER"; membersCount?: number }

interface OrgSelectPageProps {
  orgs: Org[]
  loading: boolean
  error?: string
  onSelect: (orgId: string) => void
  onCreateNew: () => void
}

export function OrgSelectPage({ orgs, loading, error, onSelect, onCreateNew }: OrgSelectPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Building2 size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Suas Organizações</h1>
          <p className="mt-2 text-slate-600">Selecione o espaço de trabalho que deseja acessar.</p>
        </div>

        {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
            </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [...Array(3)].map((_, idx) => (
                <Card key={idx} className="h-40 p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                </Card>
              ))
            : orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onSelect(org.id)}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 hover:shadow-md"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-600 font-bold group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            {org.name.substring(0, 2).toUpperCase()}
                        </div>
                        <Badge variant={org.role === "OWNER" ? "default" : "secondary"} className={org.role === "OWNER" ? "bg-slate-900 hover:bg-slate-800" : ""}>
                            {org.role}
                        </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                        {org.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                        Plano Enterprise
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">
                        Ativo recentemente
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}

          {/* Create New Card */}
          <button
            onClick={onCreateNew}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/30"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm">
              <Plus size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">Nova Organização</h3>
            <p className="text-sm text-slate-500 mt-1">Crie um novo ambiente para outro time ou empresa.</p>
          </button>
        </div>
      </div>
    </div>
  )
}
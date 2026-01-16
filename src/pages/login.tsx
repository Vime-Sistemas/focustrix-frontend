import type { FormEvent } from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void> | void
  onGoRegister: () => void
  loading?: boolean
  error?: string
}

export function LoginPage({ onLogin, onGoRegister, loading, error }: LoginPageProps) {
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") || "")
    const password = String(form.get("password") || "")
    setLocalError(null)
    
    if (!password) {
      setLocalError("Por favor, informe sua senha.")
      return
    }
    
    Promise.resolve(onLogin(email, password)).catch((err) => {
      const message = err instanceof Error ? err.message : "Credenciais inválidas."
      setLocalError(message)
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header / Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Acesse sua conta Focustrix para continuar.
          </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="space-y-1 pb-2">
            {/* Espaço reservado para alertas globais se necessário */}
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email corporativo</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="nome@empresa.com" 
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              {(error || localError) && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  {error ?? localError}
                </div>
              )}

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm" disabled={loading}>
                {loading ? "Entrando..." : "Entrar na plataforma"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50 rounded-b-lg">
            <div className="text-sm text-slate-600">
              Não tem uma conta?{" "}
              <button
                type="button"
                className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                onClick={onGoRegister}
              >
                Começar teste grátis
              </button>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-slate-400">
          © 2026 Focustrix Inc. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
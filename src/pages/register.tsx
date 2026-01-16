import type { FormEvent } from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface RegisterPageProps {
  onRegister: (email: string, password: string) => Promise<void> | void
  onGoLogin: () => void
  loading?: boolean
  error?: string
}

export function RegisterPage({ onRegister, onGoLogin, loading, error }: RegisterPageProps) {
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") || "")
    const password = String(form.get("password") || "")
    const confirm = String(form.get("confirmPassword") || "")

    if (password !== confirm) {
      setLocalError("As senhas não coincidem.")
      return
    }

    if (password.length < 6) {
        setLocalError("A senha deve ter pelo menos 6 caracteres.")
        return
    }

    Promise.resolve(onRegister(email, password)).catch((err) => {
      const message = err instanceof Error ? err.message : "Não foi possível criar a conta."
      setLocalError(message)
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-500 text-white shadow-md">
                <span className="font-bold text-lg">Fx</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                Crie sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
                Comece a gerenciar seus negócios com inteligência.
            </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="space-y-6 pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" name="name" required placeholder="Ex: João Silva" className="focus-visible:ring-emerald-500" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-register">Email profissional</Label>
                <Input id="email-register" name="email" type="email" required placeholder="voce@empresa.com" className="focus-visible:ring-emerald-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password-register">Senha</Label>
                    <Input id="password-register" name="password" type="password" required placeholder="******" className="focus-visible:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar</Label>
                    <Input id="confirm-password" name="confirmPassword" type="password" required placeholder="******" className="focus-visible:ring-emerald-500" />
                </div>
              </div>

              {(error || localError) && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    {error ?? localError}
                </div>
              )}

              <div className="text-xs text-slate-500 leading-relaxed">
                Ao clicar em "Criar conta", você concorda com nossos <a href="#" className="underline hover:text-emerald-600">Termos de Serviço</a> e <a href="#" className="underline hover:text-emerald-600">Política de Privacidade</a>.
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50 rounded-b-lg">
            <div className="text-sm text-slate-600">
              Já possui cadastro?{" "}
              <button
                type="button"
                className="font-semibold text-emerald-600 hover:text-emerald-500"
                onClick={onGoLogin}
              >
                Fazer login
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
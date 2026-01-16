import type { FormEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface LoginPageProps {
  onLogin: (email: string) => void
  onGoRegister: () => void
}

export function LoginPage({ onLogin, onGoRegister }: LoginPageProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") || "")
    onLogin(email)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            Fx
          </div>
          <div>
            <p className="text-xs uppercase tracking-tight text-slate-500">Focustrix</p>
            <h1 className="text-xl font-semibold text-slate-900">Entrar</h1>
          </div>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="voce@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
            <div className="text-sm text-slate-600">
              Nao tem conta?{" "}
              <button
                type="button"
                className="font-semibold text-emerald-600"
                onClick={onGoRegister}
              >
                Criar conta
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

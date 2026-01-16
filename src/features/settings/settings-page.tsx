import { useEffect, useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { ApiRequest } from "@/lib/api"
import { useProfile } from "@/hooks/use-profile"

interface SettingsPageProps {
  apiRequest: ApiRequest
  onPasswordReset?: (session: { accessToken: string; refreshToken: string; user: { id: string; email: string } }) => void
}

export function SettingsPage({ apiRequest, onPasswordReset }: SettingsPageProps) {
  const profile = useProfile({ apiRequest })
  const [email, setEmail] = useState("")
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordLocalError, setPasswordLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (profile.profile?.email) {
      setEmail(profile.profile.email)
    }
  }, [profile.profile])

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault()
    setProfileSuccess(null)
    try {
      await profile.updateProfile({ email })
      setProfileSuccess("Perfil atualizado")
    } catch {
      // errors handled via hook state
    }
  }

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordSuccess(null)
    setPasswordLocalError(null)

    if (newPassword !== confirmPassword) {
      setPasswordLocalError("As senhas não conferem")
      return
    }
    if (newPassword.length < 8) {
      setPasswordLocalError("A nova senha deve ter pelo menos 8 caracteres")
      return
    }

    try {
      const res = await profile.changePassword({ currentPassword, newPassword })
      if (res && onPasswordReset) {
        onPasswordReset(res)
      }
      setPasswordSuccess("Senha atualizada com sucesso")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      // errors handled via hook state
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Perfil</CardTitle>
          <CardDescription>Dados globais da sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.error ? (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {profile.error}
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={submitProfile}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={profile.loading}
              />
            </div>
            {profile.saveError ? (
              <p className="text-sm text-rose-600">{profile.saveError}</p>
            ) : null}
            {profileSuccess ? (
              <p className="text-sm text-emerald-600">{profileSuccess}</p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={profile.saving || profile.loading}>
                {profile.saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Segurança</CardTitle>
          <CardDescription>Altere sua senha para proteger sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={submitPassword}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={profile.passwordChanging}
              />
            </div>
            <Separator className="bg-slate-100" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={profile.passwordChanging}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={profile.passwordChanging}
                />
              </div>
            </div>
            {passwordLocalError ? (
              <p className="text-sm text-rose-600">{passwordLocalError}</p>
            ) : null}
            {profile.passwordError ? (
              <p className="text-sm text-rose-600">{profile.passwordError}</p>
            ) : null}
            {passwordSuccess ? (
              <p className="text-sm text-emerald-600">{passwordSuccess}</p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={profile.passwordChanging}>
                {profile.passwordChanging ? "Atualizando..." : "Atualizar senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

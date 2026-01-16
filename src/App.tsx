import { useEffect, useState } from "react"
import { CrmPage } from "@/pages/crm"
import { LoginPage } from "@/pages/login"
import { OrgCreatePage } from "@/pages/org-create"
import { OrgSelectPage, type Org } from "@/pages/org-select"
import { RegisterPage } from "@/pages/register"

import "./App.css"

type Stage = "login" | "register" | "orgSelect" | "orgCreate" | "app"

function App() {
  const [stage, setStage] = useState<Stage>("login")
  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrgs([
        { id: "org-1", name: "Tech Labs", role: "OWNER" },
        { id: "org-2", name: "Acme Ventures", role: "ADMIN" },
      ])
      setOrgsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (_email: string) => {
    setStage("orgSelect")
  }

  const handleRegister = (_email: string) => {
    setStage("orgSelect")
  }

  const handleCreateOrg = (name: string, _domain?: string) => {
    const newOrg: Org = { id: `org-${Date.now()}`, name, role: "OWNER" }
    setOrgs((prev) => [...prev, newOrg])
    setSelectedOrg(newOrg.id)
    setStage("app")
  }

  const selectOrg = (orgId: string) => {
    setSelectedOrg(orgId)
    setStage("app")
  }

  if (stage === "login") {
    return <LoginPage onLogin={handleLogin} onGoRegister={() => setStage("register")} />
  }

  if (stage === "register") {
    return <RegisterPage onRegister={handleRegister} onGoLogin={() => setStage("login")} />
  }

  if (stage === "orgSelect") {
    return (
      <OrgSelectPage
        orgs={orgs}
        loading={orgsLoading}
        onSelect={selectOrg}
        onCreateNew={() => setStage("orgCreate")}
      />
    )
  }

  if (stage === "orgCreate") {
    return <OrgCreatePage onCreate={handleCreateOrg} onBack={() => setStage("orgSelect")} />
  }

  return <CrmPage selectedOrg={selectedOrg} />
}

export default App

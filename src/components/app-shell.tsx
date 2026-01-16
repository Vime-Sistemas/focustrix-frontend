import { Menu, Plus } from "lucide-react"
import type { PropsWithChildren } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NavItem {
  label: string
  value: string
}

interface AppShellProps extends PropsWithChildren {
  navItems: NavItem[]
  active: string
  onNavChange: (value: string) => void
  onQuickCreate: (type: "contact" | "deal") => void
}

export function AppShell({ navItems, active, onNavChange, onQuickCreate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-[var(--color-border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="sm:hidden" aria-label="Menu">
              <Menu size={18} />
            </Button>
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-sm">Fx</span>
              <div className="text-xl">Focustrix</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onQuickCreate("contact")}>Novo contato</Button>
            <Button onClick={() => onQuickCreate("deal")}>
              <Plus size={16} />
              <span className="ml-1">Novo negócio</span>
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarFallback>JV</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <Tabs value={active} onValueChange={onNavChange} className="w-full">
          <TabsList className="bg-white shadow-sm border border-[var(--color-border)]">
            {navItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="text-emerald-500">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Separator className="my-6" />
        <main>{children}</main>
      </div>
    </div>
  )
}

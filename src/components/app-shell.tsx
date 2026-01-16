import type { LucideIcon } from "lucide-react"
import { Bell, Menu, Plus, Search } from "lucide-react"
import type { PropsWithChildren } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  value: string
  icon?: LucideIcon
}

interface AppShellProps extends PropsWithChildren {
  navItems: NavItem[]
  active: string
  onNavChange: (value: string) => void
  onQuickCreate: (type: "contact" | "deal") => void
  onProfileClick?: () => void
  onLogout?: () => void
  userEmail?: string
}

export function AppShell({ navItems, active, onNavChange, onQuickCreate, onProfileClick, onLogout, userEmail, children }: AppShellProps) {
  const avatarFallback = userEmail ? userEmail.slice(0, 2).toUpperCase() : "?"

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header Fixo */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="-ml-2 text-slate-500 sm:hidden" aria-label="Menu">
              <Menu size={20} />
            </Button>
            
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline-block">Focustrix</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar (Cmd+K)..." 
                className="h-9 w-full bg-slate-100/50 pl-9 border-transparent focus:bg-white focus:border-emerald-500 focus-visible:ring-0 transition-all" 
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hidden sm:flex">
               <Bell size={18} />
             </Button>

            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onQuickCreate("contact")} className="text-slate-600 hover:bg-slate-100">
                + Contato
              </Button>
              <Button size="sm" onClick={() => onQuickCreate("deal")} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <Plus size={16} className="mr-1.5" />
                Negócio
              </Button>
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-emerald-100">
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 font-medium text-xs">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">Conta</span>
                    {userEmail ? <span className="text-xs text-slate-500">{userEmail}</span> : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onProfileClick?.()}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onLogout?.()}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Bar - Integrado ao Header mas na linha de baixo */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = active === item.value;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={item.value}
                            onClick={() => onNavChange(item.value)}
                            className={cn(
                                "group flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-all whitespace-nowrap",
                                isActive 
                                    ? "border-emerald-500 text-emerald-600" 
                                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            )}
                        >
                            {Icon && (
                                <Icon 
                                    size={16} 
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-500"
                                    )} 
                                />
                            )}
                            {item.label}
                        </button>
                    )
                })}
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <main>{children}</main>
      </div>
    </div>
  )
}
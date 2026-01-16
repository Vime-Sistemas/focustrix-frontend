import { Menu, Plus, Search, Bell } from "lucide-react"
import type { PropsWithChildren } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="-ml-2 text-slate-500 sm:hidden" aria-label="Menu">
              <Menu size={20} />
            </Button>
            
            <div className="flex items-center gap-2.5">
              {/* Brand Logo Icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Focustrix</span>
            </div>
          </div>

          {/* Search (Center - Desktop) */}
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar contas, deals..." 
                className="h-9 w-full bg-slate-50 pl-9 border-slate-200 focus-visible:ring-emerald-500" 
              />
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
             <Button variant="ghost" size="icon" className="text-slate-500 hover:text-emerald-600 hidden sm:flex">
               <Bell size={18} />
             </Button>

            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onQuickCreate("contact")} className="border-slate-200 hover:bg-slate-50 text-slate-700">
                Novo Contato
              </Button>
              <Button size="sm" onClick={() => onQuickCreate("deal")} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20">
                <Plus size={16} className="mr-1.5" />
                Novo Negócio
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-emerald-100 transition-all">
              <AvatarFallback className="bg-emerald-50 text-emerald-700 font-medium text-xs">JV</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Navigation Tabs */}
        <Tabs value={active} onValueChange={onNavChange} className="w-full">
          <div className="border-b border-slate-200 pb-px mb-8">
            <TabsList className="h-auto gap-6 bg-transparent p-0">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="relative rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 font-medium text-slate-500 shadow-none transition-none data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none hover:text-slate-900"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <main className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </div>
    </div>
  )
}
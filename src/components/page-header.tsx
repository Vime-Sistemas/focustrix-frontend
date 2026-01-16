import { PropsWithChildren, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends PropsWithChildren {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? <p className="text-sm text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export function SecondaryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      {label}
    </Button>
  )
}

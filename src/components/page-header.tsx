import type { PropsWithChildren, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends PropsWithChildren {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description ? <p className="text-base text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
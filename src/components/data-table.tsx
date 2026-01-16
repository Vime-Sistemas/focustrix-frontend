import type { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  title: string
  description?: string
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  empty?: ReactNode
  action?: ReactNode
}

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  columns,
  data,
  loading,
  empty,
  action,
}: DataTableProps<T>) {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                {columns.map((col) => (
                  <TableHead key={String(col.key)} className={cn("h-10 text-xs font-semibold uppercase tracking-wide text-slate-500", col.className)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, idx) => (
                  <TableRow key={idx} className="border-slate-100">
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className="py-3">
                        <Skeleton className="h-4 w-[80%] bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-slate-500">
                    {empty || (
                        <div className="flex flex-col items-center justify-center gap-1 py-6">
                            <span className="text-slate-400">Nenhum registro encontrado</span>
                        </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="border-slate-100 transition-colors hover:bg-emerald-50/30">
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className={cn("py-3 text-sm text-slate-600", col.className)}>
                        {col.render ? col.render(item) : (item[col.key] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
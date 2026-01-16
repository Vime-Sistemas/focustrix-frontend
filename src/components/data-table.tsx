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
    <Card className="mb-8">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={String(col.key)} className={cn("text-slate-600", col.className)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={String(col.key)}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-sm text-slate-500">
                    {empty || "Nenhum registro"}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className={col.className}>
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

export type Option = { value: string; label: string }

export const toNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export const formatCurrency = (value: string | number | null | undefined, currency: string) => {
  const numeric = toNumber(value)
  if (!Number.isFinite(numeric) || numeric === 0) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(numeric)
}

export const formatDate = (value: string) => new Date(value).toLocaleDateString("pt-BR")

export const normalizeString = (value?: string | null) => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

export const toDateInputValue = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

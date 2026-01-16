import { useCallback, useEffect, useState } from "react"
import type { ApiRequest } from "@/lib/api"

export type AccountDto = {
  id: string
  organizationId: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  website: string | null
  phone: string | null
  ownerId: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type ContactDto = {
  id: string
  organizationId: string
  accountId: string | null
  ownerId: string | null
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  title: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type PipelineStageDto = {
  id: string
  organizationId: string
  name: string
  order: number
  probability: number
  createdAt: string
  updatedAt: string
}

export type DealDto = {
  id: string
  organizationId: string
  accountId: string | null
  contactId: string | null
  ownerId: string | null
  stageId: string
  name: string
  amount: string | number | null
  currency: string | null
  status: string
  expectedClose: string | null
  probability: number | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type TaskDto = {
  id: string
  organizationId: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null
  ownerId: string | null
  accountId: string | null
  contactId: string | null
  dealId: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
}

type UseResourceArgs = {
  apiRequest: ApiRequest
  enabled: boolean
}

type ResourceState<T> = {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const buildErrorMessage = (fallback: string, error: unknown) =>
  error instanceof Error ? error.message : fallback

function useResource<T>({ enabled, fetcher }: { enabled: boolean; fetcher: () => Promise<T[]> }): ResourceState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(buildErrorMessage("Erro ao carregar dados", err))
    } finally {
      setLoading(false)
    }
  }, [enabled, fetcher])

  useEffect(() => {
    let active = true
    if (!enabled) {
      setData([])
      setLoading(false)
      setError(null)
      return () => {
        active = false
      }
    }

    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!active) return
        setData(result)
      })
      .catch((err) => {
        if (!active) return
        setError(buildErrorMessage("Erro ao carregar dados", err))
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, fetcher])

  return { data, loading, error, refetch: load }
}

export function useAccounts({ apiRequest, enabled }: UseResourceArgs): ResourceState<AccountDto> {
  const fetcher = useCallback(
    () => apiRequest<AccountDto[]>({ url: "/accounts", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  return useResource<AccountDto>({ enabled, fetcher })
}

export function useContacts({ apiRequest, enabled }: UseResourceArgs): ResourceState<ContactDto> {
  const fetcher = useCallback(
    () => apiRequest<ContactDto[]>({ url: "/contacts", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  return useResource<ContactDto>({ enabled, fetcher })
}

export function usePipelineStages({ apiRequest, enabled }: UseResourceArgs): ResourceState<PipelineStageDto> {
  const fetcher = useCallback(
    () => apiRequest<PipelineStageDto[]>({ url: "/pipeline-stages", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  return useResource<PipelineStageDto>({ enabled, fetcher })
}

export function useDeals({ apiRequest, enabled }: UseResourceArgs): ResourceState<DealDto> {
  const fetcher = useCallback(
    () => apiRequest<DealDto[]>({ url: "/deals", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  return useResource<DealDto>({ enabled, fetcher })
}

export function useTasks({ apiRequest, enabled }: UseResourceArgs): ResourceState<TaskDto> {
  const fetcher = useCallback(
    () => apiRequest<TaskDto[]>({ url: "/tasks", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  return useResource<TaskDto>({ enabled, fetcher })
}

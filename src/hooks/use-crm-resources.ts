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

export type CreateAccountInput = {
  name: string
  domain?: string | null
  industry?: string | null
  size?: string | null
  website?: string | null
  phone?: string | null
  ownerId?: string | null
}

export type UpdateAccountInput = Partial<CreateAccountInput>

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

export type CreateContactInput = {
  firstName: string
  lastName?: string | null
  email?: string | null
  phone?: string | null
  title?: string | null
  accountId?: string | null
  ownerId?: string | null
}

export type UpdateContactInput = Partial<CreateContactInput>

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

export type CreateDealInput = {
  name: string
  stageId: string
  accountId?: string | null
  contactId?: string | null
  ownerId?: string | null
  amount?: number | string | null
  currency?: string | null
  expectedClose?: string | null
}

export type UpdateDealInput = Partial<CreateDealInput>

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

export type CreateTaskInput = {
  title: string
  description?: string | null
  status?: TaskDto["status"]
  priority?: TaskDto["priority"]
  dueDate?: string | null
  ownerId?: string | null
  accountId?: string | null
  contactId?: string | null
  dealId?: string | null
}

export type UpdateTaskInput = Partial<CreateTaskInput>

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

type ResourceCrud<T, CreateInput, UpdateInput> = ResourceState<T> & {
  create: (input: CreateInput) => Promise<T>
  update: (id: string, input: UpdateInput) => Promise<T>
  remove: (id: string) => Promise<void>
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

export function useAccounts({ apiRequest, enabled }: UseResourceArgs): ResourceCrud<AccountDto, CreateAccountInput, UpdateAccountInput> {
  const fetcher = useCallback(
    () => apiRequest<AccountDto[]>({ url: "/accounts", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  const resource = useResource<AccountDto>({ enabled, fetcher })
  const { refetch } = resource

  const create = useCallback(
    async (input: CreateAccountInput) => {
      const created = await apiRequest<AccountDto>({ url: "/accounts", method: "POST", data: input }, { withOrg: true })
      await refetch()
      return created
    },
    [apiRequest, refetch],
  )

  const update = useCallback(
    async (id: string, input: UpdateAccountInput) => {
      const updated = await apiRequest<AccountDto>({ url: `/accounts/${id}`, method: "PUT", data: input }, { withOrg: true })
      await refetch()
      return updated
    },
    [apiRequest, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      await apiRequest<void>({ url: `/accounts/${id}`, method: "DELETE" }, { withOrg: true })
      await refetch()
    },
    [apiRequest, refetch],
  )

  return { ...resource, create, update, remove }
}

export function useContacts({ apiRequest, enabled }: UseResourceArgs): ResourceCrud<ContactDto, CreateContactInput, UpdateContactInput> {
  const fetcher = useCallback(
    () => apiRequest<ContactDto[]>({ url: "/contacts", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  const resource = useResource<ContactDto>({ enabled, fetcher })
  const { refetch } = resource

  const create = useCallback(
    async (input: CreateContactInput) => {
      const created = await apiRequest<ContactDto>({ url: "/contacts", method: "POST", data: input }, { withOrg: true })
      await refetch()
      return created
    },
    [apiRequest, refetch],
  )

  const update = useCallback(
    async (id: string, input: UpdateContactInput) => {
      const updated = await apiRequest<ContactDto>({ url: `/contacts/${id}`, method: "PUT", data: input }, { withOrg: true })
      await refetch()
      return updated
    },
    [apiRequest, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      await apiRequest<void>({ url: `/contacts/${id}`, method: "DELETE" }, { withOrg: true })
      await refetch()
    },
    [apiRequest, refetch],
  )

  return { ...resource, create, update, remove }
}

export function usePipelineStages({ apiRequest, enabled }: UseResourceArgs): ResourceState<PipelineStageDto> {
  const fetcher = useCallback(
    () => apiRequest<PipelineStageDto[]>({ url: "/pipeline-stages", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  return useResource<PipelineStageDto>({ enabled, fetcher })
}

export function useDeals({ apiRequest, enabled }: UseResourceArgs): ResourceCrud<DealDto, CreateDealInput, UpdateDealInput> {
  const fetcher = useCallback(
    () => apiRequest<DealDto[]>({ url: "/deals", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  const resource = useResource<DealDto>({ enabled, fetcher })
  const { refetch } = resource

  const create = useCallback(
    async (input: CreateDealInput) => {
      const created = await apiRequest<DealDto>({ url: "/deals", method: "POST", data: input }, { withOrg: true })
      await refetch()
      return created
    },
    [apiRequest, refetch],
  )

  const update = useCallback(
    async (id: string, input: UpdateDealInput) => {
      const updated = await apiRequest<DealDto>({ url: `/deals/${id}`, method: "PUT", data: input }, { withOrg: true })
      await refetch()
      return updated
    },
    [apiRequest, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      await apiRequest<void>({ url: `/deals/${id}`, method: "DELETE" }, { withOrg: true })
      await refetch()
    },
    [apiRequest, refetch],
  )

  return { ...resource, create, update, remove }
}

export function useTasks({ apiRequest, enabled }: UseResourceArgs): ResourceCrud<TaskDto, CreateTaskInput, UpdateTaskInput> {
  const fetcher = useCallback(
    () => apiRequest<TaskDto[]>({ url: "/tasks", method: "GET" }, { withOrg: true }),
    [apiRequest],
  )

  const resource = useResource<TaskDto>({ enabled, fetcher })
  const { refetch } = resource

  const create = useCallback(
    async (input: CreateTaskInput) => {
      const created = await apiRequest<TaskDto>({ url: "/tasks", method: "POST", data: input }, { withOrg: true })
      await refetch()
      return created
    },
    [apiRequest, refetch],
  )

  const update = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      const updated = await apiRequest<TaskDto>({ url: `/tasks/${id}`, method: "PUT", data: input }, { withOrg: true })
      await refetch()
      return updated
    },
    [apiRequest, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      await apiRequest<void>({ url: `/tasks/${id}`, method: "DELETE" }, { withOrg: true })
      await refetch()
    },
    [apiRequest, refetch],
  )

  return { ...resource, create, update, remove }
}

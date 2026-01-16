import type { AxiosRequestConfig } from "axios"

export type ApiRequestOptions = {
  withOrg?: boolean
  retrying?: boolean
  tokenOverride?: string | null
}

export type ApiRequest = <T,>(
  config: AxiosRequestConfig,
  options?: ApiRequestOptions,
) => Promise<T>

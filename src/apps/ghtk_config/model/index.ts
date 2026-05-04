export type GhtkPickOption = "cod" | "post"
export type GhtkTransport = "road" | "fly"

export type GhtkConfigDTO = {
  id: number
  shopId: number
  enabled: boolean
  hasApiToken: boolean
  clientSource: string | null
  pickName: string
  pickTel: string
  pickAddress: string
  pickProvince: string
  pickDistrict: string
  pickWard: string
  pickOption: GhtkPickOption
  transport: GhtkTransport
  createdAt: string
  updatedAt: string
}

export type GhtkConfigRequest = {
  enabled: boolean
  apiToken?: string
  clientSource?: string
  pickName: string
  pickTel: string
  pickAddress: string
  pickProvince: string
  pickDistrict: string
  pickWard: string
  pickOption: GhtkPickOption
  transport: GhtkTransport
}

export type GhtkConfigApiError = {
  code?: string
  message?: string
  data?: null
}

export type ShopPaymentConfigDTO = {
  id: number
  shopId: number
  bankCode: string
  accountNumber: string
  accountName: string
  displayName: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ShopPaymentConfigRequest = {
  bankCode: string
  accountNumber: string
  accountName: string
  displayName: string
  active?: boolean
}

export type ShopPaymentConfigApiError = {
  code: string
  message: string
  data: null
}

import api from "@/common/api/baseApi"
import type {
  CancelSubscriptionPaymentResponse,
  CreateSepayQrPaymentRequest,
  CurrentSubscriptionPaymentResponse,
  SepayPaymentResponse,
  SubscriptionOverviewResponse,
  SubscriptionPaymentHistoryResponse,
  SubscriptionPaymentStatusResponse,
} from "@/apps/subscriptions/model"

const SHOP_SUBSCRIPTION_URL = "/shop/subscription"

export const subscriptionApi = {
  getOverview: () => {
    return api.get<SubscriptionOverviewResponse>(`${SHOP_SUBSCRIPTION_URL}/overview`)
  },

  getCurrentPayment: () => {
    return api.get<CurrentSubscriptionPaymentResponse>(`${SHOP_SUBSCRIPTION_URL}/payments/current`)
  },

  getPaymentHistory: (page = 0, size = 10) => {
    return api.get<SubscriptionPaymentHistoryResponse>(`${SHOP_SUBSCRIPTION_URL}/payments`, {
      params: { page, size },
    })
  },

  createSepayQrPayment: (body: CreateSepayQrPaymentRequest) => {
    return api.post<SepayPaymentResponse>(`${SHOP_SUBSCRIPTION_URL}/payments/sepay-qr`, body)
  },

  getPaymentStatus: (paymentId: number) => {
    return api.get<SubscriptionPaymentStatusResponse>(`${SHOP_SUBSCRIPTION_URL}/payments/${paymentId}/status`)
  },

  cancelPayment: (paymentId: number) => {
    return api.post<CancelSubscriptionPaymentResponse>(`${SHOP_SUBSCRIPTION_URL}/payments/${paymentId}/cancel`, undefined)
  },
}

export const getShopSubscriptionOverview = subscriptionApi.getOverview
export const getCurrentShopSubscriptionPayment = subscriptionApi.getCurrentPayment
export const getShopSubscriptionPayments = subscriptionApi.getPaymentHistory
export const createSepayQrPayment = (months: CreateSepayQrPaymentRequest["months"]) => subscriptionApi.createSepayQrPayment({ months })
export const getSepayPaymentStatus = subscriptionApi.getPaymentStatus
export const cancelSepayPayment = subscriptionApi.cancelPayment

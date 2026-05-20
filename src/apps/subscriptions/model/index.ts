export type SubscriptionPlanType = "TRIAL" | "MONTHLY"

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELED"

export type SubscriptionPaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELED" | "EXPIRED"

export type PaymentProvider = "SEPAY"

export type RenewMonths = 1 | 3 | 6

export type SepayPaymentStatus = SubscriptionPaymentStatus

export interface SubscriptionOverviewResponse {
  shopId: number
  planType: SubscriptionPlanType
  status: SubscriptionStatus
  startedAt: string
  expiredAt: string
  remainingDays: number
  trialTotalDays: number
  usedDays: number
  planTotalDays: number
  subscriptionStartedAt: string
  trialEndsAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  currentPeriodRemainingDays: number
  monthlyPrice: number
  currency: "VND"
  canRenew: boolean
  message: string
}

export interface CreateSepayQrPaymentRequest {
  months: RenewMonths
}

export interface SepayPaymentResponse {
  paymentId: number
  invoiceNumber: string
  months: RenewMonths
  durationDays: number
  amount: number
  status: SubscriptionPaymentStatus
  provider: PaymentProvider
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  transferContent: string
  qrUrl: string
  expiredAt: string
  subscriptionExpiredAt?: string | null
  createdAt: string
}

export type SepayQrPaymentResponse = SepayPaymentResponse

export type CurrentSubscriptionPaymentResponse = SepayPaymentResponse | null

export interface SubscriptionPaymentStatusResponse {
  paymentId: number
  invoiceNumber: string
  status: SubscriptionPaymentStatus
  paidAt: string | null
  expiredAt: string
  subscriptionExpiredAt?: string | null
}

export type SepayPaymentStatusResponse = SubscriptionPaymentStatusResponse

export interface CancelSubscriptionPaymentResponse {
  paymentId: number
  invoiceNumber: string
  status: "CANCELED"
  message: string
}

export interface SubscriptionPaymentHistoryItem {
  paymentId: number
  invoiceNumber: string
  planName: string
  months: RenewMonths
  amount: number
  status: SubscriptionPaymentStatus
  provider: PaymentProvider
  paidAt: string | null
  subscriptionExpiredAt?: string | null
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext?: boolean
  hasPrevious?: boolean
}

export type SubscriptionPaymentHistoryResponse = PageResponse<SubscriptionPaymentHistoryItem>

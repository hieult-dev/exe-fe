import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type {
  DashboardSummaryDTO,
  InventoryStatusDTO,
  BookingCategoryStatDTO,
  MonthlyOrderDTO,
  MonthlyRevenueDTO,
  ServiceCategoryStatDTO,
} from "@/apps/dashboard/model"

const DASHBOARD_URL = `${GATEWAY_URL}/api/shop-owner/dashboard`

type DashboardMonthParams = {
  year: number
  month: number
}

type DashboardYearParams = {
  year: number
}

type DashboardCategoryBookingParams = {
  year: number
  month?: number
}

export const getDashboardSummary = ({ year, month }: DashboardMonthParams) => {
  return api.get<DashboardSummaryDTO>(`${DASHBOARD_URL}/summary`, {
    params: { year, month },
  })
}

export const getRevenueByMonth = ({ year }: DashboardYearParams) => {
  return api.get<MonthlyRevenueDTO[]>(`${DASHBOARD_URL}/revenue-by-month`, {
    params: { year },
  })
}

export const getOrdersByMonth = ({ year }: DashboardYearParams) => {
  return api.get<MonthlyOrderDTO[]>(`${DASHBOARD_URL}/orders-by-month`, {
    params: { year },
  })
}

export const getBookingsByCategory = ({ year, month }: DashboardCategoryBookingParams) => {
  const params: Record<string, number> = { year }
  if (typeof month === "number") params.month = month

  return api.get<BookingCategoryStatDTO[]>(`${DASHBOARD_URL}/bookings-by-category`, {
    params,
  })
}

export const getServicesByCategory = () => {
  return api.get<ServiceCategoryStatDTO[]>(`${DASHBOARD_URL}/services-by-category`)
}

export const getInventoryStatus = () => {
  return api.get<InventoryStatusDTO>(`${DASHBOARD_URL}/inventory-status`)
}

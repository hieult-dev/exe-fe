import api from "@/common/api/baseApi"
import type {
  AdminMonthlyCommissionListParams,
  AdminCommissionMonthlyReportDTO,
  AdminShopMonthlyCommissionDetailDTO,
} from "@/apps/admin-commissions/model"

const ADMIN_MONTHLY_COMMISSION_URL = "/admin/commission-reports/monthly"

export function getAdminMonthlyCommissionReport({
  month,
  keyword,
  status,
  page = 0,
  size = 20,
}: AdminMonthlyCommissionListParams) {
  return api.get<AdminCommissionMonthlyReportDTO>(ADMIN_MONTHLY_COMMISSION_URL, {
    params: { month, keyword: keyword || undefined, status, page, size },
  })
}

export function getAdminShopMonthlyCommissionDetail(shopId: number, month: string) {
  return api.get<AdminShopMonthlyCommissionDetailDTO>(`${ADMIN_MONTHLY_COMMISSION_URL}/${shopId}`, {
    params: { month },
  })
}

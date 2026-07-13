import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "primereact/button"
import { Toolbar } from "primereact/toolbar"
import {
  getAdminMonthlyCommissionReport,
  getAdminShopMonthlyCommissionDetail,
} from "@/apps/admin-commissions/api/adminCommissionApi"
import { AdminCommissionDetailSidebar } from "@/apps/admin-commissions/components/AdminCommissionDetailSidebar"
import { AdminCommissionFilters } from "@/apps/admin-commissions/components/AdminCommissionFilters"
import { AdminCommissionSummary } from "@/apps/admin-commissions/components/AdminCommissionSummary"
import { AdminCommissionTable } from "@/apps/admin-commissions/components/AdminCommissionTable"
import type {
  AdminCommissionCollectionStatus,
  AdminCommissionMonthlyReportDTO,
  AdminShopMonthlyCommissionDetailDTO,
  AdminShopMonthlyCommissionDTO,
} from "@/apps/admin-commissions/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatMonthForApi } from "@/common/utils/format"

const DEFAULT_PAGE_SIZE = 20

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { message?: string; error?: string } | undefined
  return apiError?.message || apiError?.error || fallback
}

export function AdminCommissionPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [searchText, setSearchText] = useState("")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [status, setStatus] = useState<AdminCommissionCollectionStatus | undefined>()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [report, setReport] = useState<AdminCommissionMonthlyReportDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<AdminShopMonthlyCommissionDetailDTO | null>(null)

  const month = useMemo(() => formatMonthForApi(selectedMonth), [selectedMonth])

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    try {
      setReport(await getAdminMonthlyCommissionReport({
        month,
        keyword: appliedKeyword,
        status,
        page,
        size: pageSize,
      }))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải báo cáo hoa hồng theo tháng."))
    } finally {
      setIsLoading(false)
    }
  }, [appliedKeyword, month, page, pageSize, status])

  useEffect(() => {
    void loadReport()
  }, [loadReport])

  const applyFilters = () => {
    setAppliedKeyword(searchText.trim())
    setPage(0)
  }

  const clearSearch = () => {
    setSearchText("")
    setAppliedKeyword("")
    setPage(0)
  }

  const openDetail = async (shop: AdminShopMonthlyCommissionDTO) => {
    setDetailVisible(true)
    setDetailLoading(true)
    setDetail(null)
    try {
      setDetail(await getAdminShopMonthlyCommissionDetail(shop.shopId, month))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết hoa hồng của shop."))
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="m-0 text-lg font-semibold text-slate-800">Hoa hồng theo tháng</h1>
            <p className="m-0 mt-0.5 text-sm text-slate-500">
              Theo dõi khoản hoa hồng phát sinh, đã thanh toán và còn phải thu của từng shop.
            </p>
          </div>
        }
        end={
          <Button
            type="button"
            label="Làm mới"
            icon="pi pi-refresh"
            loading={isLoading}
            onClick={() => void loadReport()}
            className="!h-9 !rounded-md !border-none !bg-white !px-3 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f4f7fb] [&_.p-button-icon]:!text-[#40526b] [&_.p-button-label]:!text-[#40526b]"
          />
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <div className="space-y-4">
          <AdminCommissionSummary report={report} month={month} loading={isLoading} />

          <AdminCommissionFilters
            selectedMonth={selectedMonth}
            searchText={searchText}
            status={status}
            onMonthChange={(nextMonth) => {
              setSelectedMonth(nextMonth)
              setPage(0)
            }}
            onSearchTextChange={setSearchText}
            onStatusChange={(nextStatus) => {
              setStatus(nextStatus)
              setPage(0)
            }}
            onApply={applyFilters}
            onClearSearch={clearSearch}
          />

          <AdminCommissionTable
            rows={report?.shops.content ?? []}
            totalRecords={report?.shops.totalElements ?? 0}
            page={page}
            pageSize={pageSize}
            loading={isLoading}
            onPageChange={(nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            }}
            onOpenDetail={(shop) => void openDetail(shop)}
          />
        </div>
      </div>

      <AdminCommissionDetailSidebar
        visible={detailVisible}
        loading={detailLoading}
        detail={detail}
        onHide={() => {
          setDetailVisible(false)
          setDetail(null)
        }}
      />
    </div>
  )
}

import type { FormEvent } from "react"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import type { AdminCommissionCollectionStatus } from "@/apps/admin-commissions/model"

const ALL_STATUS = "ALL"

const statusOptions: Array<{
  label: string
  value: AdminCommissionCollectionStatus | typeof ALL_STATUS
}> = [
  { label: "Tất cả trạng thái", value: ALL_STATUS },
  { label: "Còn phải thu", value: "OUTSTANDING" },
  { label: "Có khoản quá hạn", value: "OVERDUE" },
  { label: "Đã thanh toán", value: "PAID" },
]

type AdminCommissionFiltersProps = {
  selectedMonth: Date
  searchText: string
  status?: AdminCommissionCollectionStatus
  onMonthChange: (month: Date) => void
  onSearchTextChange: (value: string) => void
  onStatusChange: (status?: AdminCommissionCollectionStatus) => void
  onApply: () => void
  onClearSearch: () => void
}

export function AdminCommissionFilters({
  selectedMonth,
  searchText,
  status,
  onMonthChange,
  onSearchTextChange,
  onStatusChange,
  onApply,
  onClearSearch,
}: AdminCommissionFiltersProps) {
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApply()
  }

  return (
    <section className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
      <div className="grid gap-3 xl:grid-cols-[190px,1fr,230px,auto] xl:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#52657e]">Tháng báo cáo</span>
          <Calendar
            value={selectedMonth}
            onChange={(event) => {
              if (event.value instanceof Date) onMonthChange(event.value)
            }}
            view="month"
            dateFormat="mm/yy"
            showIcon
            maxDate={new Date()}
            readOnlyInput
            className="w-full [&_.p-inputtext]:!h-10 [&_.p-inputtext]:!text-sm"
            inputClassName="!rounded-l-md !border-[#d9e1eb]"
            panelClassName="text-sm"
            placeholder="Chọn tháng"
          />
        </label>

        <form onSubmit={submitSearch}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#52657e]">Tìm kiếm shop</span>
            <span className="p-input-icon-left relative block">
              <i className="pi pi-search !left-3 !text-slate-400" />
              <InputText
                value={searchText}
                onChange={(event) => onSearchTextChange(event.target.value)}
                placeholder="Nhập tên hoặc mã shop"
                className="!h-10 w-full !rounded-md !border-[#d9e1eb] !pl-9 !pr-10 !text-sm"
              />
              {searchText && (
                <button
                  type="button"
                  aria-label="Xóa từ khóa tìm kiếm"
                  onClick={onClearSearch}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <i className="pi pi-times text-xs" />
                </button>
              )}
            </span>
          </label>
        </form>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#52657e]">Trạng thái công nợ</span>
          <Dropdown
            value={status ?? ALL_STATUS}
            options={statusOptions}
            optionLabel="label"
            optionValue="value"
            filter
            filterBy="label"
            filterPlaceholder="Tìm trạng thái"
            emptyFilterMessage="Không có trạng thái phù hợp"
            onChange={(event) => onStatusChange(event.value === ALL_STATUS ? undefined : (event.value as AdminCommissionCollectionStatus))}
            className="!h-10 w-full !rounded-md !border-[#d9e1eb] [&_.p-dropdown-label]:!py-2.5 [&_.p-dropdown-label]:!text-sm"
            placeholder="Tất cả trạng thái"
          />
        </label>

        <Button
          type="button"
          label="Áp dụng"
          icon="pi pi-filter"
          onClick={onApply}
          className="!h-10 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
        />
      </div>
    </section>
  )
}

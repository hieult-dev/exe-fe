import { useEffect, useRef, useState } from "react"
import { InputText } from "primereact/inputtext"
import { ProgressSpinner } from "primereact/progressspinner"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"
import { NOT_FOUND_IMAGE_URL } from "@/common/utils/url"
import { canAddSaleItem } from "@/apps/staff/model"
import { useStaffSalesSearch, type StaffSalesSearchSuggestion } from "@/apps/staff/context/StaffSalesSearchContext"

export function StaffSaleHeaderSearch() {
  const { searchQuery, setSearchQuery, suggestions, suggestionMode, suggestionsLoading, selectSuggestion } = useStaffSalesSearch()
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const trimmedQuery = searchQuery.trim()
  const visibleSuggestions = suggestions.slice(0, 8)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const chooseSuggestion = (item: StaffSalesSearchSuggestion) => {
    if (item.type === "PRODUCT" && !canAddSaleItem(item.product)) return
    selectSuggestion(item)
    setIsOpen(false)
  }

  const suggestionTitle = suggestionMode === "BOOKING" ? "Gợi ý booking" : "Gợi ý sản phẩm"
  const emptyText = suggestionMode === "BOOKING" ? "Không tìm thấy booking phù hợp" : "Không tìm thấy sản phẩm phù hợp"

  return (
    <div ref={rootRef} className="relative">
      <div className="flex h-10 items-center gap-3 rounded-lg bg-white px-4 text-slate-500 shadow-sm">
        <i className="pi pi-search text-sm text-slate-400" />
        <InputText
          type="text"
          value={searchQuery}
          className="!w-full !border-0 !bg-transparent !p-0 !text-sm !text-slate-700 !shadow-none !outline-none focus:!shadow-none"
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setIsOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && visibleSuggestions[0]) {
              event.preventDefault()
              chooseSuggestion(visibleSuggestions[0])
            }
            if (event.key === "Escape") {
              setIsOpen(false)
            }
          }}
        />
      </div>

      {isOpen && trimmedQuery && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {suggestionTitle}
          </div>

          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-6">
              <ProgressSpinner strokeWidth="4" className="!h-7 !w-7" />
            </div>
          ) : visibleSuggestions.length === 0 ? (
            <div className="px-3 py-5 text-center text-sm text-slate-500">{emptyText}</div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto py-1">
              {visibleSuggestions.map((suggestion) => {
                if (suggestion.type === "BOOKING") {
                  const booking = suggestion.booking
                  const customerName = booking.customerName || booking.userFullName || `User #${booking.userId ?? booking.id}`
                  const customerContact = booking.customerPhone || booking.userPhone || booking.userEmail || "---"
                  return (
                    <button
                      key={`BOOKING-${booking.id}`}
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        chooseSuggestion(suggestion)
                      }}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-[#eef3fb] text-[#214388]">
                        <i className="pi pi-calendar text-base" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="m-0 truncate text-sm font-semibold text-slate-800">{customerName}</p>
                          <span className="shrink-0 rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-700">
                            {booking.bookingCode}
                          </span>
                        </div>
                        <p className="m-0 mt-0.5 truncate text-xs text-slate-500">
                          {customerContact} · {formatDateTimeViVN(booking.startAt || booking.time)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(booking.totalAmount)}</p>
                        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#214388]">
                          <i className="pi pi-check text-xs" />
                        </span>
                      </div>
                    </button>
                  )
                }

                const item = suggestion.product
                const canAdd = canAddSaleItem(item)
                return (
                  <button
                    key={`PRODUCT-${item.id}`}
                    type="button"
                    disabled={!canAdd}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      chooseSuggestion(suggestion)
                    }}
                  >
                    <img
                      src={item.imageUrl || NOT_FOUND_IMAGE_URL}
                      alt={item.name}
                      className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-cover"
                      onError={(event) => {
                        event.currentTarget.src = NOT_FOUND_IMAGE_URL
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="m-0 truncate text-sm font-semibold text-slate-800">{item.name}</p>
                        <span className="shrink-0 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                          {item.code || `#${item.id}`}
                        </span>
                      </div>
                      <p className="m-0 mt-0.5 truncate text-xs text-slate-500">
                        {item.category || item.unitLabel} · Còn {item.stockQty ?? 0}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(item.unitPrice)}</p>
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#214388]">
                        <i className="pi pi-plus text-xs" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

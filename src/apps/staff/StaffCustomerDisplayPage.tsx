import { useEffect, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Button } from "primereact/button"
import type { CustomerDisplayInvoiceLine, CustomerDisplayInvoiceSnapshot } from "@/apps/staff/model"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessShopConsolePages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { formatCurrencyVND } from "@/common/utils/format"
import { NOT_FOUND_IMAGE_URL } from "@/common/utils/url"
import {
  CUSTOMER_DISPLAY_CHANNEL,
  CUSTOMER_DISPLAY_STORAGE_KEY,
  readCustomerDisplaySnapshot,
} from "@/apps/staff/utils/customerDisplay"

function lineTypeLabel(type: CustomerDisplayInvoiceLine["type"]) {
  if (type === "PRODUCT") return "Sản phẩm"
  if (type === "PACKAGE_REDEEM") return "Gói"
  if (type === "ADJUSTMENT") return "Điều chỉnh"
  return "Dịch vụ"
}

function emptySnapshot(): CustomerDisplayInvoiceSnapshot {
  return {
    mode: "EMPTY",
    lines: [],
    subtotal: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentQr: null,
    updatedAt: new Date().toISOString(),
  }
}

export function StaffCustomerDisplayPage() {
  const { user, authentication, currentShopId, shops } = useUserStore()
  const currentShop = resolveCurrentAuthShop(shops, currentShopId)
  const [invoice, setInvoice] = useState<CustomerDisplayInvoiceSnapshot>(() => readCustomerDisplaySnapshot() ?? emptySnapshot())

  const hasInvoice = invoice.mode !== "EMPTY" && invoice.lines.length > 0
  const title = invoice.mode === "BOOKING" ? "Hóa đơn dịch vụ" : invoice.mode === "ORDER" ? "Hóa đơn sản phẩm" : "Hóa đơn"
  const updatedAt = useMemo(() => {
    const value = new Date(invoice.updatedAt)
    if (Number.isNaN(value.getTime())) return ""
    return value.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }, [invoice.updatedAt])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CUSTOMER_DISPLAY_STORAGE_KEY || !event.newValue) return
      try {
        setInvoice(JSON.parse(event.newValue) as CustomerDisplayInvoiceSnapshot)
      } catch {
        setInvoice(emptySnapshot())
      }
    }

    window.addEventListener("storage", handleStorage)

    if (!("BroadcastChannel" in window)) {
      return () => window.removeEventListener("storage", handleStorage)
    }

    const channel = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL)
    channel.onmessage = (event) => setInvoice(event.data as CustomerDisplayInvoiceSnapshot)

    return () => {
      channel.close()
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  if (!canAccessShopConsolePages(currentShop)) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] p-3 text-slate-900 lg:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1920px] flex-col rounded-xl bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-8">
          <div className="min-w-0">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.24em] text-[#214388]">{currentShop?.name ?? "PetPees"}</p>
            <h1 className="m-0 mt-2 truncate text-2xl font-bold text-slate-950">{title}</h1>
          </div>
          <Button
            type="button"
            icon="pi pi-refresh"
            label="Làm mới"
            text
            className="!rounded-lg !px-2 !text-base !font-semibold !text-slate-900"
            onClick={() => setInvoice(readCustomerDisplaySnapshot() ?? emptySnapshot())}
          />
        </header>

        <main className="min-h-0 flex-1 p-7">
          {!hasInvoice ? (
            <div className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
              <i className="pi pi-shopping-cart mb-4 text-4xl text-slate-300" />
              <p className="m-0 text-2xl font-bold text-slate-800">Đang chờ hóa đơn</p>
              <p className="mb-0 mt-2 text-base text-slate-500">Thông tin sẽ tự cập nhật khi nhân viên thao tác.</p>
            </div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr),minmax(560px,42rem)] xl:grid-cols-[minmax(0,1fr),minmax(640px,46rem)]">
              <section className="min-h-[460px] overflow-hidden rounded-xl border border-[#d9e1eb] bg-white">
                <div className="border-b border-slate-100 bg-[#fbfdff] px-7 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-bold uppercase tracking-wider text-slate-400">Chi tiết hóa đơn</p>
                      {invoice.code && <p className="m-0 mt-1 truncate font-mono text-sm font-semibold text-[#214388]">{invoice.code}</p>}
                    </div>
                    {updatedAt && <span className="shrink-0 text-sm font-semibold text-slate-500">{updatedAt}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr),72px,112px,128px] gap-4 border-b border-slate-100 bg-[#f8fafc] px-7 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Mặt hàng</span>
                  <span className="text-center">SL</span>
                  <span className="text-right">Đơn giá</span>
                  <span className="text-right">Thành tiền</span>
                </div>

                <div className="max-h-[calc(100vh-290px)] overflow-y-auto px-7">
                  {invoice.lines.map((line, index) => (
                    <div
                      key={`${line.type}-${line.name}-${index}`}
                      className="grid grid-cols-[minmax(0,1fr),72px,112px,128px] items-center gap-4 border-b border-slate-100 py-5 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f1f5f9] text-[#214388]">
                          {line.type === "PRODUCT" ? (
                            <img
                              src={line.imageUrl || NOT_FOUND_IMAGE_URL}
                              alt={line.name}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.src = NOT_FOUND_IMAGE_URL
                              }}
                            />
                          ) : (
                            <i className="pi pi-sparkles text-2xl" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="m-0 text-sm font-bold uppercase tracking-wider text-[#214388]">{lineTypeLabel(line.type)}</p>
                          <h2 className="m-0 mt-1 truncate text-xl font-bold text-slate-950">{line.name}</h2>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-[#eef3fb] px-3 py-2 text-xl font-bold text-[#214388]">
                          {line.qty}
                        </span>
                      </div>
                      <p className="m-0 text-right text-lg font-semibold text-slate-700">{formatCurrencyVND(line.unitPrice)}</p>
                      <p className="m-0 text-right text-xl font-bold text-[#214388]">{formatCurrencyVND(line.amount)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="flex min-h-[460px] flex-col gap-4">
                <div className="rounded-xl bg-[#f8fafc] p-7">
                  <p className="m-0 text-sm font-bold uppercase tracking-wider text-slate-400">Khách hàng</p>
                  <p className="m-0 mt-2 truncate text-2xl font-bold text-slate-950">{invoice.customerName || "Khách lẻ"}</p>
                </div>

                <div className="flex flex-1 flex-col rounded-xl bg-[#f8fafc] p-7">
                  <p className="m-0 text-sm font-bold uppercase tracking-wider text-slate-400">Thanh toán</p>
                  <div className="mt-auto space-y-4 text-lg">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Tạm tính</span>
                      <span>{formatCurrencyVND(invoice.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Giảm giá</span>
                      <span>-{formatCurrencyVND(invoice.discountAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-6 text-2xl font-bold text-slate-950">
                      <span>Tổng</span>
                      <span className="text-[#214388]">{formatCurrencyVND(invoice.totalAmount)}</span>
                    </div>
                  </div>

                  {invoice.paymentQr && (
                    <div className="mt-6 rounded-xl border border-[#d9e1eb] bg-white p-4 text-center">
                      <img
                        src={invoice.paymentQr.url}
                        alt="VietQR thanh toán"
                        className="mx-auto mt-3 h-[36rem] w-[36rem] max-w-full object-contain xl:h-[40rem] xl:w-[40rem]"
                      />
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Button } from "primereact/button"
import { AutoComplete, type AutoCompleteChangeEvent, type AutoCompleteSelectEvent } from "primereact/autocomplete"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { Tag } from "primereact/tag"
import type { BookingDTO } from "@/apps/bookings/model"
import { formatCurrencyVND, formatDateTimeViVN, formatVndInput, toDigitsOnly } from "@/common/utils/format"
import {
  getSaleItemKey,
  getSaleItemTypeLabel,
  type CustomerDisplayPaymentQr,
  type CustomerDTO,
  type SaleCartItem,
} from "@/apps/staff/model"

const invoiceInputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0"

const paymentMethodDropdownClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] text-sm shadow-none focus:!border-[#d9e1eb] focus:!shadow-none focus:!ring-0 [&.p-focus]:!border-[#d9e1eb] [&.p-focus]:!shadow-none [&_.p-dropdown-label]:px-3 [&_.p-dropdown-label]:py-2 [&_.p-dropdown-label]:text-sm [&_.p-dropdown-trigger]:w-10"

type PaymentMethod = "QR" | "CASH"

const paymentMethodOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Thanh toán QR", value: "QR" },
  { label: "Tiền mặt", value: "CASH" },
]

function getBookingItemLabel(itemType: string | undefined) {
  if (itemType === "PRODUCT") return "Sản phẩm"
  if (itemType === "PACKAGE_REDEEM") return "Gói"
  if (itemType === "ADJUSTMENT") return "Điều chỉnh"
  return "Dịch vụ"
}

function getBookingItemSeverity(itemType: string | undefined) {
  return itemType === "PRODUCT" ? "info" : "success"
}

type SaleInvoicePanelProps = {
  cart: SaleCartItem[]
  selectedBooking: BookingDTO | null
  customerPhone: string
  customerSuggestions: CustomerDTO[]
  verifiedCustomer: CustomerDTO | null
  discountAmount: number
  paymentQr: CustomerDisplayPaymentQr | null
  note: string
  isSubmitting: boolean
  onCustomerPhoneChange: (value: string) => void
  onCustomerPhoneSuggest: (query: string) => void
  onCustomerSuggestionSelect: (customer: CustomerDTO) => void
  onDiscountChange: (value: number) => void
  onNoteChange: (value: string) => void
  onOpenCreateCustomer: () => void
  onQuantityChange: (item: SaleCartItem, quantity: number) => void
  onRemoveItem: (item: SaleCartItem) => void
  onClearCart: () => void
  onOpenCustomerDisplay: () => void
  onShowPaymentQr: () => void
  onConfirmQrPayment: () => void
  onCashCheckout: () => void
}

export function SaleInvoicePanel({
  cart,
  selectedBooking,
  customerPhone,
  customerSuggestions,
  verifiedCustomer,
  discountAmount,
  paymentQr,
  note,
  isSubmitting,
  onCustomerPhoneChange,
  onCustomerPhoneSuggest,
  onCustomerSuggestionSelect,
  onDiscountChange,
  onNoteChange,
  onOpenCreateCustomer,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onOpenCustomerDisplay,
  onShowPaymentQr,
  onConfirmQrPayment,
  onCashCheckout,
}: SaleInvoicePanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QR")
  const isBookingInvoice = Boolean(selectedBooking)
  const hasShownPaymentQr = Boolean(paymentQr)
  const cartSubtotal = cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  const subtotal = selectedBooking ? selectedBooking.totalAmount + cartSubtotal : cartSubtotal
  const appliedDiscount = selectedBooking ? 0 : Math.min(discountAmount, subtotal)
  const totalAmount = Math.max(0, subtotal - appliedDiscount)
  const hasInvoiceItem = cart.length > 0 || Boolean(selectedBooking)
  const discountInputValue = discountAmount > 0 ? formatVndInput(String(discountAmount)) : ""
  const selectedBookingName = selectedBooking
    ? selectedBooking.customerName || selectedBooking.userFullName || `User #${selectedBooking.userId ?? selectedBooking.id}`
    : ""
  const selectedBookingContact = selectedBooking
    ? selectedBooking.customerPhone || selectedBooking.userPhone || selectedBooking.userEmail || "---"
    : ""

  const handleDiscountInputChange = (value: string) => {
    onDiscountChange(Number(toDigitsOnly(value) || 0))
  }

  const paymentButtonLabel = isSubmitting
    ? paymentQr
      ? "Đang xác nhận"
      : paymentMethod === "QR"
        ? "Đang lấy QR"
        : "Đang thanh toán"
    : paymentQr
      ? "Đã thanh toán"
      : paymentMethod === "QR"
        ? "Hiện QR"
        : "Thanh toán tiền mặt"
  const paymentButtonIcon = paymentQr ? "pi pi-check" : paymentMethod === "QR" ? "pi pi-qrcode" : "pi pi-money-bill"

  const handlePaymentAction = () => {
    if (paymentQr) {
      onConfirmQrPayment()
      return
    }

    if (paymentMethod === "QR") {
      onShowPaymentQr()
      return
    }

    onCashCheckout()
  }

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-400">Hóa đơn</p>
          <h2 className="m-0 text-lg font-bold text-slate-800">{formatCurrencyVND(totalAmount)}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            icon="pi pi-desktop"
            label="Màn khách"
            text
            className="!h-9 !rounded-lg !px-2 !text-xs !font-semibold !text-[#214388]"
            onClick={onOpenCustomerDisplay}
          />
          <Button
            type="button"
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            disabled={!hasInvoiceItem || isSubmitting}
            aria-label="Xóa hóa đơn"
            onClick={onClearCart}
          />
        </div>
      </div>

      <div className="shrink-0 space-y-3 border-b border-slate-100 p-4">
        {selectedBooking ? (
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-slate-400">Khách hàng</p>
            <div className="mt-2 rounded-lg bg-[#f8fafc] px-3 py-2">
              <p className="m-0 truncate text-sm font-semibold text-slate-800">{selectedBookingName}</p>
              <p className="m-0 mt-0.5 truncate text-xs text-slate-500">{selectedBookingContact}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-slate-400">Khách hàng</p>
                {verifiedCustomer && <p className="m-0 mt-0.5 text-sm font-semibold text-slate-800">Gắn với hồ sơ customer</p>}
              </div>
              {!verifiedCustomer && (
                <Button
                  type="button"
                  text
                  rounded
                  aria-label="Đăng ký customer"
                  className="!h-9 !w-9 !text-[#214388]"
                  disabled={isSubmitting}
                  onClick={onOpenCreateCustomer}
                >
                  <span className="relative inline-flex h-5 w-5 items-center justify-center">
                    <i className="pi pi-user text-[15px]" />
                  <i className="pi pi-plus absolute -right-1 -top-1 text-[9px] font-bold" />
                  </span>
                </Button>
              )}
            </div>

            <label className="mb-1 block text-sm text-slate-700">Số điện thoại</label>
            <AutoComplete
              value={customerPhone}
              suggestions={customerSuggestions}
              field="phone"
              delay={250}
              minLength={1}
              completeMethod={(event) => onCustomerPhoneSuggest(event.query)}
              itemTemplate={customerSuggestionTemplate}
              emptyMessage="Không tìm thấy khách hàng"
              inputClassName={invoiceInputClassName}
              className="w-full"
              panelClassName="!rounded-xl !border !border-slate-200 !shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
              disabled={isSubmitting}
              onChange={(event: AutoCompleteChangeEvent) => {
                const value = event.value
                if (typeof value === "string") {
                  onCustomerPhoneChange(value)
                  return
                }
                if (value && typeof value === "object") {
                  onCustomerSuggestionSelect(value as CustomerDTO)
                }
              }}
              onSelect={(event: AutoCompleteSelectEvent) => onCustomerSuggestionSelect(event.value as CustomerDTO)}
            />

            {verifiedCustomer ? (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <i className="pi pi-check text-xs" />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-semibold text-emerald-900">{verifiedCustomer.fullName}</p>
                    <p className="m-0 mt-0.5 truncate text-xs text-emerald-700">{verifiedCustomer.phone}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-700">Ghi chú</label>
          {selectedBooking ? (
            <div className="min-h-[54px] rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-slate-700">{selectedBooking.note || ""}</div>
          ) : (
            <InputTextarea
              value={note}
              autoResize
              rows={2}
              maxLength={255}
              className={`${invoiceInputClassName} !min-h-[70px] resize-none`}
              disabled={isSubmitting}
              onChange={(event) => onNoteChange(event.target.value)}
            />
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {selectedBooking ? (
          <div>
            <div className="mb-3 rounded-lg bg-[#f8fafc] px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 truncate font-mono text-xs font-semibold text-[#214388]">{selectedBooking.bookingCode}</p>
                  <p className="m-0 mt-0.5 text-xs text-slate-500">{formatDateTimeViVN(selectedBooking.startAt || selectedBooking.time)}</p>
                </div>
                <Tag value={selectedBooking.statusLabel || "Đã xác nhận"} severity="info" className="!shrink-0 !rounded-md" />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {selectedBooking.items.map((item, index) => {
                const quantity = Number(item.quantity)
                const unitPrice = Number(item.unitPrice)
                const amount = Number(item.amount)
                const itemLabel = getBookingItemLabel(item.itemType)

                return (
                  <div key={`${item.refId ?? item.id}-${index}`} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex min-w-0 items-center gap-1.5">
                          <Tag
                            value={itemLabel}
                            severity={getBookingItemSeverity(item.itemType)}
                            className="!inline-flex !h-5 !shrink-0 !items-center !whitespace-nowrap !rounded !px-1.5 !py-0 !text-[10px] !font-semibold"
                          />
                          <span className="text-[11px] text-slate-400">x{quantity}</span>
                        </div>
                        <p className="m-0 truncate text-sm font-semibold text-slate-800">{item.name}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(amount)}</p>
                        <p className="m-0 text-[11px] text-slate-400">{formatCurrencyVND(unitPrice)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {cart.map((item) => {
                const maxQuantity = Math.max(1, Number(item.stockQty ?? 1))
                return (
                  <div key={getSaleItemKey(item)} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex min-w-0 items-center gap-1.5">
                          <Tag
                            value="Sản phẩm"
                            severity="info"
                            className="!inline-flex !h-5 !shrink-0 !items-center !whitespace-nowrap !rounded !px-1.5 !py-0 !text-[10px] !font-semibold"
                          />
                          <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">{item.code || item.category || item.unitLabel}</span>
                        </div>
                        <p className="m-0 truncate text-sm font-semibold text-slate-800">{item.name}</p>
                      </div>
                      <Button
                        type="button"
                        icon="pi pi-times"
                        text
                        rounded
                        severity="secondary"
                        aria-label="Xóa mặt hàng"
                        className="!h-7 !w-7 !shrink-0"
                        disabled={isSubmitting}
                        onClick={() => onRemoveItem(item)}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          icon="pi pi-minus"
                          text
                          rounded
                          severity="secondary"
                          className="!h-7 !w-7"
                          disabled={isSubmitting || item.quantity <= 1}
                          onClick={() => onQuantityChange(item, item.quantity - 1)}
                        />
                        <span className="flex h-7 min-w-8 items-center justify-center rounded-md bg-white px-2 text-sm font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          icon="pi pi-plus"
                          text
                          rounded
                          severity="secondary"
                          className="!h-7 !w-7"
                          disabled={isSubmitting || item.quantity >= maxQuantity}
                          onClick={() => onQuantityChange(item, item.quantity + 1)}
                        />
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(item.unitPrice * item.quantity)}</p>
                        <p className="m-0 text-[11px] text-slate-400">{formatCurrencyVND(item.unitPrice)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {selectedBooking.items.length === 0 && cart.length === 0 && (
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 text-center">
                  <i className="pi pi-sparkles mb-3 text-3xl text-slate-300" />
                  <p className="m-0 text-sm font-semibold text-slate-600">Booking chưa có dịch vụ</p>
                </div>
              )}
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 text-center">
            <i className="pi pi-shopping-cart mb-3 text-3xl text-slate-300" />
            <p className="m-0 text-sm font-semibold text-slate-600">Hóa đơn trống</p>
            <p className="mb-0 mt-1 text-xs text-slate-400">Chưa có mặt hàng</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cart.map((item) => {
              const maxQuantity = item.type === "PRODUCT" ? Math.max(1, Number(item.stockQty ?? 1)) : 99
              return (
                <div key={getSaleItemKey(item)} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex min-w-0 items-center gap-1.5">
                        <Tag
                          value={getSaleItemTypeLabel(item.type)}
                          severity={item.type === "PRODUCT" ? "info" : "success"}
                          className="!inline-flex !h-5 !shrink-0 !items-center !whitespace-nowrap !rounded !px-1.5 !py-0 !text-[10px] !font-semibold [&_.p-tag-value]:!whitespace-nowrap"
                        />
                        <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">{item.code || item.category || item.unitLabel}</span>
                      </div>
                      <p className="m-0 truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    </div>
                    <Button
                      type="button"
                      icon="pi pi-times"
                      text
                      rounded
                      severity="secondary"
                      aria-label="Xóa mặt hàng"
                      className="!h-7 !w-7 !shrink-0"
                      disabled={isSubmitting}
                      onClick={() => onRemoveItem(item)}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        icon="pi pi-minus"
                        text
                        rounded
                        severity="secondary"
                        className="!h-7 !w-7"
                        disabled={isSubmitting || item.quantity <= 1}
                        onClick={() => onQuantityChange(item, item.quantity - 1)}
                      />
                      <span className="flex h-7 min-w-8 items-center justify-center rounded-md bg-white px-2 text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        icon="pi pi-plus"
                        text
                        rounded
                        severity="secondary"
                        className="!h-7 !w-7"
                        disabled={isSubmitting || item.quantity >= maxQuantity}
                        onClick={() => onQuantityChange(item, item.quantity + 1)}
                      />
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(item.unitPrice * item.quantity)}</p>
                      <p className="m-0 text-[11px] text-slate-400">{formatCurrencyVND(item.unitPrice)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-100 p-4">
        {!isBookingInvoice && (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Giảm giá</label>
            <span className="relative block">
              <InputText
                value={discountInputValue}
                inputMode="numeric"
                placeholder="0"
                className={`${invoiceInputClassName} !pr-8`}
                disabled={isSubmitting || cart.length === 0}
                onChange={(event) => handleDiscountInputChange(event.target.value)}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[#73849b]">đ</span>
            </span>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span>Tạm tính</span>
            <span>{formatCurrencyVND(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Giảm giá</span>
            <span>-{formatCurrencyVND(appliedDiscount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-800">
            <span>Tổng thanh toán</span>
            <span>{formatCurrencyVND(totalAmount)}</span>
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Phương thức thanh toán</label>
          <Dropdown
            value={paymentMethod}
            options={paymentMethodOptions}
            optionLabel="label"
            optionValue="value"
            filter
            filterBy="label,value"
            filterPlaceholder="Tìm phương thức"
            emptyFilterMessage="Không tìm thấy phương thức"
            className={paymentMethodDropdownClassName}
            panelClassName="text-sm"
            disabled={!hasInvoiceItem || isSubmitting || hasShownPaymentQr}
            onChange={(event) => setPaymentMethod(event.value as PaymentMethod)}
          />
        </div>

        <Button
          type="button"
          label={paymentButtonLabel}
          icon={paymentButtonIcon}
          className="mt-4 w-full !justify-center !rounded-lg !py-3"
          disabled={!hasInvoiceItem || isSubmitting}
          loading={isSubmitting}
          onClick={handlePaymentAction}
        />
      </div>
    </aside>
  )
}

function customerSuggestionTemplate(customer: CustomerDTO) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-1 py-1">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef3fb] text-[#214388]">
        <i className="pi pi-user text-sm" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-semibold text-slate-800">{customer.fullName}</p>
        <p className="m-0 mt-0.5 truncate text-xs text-slate-500">{customer.phone}</p>
      </div>
    </div>
  )
}

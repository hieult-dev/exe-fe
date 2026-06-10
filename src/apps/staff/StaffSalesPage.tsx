import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { ProgressSpinner } from "primereact/progressspinner"
import { TabPanel, TabView } from "primereact/tabview"
import { checkoutBooking, getBookingsByDay, updateBookingStatus } from "@/apps/bookings/api/bookingApi"
import type { BookingCheckoutItemRequest, BookingDTO } from "@/apps/bookings/model"
import { createInvoice } from "@/apps/invoices/api/invoiceApi"
import { manualConfirmPayment } from "@/apps/payments/api/paymentApi"
import type { ManualPaymentConfirmRequest } from "@/apps/payments/model"
import { createOrder } from "@/apps/orders/api/orderApi"
import type { OrderDTO } from "@/apps/orders/model"
import { getDefaultShopPaymentConfig } from "@/apps/payment_config/api/shopPaymentConfigApi"
import type { ShopPaymentConfigDTO } from "@/apps/payment_config/model"
import { getProducts } from "@/apps/product/api/productApi"
import type { ProductDTO } from "@/apps/product/model"
import { suggestCustomersByPhone } from "@/apps/staff/api/customerApi"
import { CustomerRegistrationDialog } from "@/apps/staff/components/CustomerRegistrationDialog"
import { SaleCatalogCard } from "@/apps/staff/components/SaleCatalogCard"
import { SaleInvoicePanel } from "@/apps/staff/components/SaleInvoicePanel"
import { StaffBookingCard } from "@/apps/staff/components/StaffBookingCard"
import { useStaffSalesSearch, type StaffSalesSearchSuggestion } from "@/apps/staff/context/StaffSalesSearchContext"
import {
  getSaleItemKey,
  type CustomerDisplayInvoiceLine,
  type CustomerDisplayInvoiceLineType,
  type CustomerDisplayInvoiceSnapshot,
  type CustomerDisplayPaymentQr,
  type CustomerDTO,
  type SaleCartItem,
  type SaleCatalogItem,
} from "@/apps/staff/model"
import { publishCustomerDisplaySnapshot } from "@/apps/staff/utils/customerDisplay"
import { useUserStore } from "@/apps/user/store/UserStore"
import { resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { notify } from "@/common/toast/ToastHelper"
import { getImageUrlOrNotFound } from "@/common/utils/url"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const record = error as { message?: unknown; error?: unknown }
    if (typeof record.message === "string") return record.message
    if (typeof record.error === "string") return record.error
  }
  return fallback
}

function toProductSaleItem(product: ProductDTO): SaleCatalogItem {
  return {
    type: "PRODUCT",
    id: product.id,
    name: product.name,
    code: product.sku,
    category: product.categoryName,
    unitLabel: product.unit || "sản phẩm",
    unitPrice: product.price,
    active: product.active,
    stockQty: product.stockQty,
    imageUrl: getImageUrlOrNotFound(product.imageUrls?.find((imageUrl) => Boolean(imageUrl?.trim()))),
  }
}

function matchesCustomerName(booking: BookingDTO, query: string) {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return true
  const displayName = booking.customerFullName || booking.customerName || booking.userFullName || ""
  return displayName.toLowerCase().includes(keyword)
}

function toLocalDateParam(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function matchesProductQuery(item: SaleCatalogItem, query: string) {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return true

  return [item.name, item.code, item.category].some((value) => value?.toLowerCase().includes(keyword))
}

function getBookingLineType(itemType: string | undefined): CustomerDisplayInvoiceLineType {
  if (itemType === "PRODUCT" || itemType === "PACKAGE_REDEEM" || itemType === "ADJUSTMENT") return itemType
  return "SERVICE"
}

function buildVietQrUrl(config: ShopPaymentConfigDTO, amount: number, orderCode: string) {
  const bankCode = encodeURIComponent(config.bankCode.trim())
  const accountNumber = encodeURIComponent(config.accountNumber.trim())

  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(config.accountName)}`
}

function toPaymentQr(
  config: ShopPaymentConfigDTO,
  amount: number,
  orderCode: string,
  paymentRefs?: Pick<CustomerDisplayPaymentQr, "invoiceId" | "orderId" | "bookingId">
): CustomerDisplayPaymentQr {
  return {
    url: buildVietQrUrl(config, amount, orderCode),
    orderCode,
    invoiceId: paymentRefs?.invoiceId ?? null,
    orderId: paymentRefs?.orderId ?? null,
    bookingId: paymentRefs?.bookingId ?? null,
    amount,
    bankCode: config.bankCode,
    accountNumber: config.accountNumber,
    accountName: config.accountName,
    displayName: config.displayName,
  }
}

async function createInvoiceForOrder(order: OrderDTO) {
  return createInvoice({
    userId: order.userId,
    customerId: order.customerId,
    bookingId: null,
    orderId: order.id,
    totalAmount: order.totalAmount,
    status: "ISSUED",
    issuedAt: new Date().toISOString(),
  })
}

function toBookingCheckoutItems(booking: BookingDTO, addOnProducts: SaleCartItem[]): BookingCheckoutItemRequest[] {
  const bookingItems = booking.items.map((item) => ({
    itemType: item.itemType,
    refId: item.refId,
    petId: item.petId ?? undefined,
    qty: item.quantity,
    unitPrice: item.unitPrice,
  }))

  const productItems = addOnProducts.map((item) => ({
    itemType: "PRODUCT" as const,
    refId: item.id,
    qty: item.quantity,
    unitPrice: item.unitPrice,
  }))

  return [...bookingItems, ...productItems]
}

async function checkoutBookingInvoice(booking: BookingDTO, addOnProducts: SaleCartItem[]) {
  return checkoutBooking(booking.id, {
    items: toBookingCheckoutItems(booking, addOnProducts),
    issuedAt: new Date().toISOString(),
  })
}

async function confirmManualPayment(data: ManualPaymentConfirmRequest) {
  return manualConfirmPayment(data)
}

export function StaffSalesPage() {
  const { currentShopId, shops } = useUserStore()
  const {
    debouncedSearchQuery,
    setSearchQuery,
    setSuggestions,
    setSuggestionMode,
    setSuggestionsLoading,
    setSuggestionSelectHandler,
  } = useStaffSalesSearch()
  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  const [activeTab, setActiveTab] = useState(0)

  const [products, setProducts] = useState<SaleCatalogItem[]>([])
  const [productCursor, setProductCursor] = useState<number | null>(null)
  const [productHasNext, setProductHasNext] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsLoadingMore, setProductsLoadingMore] = useState(false)

  const [addOnProducts, setAddOnProducts] = useState<SaleCatalogItem[]>([])
  const [addOnProductCursor, setAddOnProductCursor] = useState<number | null>(null)
  const [addOnProductHasNext, setAddOnProductHasNext] = useState(false)
  const [addOnProductsLoading, setAddOnProductsLoading] = useState(false)
  const [addOnProductsLoadingMore, setAddOnProductsLoadingMore] = useState(false)
  const [addOnProductQuery, setAddOnProductQuery] = useState("")

  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [startingBookingId, setStartingBookingId] = useState<number | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null)

  const [cart, setCart] = useState<SaleCartItem[]>([])
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerDTO[]>([])
  const [verifiedCustomer, setVerifiedCustomer] = useState<CustomerDTO | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomerDialogVisible, setIsCustomerDialogVisible] = useState(false)
  const [paymentQr, setPaymentQr] = useState<CustomerDisplayPaymentQr | null>(null)

  const cartSubtotal = useMemo(() => cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0), [cart])
  const filteredBookings = useMemo(
    () => bookings.filter((booking) => matchesCustomerName(booking, debouncedSearchQuery)),
    [bookings, debouncedSearchQuery]
  )
  const filteredAddOnProducts = useMemo(
    () => addOnProducts.filter((item) => matchesProductQuery(item, addOnProductQuery)),
    [addOnProductQuery, addOnProducts]
  )
  const customerDisplaySnapshot = useMemo<CustomerDisplayInvoiceSnapshot>(() => {
    const updatedAt = new Date().toISOString()

    if (selectedBooking) {
      const bookingLines: CustomerDisplayInvoiceLine[] = selectedBooking.items.map((item) => {
        const type = getBookingLineType(item.itemType)
        const qty = Number(item.quantity)
        const unitPrice = Number(item.unitPrice)
        const amount = Number(item.amount)

        return {
          type,
          name: item.name,
          qty,
          unitPrice,
          amount,
        }
      })
      const productLines: CustomerDisplayInvoiceLine[] = cart.map((item) => ({
        type: "PRODUCT",
        name: item.name,
        imageUrl: item.imageUrl,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.unitPrice * item.quantity,
      }))
      const nextSubtotal = selectedBooking.totalAmount + cartSubtotal

      return {
        mode: "BOOKING",
        code: selectedBooking.bookingCode,
        customerName: selectedBooking.customerFullName || selectedBooking.customerName || selectedBooking.userFullName || undefined,
        lines: [...bookingLines, ...productLines],
        subtotal: nextSubtotal,
        discountAmount: 0,
        totalAmount: nextSubtotal,
        paymentQr,
        updatedAt,
      }
    }

    if (cart.length > 0) {
      const nextDiscount = Math.min(discountAmount, cartSubtotal)

      return {
        mode: "ORDER",
        customerName: verifiedCustomer?.fullName,
        lines: cart.map((item) => ({
          type: "PRODUCT",
          name: item.name,
          imageUrl: item.imageUrl,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.unitPrice * item.quantity,
        })),
        subtotal: cartSubtotal,
        discountAmount: nextDiscount,
        totalAmount: Math.max(0, cartSubtotal - nextDiscount),
        paymentQr,
        updatedAt,
      }
    }

    return {
      mode: "EMPTY",
      lines: [],
      subtotal: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentQr: null,
      updatedAt,
    }
  }, [cart, cartSubtotal, discountAmount, paymentQr, selectedBooking, verifiedCustomer])

  useEffect(() => {
    setPaymentQr(null)
  }, [cart, customerId, customerPhone, discountAmount, note, selectedBooking])

  useEffect(() => {
    publishCustomerDisplaySnapshot(customerDisplaySnapshot)
  }, [customerDisplaySnapshot])

  const loadProducts = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!productHasNext || productsLoadingMore || productCursor === null) return
      setProductsLoadingMore(true)
    } else {
      setProductsLoading(true)
    }

    try {
      const result = await getProducts(60, isLoadMore ? productCursor : null, debouncedSearchQuery, true)
      const mapped = result.content.map(toProductSaleItem)

      if (isLoadMore) {
        setProducts((prev) => {
          const prevKeys = new Set(prev.map(getSaleItemKey))
          return [...prev, ...mapped.filter((item) => !prevKeys.has(getSaleItemKey(item)))]
        })
      } else {
        setProducts(mapped)
      }

      setProductCursor(result.nextCursor ?? null)
      setProductHasNext(result.hasNext ?? false)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách sản phẩm."))
    } finally {
      if (isLoadMore) {
        setProductsLoadingMore(false)
      } else {
        setProductsLoading(false)
      }
    }
  }

  const loadAddOnProducts = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!addOnProductHasNext || addOnProductsLoadingMore || addOnProductCursor === null) return
      setAddOnProductsLoadingMore(true)
    } else {
      setAddOnProductsLoading(true)
    }

    try {
      const result = await getProducts(60, isLoadMore ? addOnProductCursor : null, "", true)
      const mapped = result.content.map(toProductSaleItem)

      if (isLoadMore) {
        setAddOnProducts((prev) => {
          const prevKeys = new Set(prev.map(getSaleItemKey))
          return [...prev, ...mapped.filter((item) => !prevKeys.has(getSaleItemKey(item)))]
        })
      } else {
        setAddOnProducts(mapped)
      }

      setAddOnProductCursor(result.nextCursor ?? null)
      setAddOnProductHasNext(result.hasNext ?? false)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách sản phẩm mua kèm."))
    } finally {
      if (isLoadMore) {
        setAddOnProductsLoadingMore(false)
      } else {
        setAddOnProductsLoading(false)
      }
    }
  }

  const loadBookings = async () => {
    setBookingsLoading(true)

    try {
      const result = await getBookingsByDay(toLocalDateParam())
      setBookings(result)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được booking dịch vụ hôm nay."))
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 0) {
      loadProducts(false)
    }
  }, [activeTab, debouncedSearchQuery])

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    if (activeTab === 1) {
      loadAddOnProducts(false)
    }
  }, [activeTab])

  const addCartItem = useCallback((item: SaleCatalogItem) => {
    setCart((prev) => {
      const key = getSaleItemKey(item)
      const existing = prev.find((cartItem) => getSaleItemKey(cartItem) === key)
      const maxQuantity = Number(item.stockQty ?? 0)

      if (existing) {
        if (existing.quantity >= maxQuantity) return prev
        return prev.map((cartItem) =>
          getSaleItemKey(cartItem) === key ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }

      return [{ ...item, quantity: 1 }, ...prev]
    })
  }, [])

  const addToOrderCart = useCallback(
    (item: SaleCatalogItem) => {
      setSelectedBooking(null)
      addCartItem(item)
    },
    [addCartItem]
  )

  const addProductToBooking = useCallback(
    (item: SaleCatalogItem) => {
      if (!selectedBooking) {
        notify.error("Vui lòng chọn booking trước khi thêm sản phẩm mua kèm.")
        return
      }
      addCartItem(item)
    },
    [addCartItem, selectedBooking]
  )

  useEffect(() => {
    setSuggestionSelectHandler((suggestion: StaffSalesSearchSuggestion) => {
      if (suggestion.type === "BOOKING") {
        selectBooking(suggestion.booking)
        return
      }
      addToOrderCart(suggestion.product)
    })
    return () => setSuggestionSelectHandler(null)
  }, [addToOrderCart, setSuggestionSelectHandler])

  useEffect(() => {
    setSuggestionMode(activeTab === 1 ? "BOOKING" : "PRODUCT")
  }, [activeTab, setSuggestionMode])

  useEffect(() => {
    if (!debouncedSearchQuery) {
      setSuggestions([])
      return
    }

    if (activeTab === 1) {
      setSuggestions(filteredBookings.map((booking) => ({ type: "BOOKING", booking })))
      return
    }

    setSuggestions(products.map((product) => ({ type: "PRODUCT", product })))
  }, [activeTab, debouncedSearchQuery, filteredBookings, products, setSuggestions])

  useEffect(() => {
    setSuggestionsLoading(activeTab === 1 ? bookingsLoading : productsLoading)
  }, [activeTab, bookingsLoading, productsLoading, setSuggestionsLoading])

  const changeQuantity = (item: SaleCartItem, quantity: number) => {
    const maxQuantity = item.type === "PRODUCT" ? Math.max(1, Number(item.stockQty ?? 1)) : 99
    const nextQuantity = Math.min(Math.max(1, Math.floor(quantity || 1)), maxQuantity)

    setCart((prev) =>
      prev.map((cartItem) =>
        getSaleItemKey(cartItem) === getSaleItemKey(item) ? { ...cartItem, quantity: nextQuantity } : cartItem
      )
    )
  }

  const removeItem = (item: SaleCartItem) => {
    setCart((prev) => prev.filter((cartItem) => getSaleItemKey(cartItem) !== getSaleItemKey(item)))
  }

  const clearCart = () => {
    setCart([])
    setSelectedBooking(null)
    setCustomerId(null)
    setCustomerPhone("")
    setCustomerSuggestions([])
    setVerifiedCustomer(null)
    setDiscountAmount(0)
    setPaymentQr(null)
    setNote("")
  }

  const changeSaleTab = (index: number) => {
    if (index === activeTab) return
    clearCart()
    setSearchQuery("")
    setSuggestions([])
    setAddOnProductQuery("")
    setActiveTab(index)
  }

  function selectBooking(booking: BookingDTO) {
    if (booking.status !== "IN_PROGRESS") {
      notify.error("Chỉ có thể thanh toán lịch hẹn đang thực hiện.")
      return
    }

    setSelectedBooking(booking)
    setCart([])
    setDiscountAmount(0)
    setPaymentQr(null)
    setNote(booking.note ?? "")
  }

  const startBooking = async (booking: BookingDTO) => {
    if (booking.status !== "CONFIRMED") return

    setStartingBookingId(booking.id)
    try {
      await updateBookingStatus(booking.id, "IN_PROGRESS")
      const updatedBooking = {
        ...booking,
        status: "IN_PROGRESS" as const,
        statusLabel: "Đang thực hiện",
      }

      setBookings((prev) => prev.map((item) => (item.id === booking.id ? updatedBooking : item)))
      setSelectedBooking((prev) => (prev?.id === booking.id ? updatedBooking : prev))
      notify.success(`Đã xác nhận tiến hành lịch hẹn ${booking.bookingCode}.`)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể xác nhận tiến hành lịch hẹn."))
    } finally {
      setStartingBookingId(null)
    }
  }

  const removeBookingFromList = (bookingId: number) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== bookingId))
  }

  const openCustomerDisplay = () => {
    publishCustomerDisplaySnapshot(customerDisplaySnapshot)
    window.open("/shop/sales/customer-display", "pawly-customer-display", "popup,width=960,height=900")?.focus()
  }

  const handleCustomerCreated = (customer: CustomerDTO) => {
    setCustomerId(customer.id)
    setCustomerPhone(customer.phone ?? "")
    setCustomerSuggestions([])
    setVerifiedCustomer(customer)
  }

  const changeCustomerPhone = (value: string) => {
    setCustomerPhone(value)
    setCustomerId(null)
    setVerifiedCustomer(null)
  }

  const suggestKnownCustomers = async (query: string) => {
    const phone = query.trim()
    if (!phone) {
      setCustomerSuggestions([])
      return
    }

    try {
      const customers = await suggestCustomersByPhone(phone, 10)
      setCustomerSuggestions(customers)
    } catch {
      setCustomerSuggestions([])
    }
  }

  const selectKnownCustomer = (customer: CustomerDTO) => {
    setCustomerId(customer.id)
    setCustomerPhone(customer.phone)
    setCustomerSuggestions([])
    setVerifiedCustomer(customer)
  }

  const showPaymentQr = async () => {
    if (!currentShop) {
      notify.error("Không xác định được shop hiện tại.")
      return
    }

    if (paymentQr) return

    if (selectedBooking) {
      const checkoutItems = toBookingCheckoutItems(selectedBooking, cart)
      if (checkoutItems.length === 0) {
        notify.error("Booking chưa có dịch vụ hoặc sản phẩm để thanh toán.")
        return
      }

      setIsSubmitting(true)
      try {
        const checkoutResult = await checkoutBookingInvoice(selectedBooking, cart)
        const amount = Number(checkoutResult.invoice.totalAmount)
        if (amount <= 0) {
          notify.error("Số tiền thanh toán phải lớn hơn 0.")
          return
        }

        const paymentConfig = await getDefaultShopPaymentConfig()
        setPaymentQr(
          toPaymentQr(paymentConfig, amount, selectedBooking.bookingCode, {
            invoiceId: checkoutResult.invoice.id,
            bookingId: selectedBooking.id,
          })
        )
        notify.success("Đã chốt hóa đơn booking và hiển thị QR thanh toán.")
      } catch (error) {
        notify.error(getErrorMessage(error, "Không chốt được hóa đơn booking để hiển thị QR."))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (cart.length === 0) {
      notify.error("Hóa đơn chưa có mặt hàng.")
      return
    }

    if (customerPhone.trim() && (!customerId || customerId <= 0)) {
      notify.error("Vui lòng chọn khách quen trong danh sách gợi ý hoặc xóa SĐT để bán cho khách lẻ.")
      return
    }

    const discountForRequest = Math.min(discountAmount, cartSubtotal)
    const expectedAmount = Math.max(0, cartSubtotal - discountForRequest)
    if (expectedAmount <= 0) {
      notify.error("Số tiền thanh toán phải lớn hơn 0.")
      return
    }

    setIsSubmitting(true)
    try {
      const paymentConfig = await getDefaultShopPaymentConfig()
      const createdOrder = await createOrder({
        customerId: customerId && customerId > 0 ? customerId : null,
        source: "STAFF",
        shippingFee: 0,
        discountAmount: discountForRequest,
        note: note.trim() || (!customerId ? "Khách mua trực tiếp tại quầy" : undefined),
        items: cart.map((item) => ({
          productId: item.id,
          qty: item.quantity,
        })),
      })
      const orderCode = createdOrder.orderCode || `ORDER-${createdOrder.id}`
      const amount = Number(createdOrder.totalAmount || expectedAmount)
      const createdInvoice = await createInvoiceForOrder(createdOrder)

      setPaymentQr(
        toPaymentQr(paymentConfig, amount, orderCode, {
          invoiceId: createdInvoice.id,
          orderId: createdOrder.id,
        })
      )
      notify.success(`Đã tạo hóa đơn ${orderCode} và hiển thị QR thanh toán.`)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tạo được QR thanh toán."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const cashCheckout = async () => {
    if (!currentShop) {
      notify.error("Không xác định được shop hiện tại.")
      return
    }

    if (paymentQr) return

    if (selectedBooking) {
      const checkoutItems = toBookingCheckoutItems(selectedBooking, cart)
      if (checkoutItems.length === 0) {
        notify.error("Booking chưa có dịch vụ hoặc sản phẩm để thanh toán.")
        return
      }

      setIsSubmitting(true)
      try {
        const checkoutResult = await checkoutBookingInvoice(selectedBooking, cart)
        await confirmManualPayment({
          invoiceId: checkoutResult.invoice.id,
          bookingId: selectedBooking.id,
          paidAmount: checkoutResult.invoice.totalAmount,
          paymentMethod: "CASH",
        })
        notify.success(`Đã thanh toán tiền mặt và hoàn tất booking ${selectedBooking.bookingCode}.`)
        setCart([])
        setSelectedBooking(null)
        setDiscountAmount(0)
        setPaymentQr(null)
        setNote("")
        removeBookingFromList(selectedBooking.id)
        if (cart.length > 0) loadProducts(false)
      } catch (error) {
        notify.error(getErrorMessage(error, "Không hoàn tất được booking dịch vụ."))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (cart.length === 0) {
      notify.error("Hóa đơn chưa có mặt hàng.")
      return
    }

    if (customerPhone.trim() && (!customerId || customerId <= 0)) {
      notify.error("Vui lòng chọn khách quen trong danh sách gợi ý hoặc xóa SĐT để bán cho khách lẻ.")
      return
    }

    setIsSubmitting(true)
    try {
      const createdOrder = await createOrder({
        customerId: customerId && customerId > 0 ? customerId : null,
        source: "STAFF",
        shippingFee: 0,
        discountAmount: Math.min(discountAmount, cartSubtotal),
        note: note.trim() || (!customerId ? "Khách mua trực tiếp tại quầy" : undefined),
        items: cart.map((item) => ({
          productId: item.id,
          qty: item.quantity,
        })),
      })
      const createdInvoice = await createInvoiceForOrder(createdOrder)

      await confirmManualPayment({
        invoiceId: createdInvoice.id,
        orderId: createdOrder.id,
        paidAmount: createdOrder.totalAmount,
        paymentMethod: "CASH",
        note: note.trim() || "Khách thanh toán tiền mặt tại quầy",
      })
      notify.success(`Đã thanh toán tiền mặt cho hóa đơn ${createdOrder.orderCode || `#${createdOrder.id}`}.`)
      setCart([])
      setSelectedBooking(null)
      setCustomerId(null)
      setCustomerPhone("")
      setCustomerSuggestions([])
      setVerifiedCustomer(null)
      setDiscountAmount(0)
      setPaymentQr(null)
      setNote("")
      loadProducts(false)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tạo được hóa đơn tiền mặt."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmQrPayment = async () => {
    if (!paymentQr) return

    if (selectedBooking) {
      if (typeof paymentQr.invoiceId !== "number" || typeof paymentQr.bookingId !== "number") {
        notify.error("Thiếu thông tin invoice/booking để xác nhận thanh toán QR.")
        return
      }

      setIsSubmitting(true)
      try {
        await confirmManualPayment({
          invoiceId: paymentQr.invoiceId,
          bookingId: paymentQr.bookingId,
          paidAmount: paymentQr.amount,
          paymentMethod: "BANK_TRANSFER",
        })
        notify.success(`Đã xác nhận thanh toán QR cho booking ${selectedBooking.bookingCode}.`)
        setCart([])
        setSelectedBooking(null)
        setDiscountAmount(0)
        setPaymentQr(null)
        setNote("")
        removeBookingFromList(selectedBooking.id)
        if (cart.length > 0) loadProducts(false)
      } catch (error) {
        notify.error(getErrorMessage(error, "Không xác nhận được thanh toán QR cho booking."))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (typeof paymentQr.invoiceId !== "number" || typeof paymentQr.orderId !== "number") {
      notify.error("Thiếu thông tin invoice/order để xác nhận thanh toán QR.")
      return
    }

    setIsSubmitting(true)
    try {
      await confirmManualPayment({
        invoiceId: paymentQr.invoiceId,
        orderId: paymentQr.orderId,
        paidAmount: paymentQr.amount,
        paymentMethod: "BANK_TRANSFER",
        note: note.trim() || "Khách chuyển khoản tại quầy",
      })
      notify.success(`Đã xác nhận thanh toán QR cho hóa đơn ${paymentQr.orderCode}.`)
      setCart([])
      setSelectedBooking(null)
      setCustomerId(null)
      setCustomerPhone("")
      setCustomerSuggestions([])
      setVerifiedCustomer(null)
      setDiscountAmount(0)
      setPaymentQr(null)
      setNote("")
      loadProducts(false)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không xác nhận được thanh toán QR cho hóa đơn."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCatalogGrid = (
    items: SaleCatalogItem[],
    isLoading: boolean,
    hasNext: boolean,
    isLoadingMore: boolean,
    onLoadMore: () => void,
    onAdd: (item: SaleCatalogItem) => void
  ) => {
    if (isLoading) {
      return (
        <div className="flex min-h-[320px] items-center justify-center">
          <ProgressSpinner strokeWidth="4" className="!h-10 !w-10" />
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-center">
          <i className="pi pi-search mb-3 text-3xl text-slate-300" />
          <p className="m-0 text-sm font-semibold text-slate-600">Không có kết quả phù hợp</p>
          <p className="mb-0 mt-1 text-xs text-slate-400">Danh sách trống</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <SaleCatalogCard key={getSaleItemKey(item)} item={item} onAdd={onAdd} />
          ))}
        </div>
        {hasNext && (
          <div className="flex justify-center">
            <Button
              type="button"
              label={isLoadingMore ? "Đang tải" : "Tải thêm"}
              icon="pi pi-angle-down"
              outlined
              loading={isLoadingMore}
              onClick={onLoadMore}
            />
          </div>
        )}
      </div>
    )
  }

  const renderAddOnProductSection = () => (
    <div className="border-t border-slate-100 pt-4">
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-400">Mua kèm</p>
          <h2 className="m-0 text-base font-bold text-slate-800">Thêm sản phẩm vào booking</h2>
        </div>
        <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg bg-[#f8fafc] px-3 text-slate-500 lg:w-72">
          <i className="pi pi-search text-xs text-slate-400" />
          <InputText
            value={addOnProductQuery}
            className="!w-full !border-0 !bg-transparent !p-0 !text-sm !text-slate-700 !shadow-none !outline-none focus:!shadow-none"
            onChange={(event) => setAddOnProductQuery(event.target.value)}
          />
        </div>
      </div>
      {renderCatalogGrid(
        filteredAddOnProducts,
        addOnProductsLoading,
        addOnProductHasNext,
        addOnProductsLoadingMore,
        () => loadAddOnProducts(true),
        addProductToBooking
      )}
    </div>
  )

  const renderBookingGrid = () => {
    return (
      <div className="space-y-4">
        {bookingsLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <ProgressSpinner strokeWidth="4" className="!h-10 !w-10" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-center">
            <i className="pi pi-calendar mb-3 text-3xl text-slate-300" />
            <p className="m-0 text-sm font-semibold text-slate-600">Không có booking dịch vụ hôm nay</p>
            <p className="mb-0 mt-1 text-xs text-slate-400">Danh sách trống</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredBookings.map((booking) => (
                <StaffBookingCard
                  key={booking.id}
                  booking={booking}
                  selected={selectedBooking?.id === booking.id}
                  starting={startingBookingId === booking.id}
                  onSelect={selectBooking}
                  onStart={startBooking}
                />
              ))}
            </div>
          </>
        )}

        {renderAddOnProductSection()}
      </div>
    )
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr),400px]">
      <section className="flex min-h-0 flex-col rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <div className="mb-3 shrink-0">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-400">Quầy bán hàng</p>
            <h1 className="m-0 text-xl font-bold text-slate-800">Bán hàng tại quầy</h1>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <TabView
            activeIndex={activeTab}
            className="flex h-full min-h-0 flex-col [&_.p-tabview-nav]:!mb-4 [&_.p-tabview-nav]:!inline-flex [&_.p-tabview-nav]:!gap-1.5 [&_.p-tabview-nav]:!rounded-xl [&_.p-tabview-nav]:!border-0 [&_.p-tabview-nav]:!bg-[#f1f5f9] [&_.p-tabview-nav]:!p-1 [&_.p-tabview-nav-link]:!rounded-lg [&_.p-tabview-nav-link]:!border-0 [&_.p-tabview-nav-link]:!bg-transparent [&_.p-tabview-nav-link]:!px-4 [&_.p-tabview-nav-link]:!py-2.5 [&_.p-tabview-nav-link]:!text-sm [&_.p-tabview-nav-link]:!font-semibold [&_.p-tabview-nav-link]:!text-slate-600 [&_.p-tabview-panels]:!min-h-0 [&_.p-tabview-panels]:!flex-1 [&_.p-tabview-panels]:!overflow-y-auto [&_.p-tabview-panels]:!bg-transparent [&_.p-tabview-selected_.p-tabview-nav-link]:!bg-white [&_.p-tabview-selected_.p-tabview-nav-link]:!text-[#214388] [&_.p-tabview-selected_.p-tabview-nav-link]:!shadow-sm [&_.p-highlight_.p-tabview-nav-link]:!bg-white [&_.p-highlight_.p-tabview-nav-link]:!text-[#214388] [&_.p-highlight_.p-tabview-nav-link]:!shadow-sm"
            onTabChange={(event) => changeSaleTab(event.index)}
            panelContainerClassName="!px-0 !pb-0"
          >
            <TabPanel header={`Sản phẩm (${products.length})`} leftIcon="pi pi-box mr-2">
              {renderCatalogGrid(products, productsLoading, productHasNext, productsLoadingMore, () => loadProducts(true), addToOrderCart)}
            </TabPanel>
            <TabPanel header={`Dịch vụ hôm nay (${bookings.length})`} leftIcon="pi pi-calendar mr-2">
              {renderBookingGrid()}
            </TabPanel>
          </TabView>
        </div>
      </section>

      <SaleInvoicePanel
        cart={cart}
        selectedBooking={selectedBooking}
        customerPhone={customerPhone}
        customerSuggestions={customerSuggestions}
        verifiedCustomer={verifiedCustomer}
        discountAmount={discountAmount}
        paymentQr={paymentQr}
        note={note}
        isSubmitting={isSubmitting}
        onCustomerPhoneChange={changeCustomerPhone}
        onCustomerPhoneSuggest={suggestKnownCustomers}
        onCustomerSuggestionSelect={selectKnownCustomer}
        onDiscountChange={setDiscountAmount}
        onNoteChange={setNote}
        onOpenCreateCustomer={() => setIsCustomerDialogVisible(true)}
        onQuantityChange={changeQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onOpenCustomerDisplay={openCustomerDisplay}
        onShowPaymentQr={showPaymentQr}
        onConfirmQrPayment={confirmQrPayment}
        onCashCheckout={cashCheckout}
      />

      <CustomerRegistrationDialog
        visible={isCustomerDialogVisible}
        onHide={() => setIsCustomerDialogVisible(false)}
        onCreated={handleCustomerCreated}
      />
    </div>
  )
}

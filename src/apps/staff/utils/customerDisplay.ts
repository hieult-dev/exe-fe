import type { CustomerDisplayInvoiceSnapshot } from "@/apps/staff/model"

export const CUSTOMER_DISPLAY_CHANNEL = "pawly-staff-customer-display"
export const CUSTOMER_DISPLAY_STORAGE_KEY = "pawly.staff.customerDisplayInvoice"

export function publishCustomerDisplaySnapshot(snapshot: CustomerDisplayInvoiceSnapshot) {
  try {
    window.localStorage.setItem(CUSTOMER_DISPLAY_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // localStorage may be blocked in some browser modes.
  }

  if (!("BroadcastChannel" in window)) return

  const channel = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL)
  channel.postMessage(snapshot)
  channel.close()
}

export function readCustomerDisplaySnapshot() {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_DISPLAY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomerDisplayInvoiceSnapshot) : null
  } catch {
    return null
  }
}

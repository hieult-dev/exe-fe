export type DashboardSummaryDTO = {
  monthlyRevenue: number
  monthlyOrderCount: number
  yearlyRevenue: number
  todayRevenue: number
}

export type MonthlyRevenueDTO = {
  month: number
  revenue: number
}

export type MonthlyOrderDTO = {
  month: number
  orderCount: number
}

export type BookingCategoryStatDTO = {
  categoryId: string
  categoryName: string
  bookingCount: number
}

export type ServiceCategoryStatDTO = {
  categoryId: string
  categoryName: string
  serviceCount: number
}

export type InventoryStatusDTO = {
  inStockCount: number
  lowStockCount: number
  outOfStockCount: number
}

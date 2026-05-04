import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { BookingDTO } from "@/apps/bookings/model"
import type { SaleCatalogItem } from "@/apps/staff/model"

export type StaffSalesSearchSuggestion =
  | { type: "PRODUCT"; product: SaleCatalogItem }
  | { type: "BOOKING"; booking: BookingDTO }
export type StaffSalesSearchSuggestionMode = "PRODUCT" | "BOOKING"

type StaffSalesSearchContextValue = {
  searchQuery: string
  debouncedSearchQuery: string
  suggestions: StaffSalesSearchSuggestion[]
  suggestionMode: StaffSalesSearchSuggestionMode
  suggestionsLoading: boolean
  setSearchQuery: (value: string) => void
  setSuggestions: (items: StaffSalesSearchSuggestion[]) => void
  setSuggestionMode: (value: StaffSalesSearchSuggestionMode) => void
  setSuggestionsLoading: (value: boolean) => void
  setSuggestionSelectHandler: (handler: ((item: StaffSalesSearchSuggestion) => void) | null) => void
  selectSuggestion: (item: StaffSalesSearchSuggestion) => void
}

const StaffSalesSearchContext = createContext<StaffSalesSearchContextValue | null>(null)

export function StaffSalesSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<StaffSalesSearchSuggestion[]>([])
  const [suggestionMode, setSuggestionMode] = useState<StaffSalesSearchSuggestionMode>("PRODUCT")
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionSelectHandler, setSuggestionSelectHandlerState] = useState<((item: StaffSalesSearchSuggestion) => void) | null>(null)

  const setSuggestionSelectHandler = useCallback((handler: ((item: StaffSalesSearchSuggestion) => void) | null) => {
    setSuggestionSelectHandlerState(() => handler)
  }, [])

  const selectSuggestion = useCallback(
    (item: StaffSalesSearchSuggestion) => {
      suggestionSelectHandler?.(item)
    },
    [suggestionSelectHandler]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const value = useMemo<StaffSalesSearchContextValue>(
    () => ({
      searchQuery,
      debouncedSearchQuery,
      suggestions,
      suggestionMode,
      suggestionsLoading,
      setSearchQuery,
      setSuggestions,
      setSuggestionMode,
      setSuggestionsLoading,
      setSuggestionSelectHandler,
      selectSuggestion,
    }),
    [debouncedSearchQuery, searchQuery, selectSuggestion, setSuggestionSelectHandler, suggestionMode, suggestions, suggestionsLoading]
  )

  return <StaffSalesSearchContext.Provider value={value}>{children}</StaffSalesSearchContext.Provider>
}

export function useStaffSalesSearch() {
  const context = useContext(StaffSalesSearchContext)
  if (!context) {
    throw new Error("useStaffSalesSearch must be used within StaffSalesSearchProvider")
  }
  return context
}

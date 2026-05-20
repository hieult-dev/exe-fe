import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type ShopOwnerContextValue = {
  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void
}

const ShopOwnerContext = createContext<ShopOwnerContextValue | null>(null)

type ShopOwnerProviderProps = {
  children: ReactNode
}

export function ShopOwnerProvider({ children }: ShopOwnerProviderProps) {
  const [globalSearchQuery, setGlobalSearchQuery] = useState("")

  const value = useMemo<ShopOwnerContextValue>(
    () => ({
      globalSearchQuery,
      setGlobalSearchQuery,
    }),
    [globalSearchQuery],
  )

  return <ShopOwnerContext.Provider value={value}>{children}</ShopOwnerContext.Provider>
}

export function useShopOwnerContext() {
  const context = useContext(ShopOwnerContext)

  if (!context) {
    throw new Error("useShopOwnerContext must be used within ShopOwnerProvider")
  }

  return context
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  loadShopOwnerData,
  saveShopOwnerData,
  type ShopInfo,
  type ShopMember,
  type ShopOwnerData,
  type ShopService,
} from "@/common/home/page/features/shop-owner/store/shopOwnerStore"

type ShopOwnerContextValue = {
  data: ShopOwnerData
  setShop: (shop: ShopInfo) => void
  setServices: (services: ShopService[]) => void
  setMembers: (members: ShopMember[]) => void
}

const ShopOwnerContext = createContext<ShopOwnerContextValue | null>(null)

type ShopOwnerProviderProps = {
  ownerKey: string
  children: ReactNode
}

export function ShopOwnerProvider({ ownerKey, children }: ShopOwnerProviderProps) {
  const [data, setData] = useState<ShopOwnerData>(() => loadShopOwnerData(ownerKey))

  useEffect(() => {
    setData(loadShopOwnerData(ownerKey))
  }, [ownerKey])

  useEffect(() => {
    saveShopOwnerData(ownerKey, data)
  }, [ownerKey, data])

  const value = useMemo<ShopOwnerContextValue>(
    () => ({
      data,
      setShop: (shop) => setData((prev) => ({ ...prev, shop })),
      setServices: (services) => setData((prev) => ({ ...prev, services })),
      setMembers: (members) => setData((prev) => ({ ...prev, members })),
    }),
    [data]
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


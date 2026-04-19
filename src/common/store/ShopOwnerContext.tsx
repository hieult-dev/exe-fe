import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  loadShopOwnerData,
  saveShopOwnerData,
  type ShopInventoryMaterial,
  type ShopInventoryProduct,
  type ShopInfo,
  type ShopMember,
  type ShopOwnerData,
  type ShopService,
} from "@/common/store/shopOwnerStore"

type ShopOwnerContextValue = {
  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void
  data: ShopOwnerData
  setShop: (shop: ShopInfo) => void
  setServices: (services: ShopService[]) => void
  setMembers: (members: ShopMember[]) => void
  setInventoryProducts: (products: ShopInventoryProduct[]) => void
  setInventoryMaterials: (materials: ShopInventoryMaterial[]) => void
}

const ShopOwnerContext = createContext<ShopOwnerContextValue | null>(null)

type ShopOwnerProviderProps = {
  ownerKey: string
  children: ReactNode
}

export function ShopOwnerProvider({ ownerKey, children }: ShopOwnerProviderProps) {
  const [data, setData] = useState<ShopOwnerData>(() => loadShopOwnerData(ownerKey))
  const [globalSearchQuery, setGlobalSearchQuery] = useState("")

  useEffect(() => {
    setData(loadShopOwnerData(ownerKey))
  }, [ownerKey])

  useEffect(() => {
    saveShopOwnerData(ownerKey, data)
  }, [ownerKey, data])

  const value = useMemo<ShopOwnerContextValue>(
    () => ({
      globalSearchQuery,
      setGlobalSearchQuery,
      data,
      setShop: (shop) => setData((prev) => ({ ...prev, shop })),
      setServices: (services) => setData((prev) => ({ ...prev, services })),
      setMembers: (members) => setData((prev) => ({ ...prev, members })),
      setInventoryProducts: (products) =>
        setData((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            products,
          },
        })),
      setInventoryMaterials: (materials) =>
        setData((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            materials,
          },
        })),
    }),
    [data, globalSearchQuery]
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


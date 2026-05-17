export type ShopLocationSource = "MANUAL" | "BROWSER_GEO" | "PLACE_PICKER"

export type ShopDTO = {
  id: number
  name: string
  addressText?: string | null
  imageUrl?: string | null
  coverImageUrl?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
  openingHours?: string | null
  closingHours?: string | null
  facebookUrl?: string | null
  lat: number
  lng: number
  locationSource: ShopLocationSource
  locationAccuracyM?: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export type ShopProfileUpdateRequest = {
  name: string
  addressText?: string
  imageUrl?: string
  avatar?: File
  coverImageUrl?: string
  cover_img?: File
  phone?: string
  email?: string
  description?: string
  openingHours?: string
  closingHours?: string
  facebookUrl?: string
  lat: number
  lng: number
  locationSource: ShopLocationSource
  locationAccuracyM?: number
}

import baseApi from "@/common/api/baseApi"
import { GATEWAY_URL, assertGatewayConfigured } from "@/common/config/api"

export interface PetProfileDto {
  id: number | string
  shopId: number | string
  customerId: number | string
  shopName?: string | null
  name: string
  speciesName?: string | null
  breedName?: string | null
  breedText?: string | null
  gender?: string | null
  dob?: string | null
  note?: string | null
  avatarUrl?: string | null
}

type MyPetsResponse =
  | PetProfileDto[]
  | {
      data?: PetProfileDto[]
      items?: PetProfileDto[]
    }

const MY_PETS_URL = `${GATEWAY_URL}/api/customers/me/pets`

function normalizeMyPetsResponse(payload: MyPetsResponse): PetProfileDto[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

export async function fetchMyPetProfiles(): Promise<PetProfileDto[]> {
  assertGatewayConfigured()
  const payload = await baseApi.get<MyPetsResponse>(MY_PETS_URL)
  return normalizeMyPetsResponse(payload)
}

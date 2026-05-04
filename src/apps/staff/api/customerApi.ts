import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type { CustomerCreateRequest, CustomerDTO } from "@/apps/staff/model"

const CUSTOMER_URL = `${GATEWAY_URL}/api/customers`

export const createCustomer = async (request: CustomerCreateRequest) => {
  return api.post<CustomerDTO>(CUSTOMER_URL, request)
}

export const verifyCustomerPhone = async (phone: string) => {
  return api.get<CustomerDTO>(`${CUSTOMER_URL}/verify-phone`, { params: { phone } })
}

export const suggestCustomersByPhone = async (phone: string, limit = 10) => {
  return api.get<CustomerDTO[]>(`${CUSTOMER_URL}/suggest`, { params: { phone, limit } })
}

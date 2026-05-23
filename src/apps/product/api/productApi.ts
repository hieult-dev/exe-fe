import api from "@/common/api/baseApi"
import type {
  ProductCategoryDTO,
  ProductCategoryWriteRequest,
  ProductCreateRequest,
  ProductDTO,
  ProductScrollResponse,
} from "@/apps/product/model"

const PRODUCT_URL = `/products`
const PRODUCT_CATEGORY_URL = `/product-categories`

function toProductFormData(request: ProductCreateRequest) {
  const formData = new FormData()

  if (request.categoryId !== null) formData.append("categoryId", String(request.categoryId))
  formData.append("sku", request.sku)
  formData.append("name", request.name)
  formData.append("unit", request.unit)
  formData.append("price", String(request.price))
  formData.append("active", String(request.active))
  formData.append("stockQty", String(request.stockQty))
  if (request.replaceImages !== undefined) formData.append("replaceImages", String(request.replaceImages))
  request.imageUrls?.forEach((imageUrl) => formData.append("imageUrls", imageUrl))
  request.imageFiles?.forEach((imageFile) => formData.append("imageFiles", imageFile, imageFile.name))

  return formData
}

export const getProducts = async (size = 10, cursor: number | null = null, keyword = "", active: boolean | null = null) => {
  const params: Record<string, boolean | number | string> = { size }
  if (cursor !== null) params.cursor = cursor
  if (keyword.trim()) params.keyword = keyword.trim()
  if (active !== null) params.active = active

  return api.get<ProductScrollResponse>(PRODUCT_URL, { params })
}

export const getProductById = async (id: number) => {
  return api.get<ProductDTO>(`${PRODUCT_URL}/${id}`)
}

export const createProduct = async (request: ProductCreateRequest) => {
  return api.postWithFile<ProductDTO>(PRODUCT_URL, toProductFormData(request))
}

export const updateProduct = async (id: number, dto: ProductDTO) => {
  return api.request<ProductDTO>("put", `${PRODUCT_URL}/${id}`, dto)
}

export const updateProductMultipart = async (id: number, request: ProductCreateRequest) => {
  return api.putWithFile<ProductDTO>(`${PRODUCT_URL}/${id}`, toProductFormData(request))
}

export const deleteProduct = async (id: number) => {
  return api.del<void>(`${PRODUCT_URL}/${id}`, undefined)
}

export const getProductCategories = async (active = true) => {
  return api.get<ProductCategoryDTO[]>(PRODUCT_CATEGORY_URL, { params: { active } })
}

export const getProductCategoryById = async (id: number) => {
  return api.get<ProductCategoryDTO>(`${PRODUCT_CATEGORY_URL}/${id}`)
}

export const createProductCategory = async (dto: ProductCategoryWriteRequest) => {
  return api.post<ProductCategoryDTO>(PRODUCT_CATEGORY_URL, dto)
}

export const updateProductCategory = async (id: number, dto: ProductCategoryWriteRequest) => {
  return api.request<ProductCategoryDTO>("put", `${PRODUCT_CATEGORY_URL}/${id}`, dto)
}

export const deleteProductCategory = async (id: number) => {
  return api.del<void>(`${PRODUCT_CATEGORY_URL}/${id}`, undefined)
}

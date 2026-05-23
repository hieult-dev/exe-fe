import api from '@/common/api/baseApi';
import type { GetServicesParams, ServiceCategoryDTO, ServiceCategoryWriteRequest, ServiceDTO, ServiceListResponseDTO, ServiceWriteRequest, VaccineDTO } from '@/apps/services/model';

const SERVICE_URL = `/services`;
const SERVICE_CATEGORY_URL = `/service-categories`;
const VACCINE_URL = `/vaccines`;

function toServiceFormData(request: ServiceWriteRequest) {
    const formData = new FormData();

    formData.append("name", request.name);
    formData.append("durationMin", String(request.durationMin));
    formData.append("basePrice", String(request.basePrice));
    if (request.categoryId !== null && request.categoryId !== undefined) formData.append("categoryId", String(request.categoryId));
    formData.append("serviceType", request.serviceType);
    if (request.veterinaryServiceType) formData.append("veterinaryServiceType", request.veterinaryServiceType);
    if (request.vaccineId !== null && request.vaccineId !== undefined) formData.append("vaccineId", String(request.vaccineId));
    if (request.imageUrl?.trim()) formData.append("imageUrl", request.imageUrl.trim());
    if (request.active !== undefined) formData.append("active", String(request.active));
    if (request.imageFile) formData.append("imageUrlPreview", request.imageFile, request.imageFile.name);

    return formData;
}

export const getServices = async (query: GetServicesParams = {}) => {
    const params: Record<string, string | number | boolean> = {
        size: query.size ?? 20,
    };

    if (query.cursor !== null && query.cursor !== undefined) {
        params.cursor = query.cursor;
    }
    if (query.search?.trim()) {
        params.search = query.search.trim();
    }
    if (query.categoryId !== undefined) {
        params.categoryId = query.categoryId;
    }
    if (query.serviceType) {
        params.serviceType = query.serviceType;
    }
    if (query.veterinaryServiceType) {
        params.veterinaryServiceType = query.veterinaryServiceType;
    }
    if (query.active !== undefined) {
        params.active = query.active;
    }

    return api.get<ServiceListResponseDTO>(SERVICE_URL, { params });
};

export const getServiceById = async (id: number) => {
    return api.get<ServiceDTO>(`${SERVICE_URL}/${id}`);
};

export const getServiceCategories = async (active = true, serviceType?: ServiceCategoryDTO["serviceType"]) => {
    const params: Record<string, boolean | string> = { active };
    if (serviceType) params.serviceType = serviceType;

    return api.get<ServiceCategoryDTO[]>(SERVICE_CATEGORY_URL, {
        params,
    });
};

export const getServiceCategoryById = async (id: number) => {
    return api.get<ServiceCategoryDTO>(`${SERVICE_CATEGORY_URL}/${id}`);
};

export const createServiceCategory = async (data: ServiceCategoryWriteRequest) => {
    return api.post<ServiceCategoryDTO>(SERVICE_CATEGORY_URL, data);
};

export const updateServiceCategory = async (id: number, data: ServiceCategoryWriteRequest) => {
    return api.put<ServiceCategoryDTO>(`${SERVICE_CATEGORY_URL}/${id}`, data);
};

export const deleteServiceCategory = async (id: number) => {
    return api.del<void>(`${SERVICE_CATEGORY_URL}/${id}`, undefined);
};

export const getVaccines = async () => {
    return api.get<VaccineDTO[]>(VACCINE_URL);
};

export const getVaccineById = async (id: number) => {
    return api.get<VaccineDTO>(`${VACCINE_URL}/${id}`);
};

export const createService = async (data: ServiceDTO) => {
    return api.post<ServiceDTO>(SERVICE_URL, data);
};

export const createServiceMultipart = async (data: ServiceWriteRequest) => {
    return api.postWithFile<ServiceDTO>(SERVICE_URL, toServiceFormData(data));
};

export const updateService = async (id: number, data: ServiceDTO) => {
    return api.put<ServiceDTO>(`${SERVICE_URL}/${id}`, data);
};

export const updateServiceMultipart = async (id: number, data: ServiceWriteRequest) => {
    return api.putWithFile<ServiceDTO>(`${SERVICE_URL}/${id}`, toServiceFormData(data));
};

export const deleteService = async (id: number) => {
    return api.del<void>(`${SERVICE_URL}/${id}`, undefined);
};

import api from '@/common/api/baseApi';
import { GATEWAY_URL } from '@/common/config/api';
import type { ServiceCategoryDTO, ServiceDTO } from '@/apps/services/model';

const SERVICE_URL = `${GATEWAY_URL}/api/services`;
const SERVICE_CATEGORY_URL = `${GATEWAY_URL}/api/service-categories`;

export const getServices = async (size = 20, cursor: string | null = null, keyword: string = "") => {
    const params: Record<string, any> = { size };
    if (cursor) {
        params.cursor = cursor;
    }
    if (keyword) {
        params.search = keyword;
    }
    return api.get<any>(SERVICE_URL, { params });
};

export const getServiceById = async (id: number) => {
    return api.get<ServiceDTO>(`${SERVICE_URL}/${id}`);
};

export const getServiceCategories = async (active = true) => {
    return api.get<ServiceCategoryDTO[]>(SERVICE_CATEGORY_URL, {
        params: { active },
    });
};

export const createService = async (data: ServiceDTO) => {
    return api.post<ServiceDTO>(SERVICE_URL, data);
};

export const updateService = async (id: number, data: ServiceDTO) => {
    return api.put<ServiceDTO>(`${SERVICE_URL}/${id}`, data);
};

export const deleteService = async (id: number) => {
    return api.del<void>(`${SERVICE_URL}/${id}`, undefined);
};

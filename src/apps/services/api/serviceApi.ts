import api from '@/common/api/baseApi';
import { GATEWAY_URL } from '@/common/config/api';
import type { ServiceCategoryDTO, ServiceDTO } from '@/apps/services/model';

const SERVICE_URL = `${GATEWAY_URL}/api/services`;
const serviceCategoryUrl = (shopId: number) => `${GATEWAY_URL}/api/shops/${shopId}/service-categories`;

export const getServices = async () => {
    return api.get<ServiceDTO[]>(SERVICE_URL);
};

export const getServiceById = async (id: number) => {
    return api.get<ServiceDTO>(`${SERVICE_URL}/${id}`);
};

export const getServiceCategories = async (shopId: number, active = true) => {
    return api.get<ServiceCategoryDTO[]>(serviceCategoryUrl(shopId), {
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

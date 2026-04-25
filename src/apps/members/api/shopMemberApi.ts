import api from '@/common/api/baseApi';
import { GATEWAY_URL } from '@/common/config/api';

export interface ShopMemberDTO {
    shopId?: number;
    userId: number;
    role: string;
    status: string;
    createdAt?: string;
    userFullName?: string;
    userEmail?: string;
}

const SHOP_URL = `${GATEWAY_URL}/api/shops`;

export const getActiveStaff = async () => {
    return api.get<ShopMemberDTO[]>(`${SHOP_URL}/staff`);
};

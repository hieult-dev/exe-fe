/**
 * Data Transfer Object trả về từ / gửi lên backend Services API.
 */
export interface ServiceDTO {
    id?: number;
    shopId: number;
    name: string;
    durationMin: number;
    basePrice: number;
    active: boolean;
    categoryId?: number | null;
    category?: string;
}

export interface ServiceCategoryDTO {
    id?: number;
    shopId?: number;
    name: string;
    active?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Model hiển thị trên UI (có thể mở rộng thêm field local).
 */
export type ServiceModel = ServiceDTO;

export type ServiceVisibilityFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

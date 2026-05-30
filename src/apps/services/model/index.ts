/**
 * Data Transfer Object trả về từ / gửi lên backend Services API.
 */
export type ServiceType = "GENERAL" | "VETERINARY";

export type VeterinaryServiceType =
    | "VACCINATION"
    | "EXAMINATION"
    | "TREATMENT"
    | "TEST"
    | "SURGERY"
    | "CONSULTATION"
    | "OTHER";

export interface ServiceDTO {
    id?: number;
    shopId: number;
    name: string;
    durationMin: number;
    basePrice: number;
    active: boolean;
    categoryId?: number | null;
    categoryName?: string | null;
    category?: string;
    serviceType: ServiceType;
    veterinaryServiceType?: VeterinaryServiceType | null;
    vaccineId?: number | null;
    vaccineName?: string | null;
    imageUrl?: string | null;
}

export type ServiceWriteRequest = Omit<ServiceDTO, "id"> & {
    imageFile?: File | null;
};

export interface ServiceListResponseDTO {
    content: ServiceDTO[];
    size: number;
    nextCursor: number | null;
    hasNext: boolean;
}

export interface GetServicesParams {
    search?: string;
    categoryId?: number;
    serviceType?: ServiceType;
    veterinaryServiceType?: VeterinaryServiceType;
    active?: boolean;
    cursor?: number | null;
    size?: number;
}

export interface VaccineDTO {
    id: number;
    speciesId: number;
    name: string;
    description?: string | null;
    boosterIntervalDays: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceCategoryDTO {
    id?: number;
    shopId?: number;
    name: string;
    description?: string | null;
    active?: boolean;
    sortOrder?: number;
    serviceType?: ServiceType;
    createdAt?: string;
    updatedAt?: string;
}

export type ServiceCategoryWriteRequest = {
    name: string;
    description: string | null;
    active: boolean;
    sortOrder: number;
    serviceType: ServiceType;
};

/**
 * Model hiển thị trên UI (có thể mở rộng thêm field local).
 */
export type ServiceModel = ServiceDTO;

export type ServiceVisibilityFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";
export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN" | "SHOP";
export type AuthShopMemberRole = "OWNER" | "MANAGER" | "STAFF";
export type AuthShopMemberStatus = "ACTIVE" | "INACTIVE" | "INVITED" | "REMOVED";

export interface User {
  id?: number;
  email?: string;
  phone?: string;
  fullName?: string;

  status?: UserStatus;
  address?: string | null;
  age?: number | null;
  avatarUrlPreview?: string | null;

  role?: UserRole;

  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface AuthShopDTO {
  id: number;
  name: string;
  addressText: string;
  shopStatus: string;
  memberRole: AuthShopMemberRole;
  memberStatus: AuthShopMemberStatus;
}

export interface UserLoginResponse {
  accessToken: string;
  role: UserRole;
  refreshToken: string;
  user: User;
  shops: AuthShopDTO[];
  currentShopId: number | null;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";
export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";

export interface User {
  id?: string;            
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

export interface UserLoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
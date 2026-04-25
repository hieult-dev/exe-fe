import { create } from 'zustand';
import type { User } from '@/apps/user/model/index';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: User | null;
    authentication: string;
    refreshToken: string;
    expired?: Date;
    userRole: string;
    isRefreshingToken: boolean;
    currentShopId: number | null;
    shops: any[];

    setUser: (user: User) => void;
    setRefreshingToken: (value: boolean) => void;
    setUserRole: (userRole: string) => void;
    setAuthentication: (token: string) => void;
    setRefreshToken: (token: string) => void;
    setCurrentShopId: (id: number | null) => void;
    setShops: (shops: any[]) => void;
    resetUserStore: () => void;
}

const expiredAfter = 12 * 60 * 60 * 1000;
const getExpiredDate = () => {
    const date = new Date();
    date.setTime(date.getTime() + expiredAfter);
    return date;
};
export const useUserStore = create(
    persist<AuthState>(
        (set) => ({
            user: null,
            authentication: '',
            userRole: '',
            refreshToken: '',
            expired: undefined,
            isRefreshingToken: false,
            currentShopId: null,
            shops: [],

            setUser: (user) =>
                set({
                    user,
                    expired: getExpiredDate(),
                }),

            setAuthentication: (token) =>
                set({
                    authentication: token,
                    expired: getExpiredDate(),
                }),

            setRefreshToken: (token) =>
                set({
                    refreshToken: token,
                    expired: getExpiredDate(),
                }),

            resetUserStore: () =>
                set({
                    user: null,
                    authentication: '',
                    userRole: '',
                    refreshToken: '',
                    expired: undefined,
                    isRefreshingToken: false,
                    currentShopId: null,
                    shops: [],
                }),

            setUserRole: (userRole) =>
                set({
                    userRole,
                    expired: getExpiredDate(),
                }),

            setRefreshingToken: (value: boolean) =>
                set({
                    isRefreshingToken: value,
                }),

            setCurrentShopId: (id) =>
                set({
                    currentShopId: id,
                    expired: getExpiredDate(),
                }),

            setShops: (shops) =>
                set({
                    shops,
                    expired: getExpiredDate(),
                }),
        }),
        {
            name: 'user-store',
        }
    )
);

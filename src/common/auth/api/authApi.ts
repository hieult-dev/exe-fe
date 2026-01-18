import { AUTH_URL } from "@/common/config/api";
import { useUserStore } from '@/apps/user/store/UserStore';
import { REFRESH_TOKEN_URL } from "@/common/config/api";
import baseApi from "@/common/api/baseApi";
import type { User } from "@/apps/user/model/index";

type TokenRefresh = {
    accessToken: string,
    refreshToken: string,
    role: string,
    user: User
};

type AuthenticationResponse = {
    accessToken: string,
    refreshToken: string,
    role: string,
    user: User
}

function login(email: string, password: string) {
    return baseApi.post<AuthenticationResponse>(`${AUTH_URL}/authenticate`, {
        email,
        password,
    });
}

function register(data: FormData) {
    return baseApi.postWithFile<AuthenticationResponse>(
        `${AUTH_URL}/register`,
        data
    )
}

function logout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("role")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
    sessionStorage.removeItem("role")
    localStorage.removeItem("user-store")
    sessionStorage.removeItem("user-store")
    const refreshToken = useUserStore.getState().refreshToken;

    if (!refreshToken) {
        return Promise.resolve();
    }

    return baseApi.post<void>(`${AUTH_URL}/logout`, {
        refreshToken
    });
}

let refreshPromise: Promise<void> | null = null;
async function refreshToken(): Promise<void> {
    const authStore = useUserStore.getState();

    if (!authStore.refreshToken) {
        return Promise.reject('No refresh token');
    }

    if (refreshPromise) {
        return refreshPromise;
    }

    authStore.setRefreshingToken(true);

    refreshPromise = (async () => {
        try {
            const rs = await baseApi.post<TokenRefresh>(
                REFRESH_TOKEN_URL,
                { refreshToken: authStore.refreshToken }
            );

            if (rs) {
                authStore.setAuthentication(`Bearer ${rs.accessToken}`);
                authStore.setRefreshToken(rs.refreshToken);
                authStore.setUserRole(rs.role);
            }
        } finally {
            authStore.setRefreshingToken(false);
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export { login, logout, refreshToken, register };

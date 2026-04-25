import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { GATEWAY_URL } from '@/common/config/api';
import { useUserStore } from '@/apps/user/store/UserStore';
import { resetStoreAndRedirectToLogin } from '@/common/auth/store/ResetStore';
import { refreshToken } from '@/common/auth/api/authApi';
import { REFRESH_TOKEN_URL } from "@/common/config/api";

const LOGIN_URL = `${GATEWAY_URL}/api/auth/authenticate`;

export function initialClient(
    hasFile: boolean,
    isDownload = false,
    isSync = false
) {
    const axiosInstance = axios.create({
        headers: {
            Accept: '*/*',
            'Content-Type': hasFile
                ? 'multipart/form-data'
                : 'application/json',
        },
        responseType: isDownload ? 'blob' : 'json',
        timeout: isSync ? 1800000 : 120000,
    });

    axiosInstance.interceptors.request.use(
        (config) => {
            const { authentication, currentShopId } = useUserStore.getState();
            if (authentication) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = authentication;
            }
            if (currentShopId !== null && currentShopId !== undefined) {
                config.headers = config.headers || {};
                config.headers['X-Shop-Id'] = currentShopId.toString();
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // ===== Response interceptor =====
    axiosInstance.interceptors.response.use(
        (res) => res,
        async (err) => {
            const originalConfig = err.config;

            if (originalConfig?.url !== LOGIN_URL && err.response) {
                // Refresh token expired
                if (
                    err.response.status === 401 &&
                    originalConfig.url === REFRESH_TOKEN_URL
                ) {
                    resetStoreAndRedirectToLogin();
                    return Promise.reject(err);
                }

                // Access token expired
                if (err.response.status === 401 && !originalConfig._retry) {
                    originalConfig._retry = true;
                    try {
                        await refreshToken();
                        return axiosInstance(originalConfig);
                    } catch (_error) {
                        resetStoreAndRedirectToLogin();
                        return Promise.reject(_error);
                    }
                }
            }

            return Promise.reject(err);
        }
    );

    return axiosInstance;
}

export async function request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    data?: object,
    hasFile = false,
    isDownload = false,
    isSync = false,
    config?: AxiosRequestConfig
): Promise<T> {
    const client = initialClient(hasFile, isDownload, isSync);

    try {
        let response: AxiosResponse<T>;

        switch (method) {
            case 'get':
                response = await client.get<T>(path, config);
                break;

            case 'post':
                response = await client.post<T>(path, data ?? {}, config);
                break;

            case 'put':
                response = await client.put<T>(path, data ?? {}, config);
                break;

            case 'patch':
                response = await client.patch<T>(path, data ?? {}, config);
                break;

            case 'delete':
                response = await client.delete<T>(path, config);
                break;

            default:
                response = await client.get<T>(path, config);
                break;
        }

        return response.data;
    } catch (err: any) {
        throw err?.response?.data ?? err;
    }
}

function downloadWithFullResponse(path: string, data?: object, config?: AxiosRequestConfig) {
    const client = initialClient(false, true, true);
    return client.post(path, data, config);
}

function downloadWithFullResponseWithGetMethod(path: string, config?: AxiosRequestConfig) {
    const client = initialClient(false, true, true);
    return client.get(path, config);
}

function postForDownload(path: string, data: object | undefined, config?: AxiosRequestConfig) {
    const client = initialClient(false, true, true);
    return client.post(path, data, config);
}

function post<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
    return request<T>('post', path, data, false, false, false, config);
}

function get<T>(path: string, config?: AxiosRequestConfig) {
    return request<T>('get', path, undefined, false, false, false, config);
}

function getWithFile<T>(path: string, config?: AxiosRequestConfig) {
    return request<T>('get', path, undefined, false, true, false, config);
}

function put<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
    return request<T>('put', path, data, false, true, false, config);
}

function del<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
    return request<T>('delete', path, data, false, false, false, config);
}

function postWithFile<T>(path: string, data: object | FormData | undefined, config?: AxiosRequestConfig) {
    return request<T>('post', path, data, true, false, false, config);
}

function putWithFile<T>(path: string, data: object | FormData | undefined, config?: AxiosRequestConfig) {
    return request<T>('put', path, data, true, false, false, config);
}

function download<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
    return request<T>('post', path, data, false, true, true, config);
}

function downloadWithGet<T>(path: string, config?: AxiosRequestConfig) {
    return request<T>('get', path, undefined, false, true, true, config);
}

function sync<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
    return request<T>('post', path, data, false, false, true, config);
}

function syncWithFile<T>(path: string, data: FormData, config?: AxiosRequestConfig) {
    return request<T>('post', path, data, true, false, true, config);
}

export default {
    del,
    download,
    downloadWithGet,
    downloadWithFullResponse,
    get,
    getWithFile,
    post,
    postWithFile,
    putWithFile,
    put,
    request,
    sync,
    syncWithFile,
    downloadWithFullResponseWithGetMethod,
    postForDownload
};

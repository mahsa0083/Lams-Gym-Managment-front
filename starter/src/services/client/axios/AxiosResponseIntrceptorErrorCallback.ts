import { AxiosError, AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import appConfig from '@/configs/app.config';
import AxiosBase from './AxiosBase';
// فقط همین یک import اضافه شود
import { triggerGlobalError } from '@/context/ErrorContext'; 

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

export const AxiosResponseInterceptorErrorCallback = async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // ۱. مدیریت 401
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => AxiosBase(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const session = await getSession();
            if (!session?.accessToken || (session as any)?.error === 'RefreshAccessTokenError') {
                throw new Error('Refresh token expired');
            }

            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            }

            processQueue(null);
            return AxiosBase(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            await signOut({
                callbackUrl: `${appConfig.unAuthenticatedEntryPath}?redirectUrl=${encodeURIComponent(currentPath)}`,
            });
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }

    // ۲. ارسال سایر خطاها به مودال مرکزی
    // فقط کافیست تابع ایمپورت شده را صدا بزنیم
    if (error.response?.status !== 401) {
        triggerGlobalError(error);
    }

    return Promise.reject(error);
}; export default AxiosResponseInterceptorErrorCallback

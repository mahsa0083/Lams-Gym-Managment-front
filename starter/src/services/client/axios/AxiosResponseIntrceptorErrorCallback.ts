import { AxiosError, AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react'; // بر اساس کتابخانه auth پروژه‌تان
import appConfig from '@/configs/app.config';
import AxiosBase from './AxiosBase'; // یا نمونه اصلی axios شما

// متغیر نگهدارنده هندلر سراسری ارور دیالوگ
let globalShowError: ((err: any) => void) | null = null;

export const setGlobalErrorHandler = (handler: (err: any) => void) => {
    globalShowError = handler;
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

export const AxiosResponseInterceptorErrorCallback = async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // ۱. مدیریت خطای 401 (Unauthorized) و فرآیند Silent Refresh Token
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
            // دریافت سشن جدید که باعث اجرای کال‌بک jwt و تمدید خودکار می‌شود
            const session = await getSession();

            // بررسی انقضای کامل رفرش توکن
            if (!session?.accessToken || (session as any)?.error === 'RefreshAccessTokenError') {
                throw new Error('Refresh token has expired');
            }

            // هدر ریکوئست قبلی با توکن جدید آپدیت می‌شود
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            }

            processQueue(null);
            return AxiosBase(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            // خروج کامل و ریدایرکت به صفحه ورود
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            await signOut({
                callbackUrl: `${appConfig.unAuthenticatedEntryPath}?redirectUrl=${encodeURIComponent(currentPath)}`,
            });

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }

    // ۲. ارسال تمام خطاهای دیگر (400, 403, 404, 500 و...) به دیالوگ مرکزی
    if (globalShowError && error.response?.status !== 401) {
        globalShowError(error);
    }

    return Promise.reject(error);
};

export default AxiosResponseInterceptorErrorCallback;

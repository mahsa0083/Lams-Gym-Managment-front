// src/services/ApiService.ts
import BaseService from './axios/AxiosBase'
import type { AxiosRequestConfig } from 'axios'

const ApiService = {
    async fetchDataWithAxios<T>(config: AxiosRequestConfig): Promise<T> {
        // 🔑 ارسال درخواست از طریق BaseService که به Interceptor مجهز شده است
        const response = await BaseService(config)
        return response.data
    },

    // متدهای کمکی مستقیم (در صورت نیاز)
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await BaseService.get<T>(url, config)
        return response.data
    },

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await BaseService.post<T>(url, data, config)
        return response.data
    },

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await BaseService.put<T>(url, data, config)
        return response.data
    },

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await BaseService.delete<T>(url, config)
        return response.data
    },
}

export default ApiService
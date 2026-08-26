import ApiService from './ApiService'

export async function apiGetNotificationCount() {
    return ApiService.fetchDataWithAxios<{
        count: number
    }>({
        url: '/notification/count',
        method: 'get',
    })
}

export async function apiGetNotificationList<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/notification/list',
        method: 'get',
    })
}

export async function apiGetSearchResult<T>(params: { query: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/search/query',
        method: 'get',
        params,
    })
}

export async function apiGetTenantList<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/tenants',
        method: 'get',
    })
}

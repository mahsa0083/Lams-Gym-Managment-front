// AuthServerServices.ts

import axios from 'axios'
import type { SignInCredential, SignInResponse } from '@/@types/auth'

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface RefreshTokenResponse {
    accessToken: string
    refreshToken?: string
}

const apiServer = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export async function apiLoginServer(data: SignInCredential) {
    const response = await apiServer.post<SignInResponse>(
        '/api/auth/login',
        data,
    )

    return response.data
}

export async function apiRefreshTokenServer(
    data: RefreshTokenRequest,
) {
    const response = await apiServer.post<RefreshTokenResponse>(
        '/api/auth/refresh-token',
        data,
    )

    return response.data
}

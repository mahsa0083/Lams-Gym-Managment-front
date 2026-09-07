import axios from 'axios'

import type {
    SignInCredential,
    SignInResponse,
} from '@/@types/auth'

/**
 * ---------------------------------------------------------
 * REFRESH TOKEN REQUEST
 * ---------------------------------------------------------
 */
export interface RefreshTokenRequest {
    refreshToken: string
}

/**
 * ---------------------------------------------------------
 * REFRESH TOKEN RESPONSE
 * ---------------------------------------------------------
 */
export interface RefreshTokenResponse {
    accessToken: string

    /**
     * Optional because some backends rotate
     * refresh token and some don't.
     */
    refreshToken?: string
}

/**
 * ---------------------------------------------------------
 * SERVER API
 * ---------------------------------------------------------
 */
const apiServer = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL,

    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * ---------------------------------------------------------
 * LOGIN
 * ---------------------------------------------------------
 */
export async function apiLoginServer(
    data: SignInCredential,
) {
    const response =
        await apiServer.post<SignInResponse>(
            '/api/auth/login',
            data,
        )

    return response.data
}

/**
 * ---------------------------------------------------------
 * REFRESH TOKEN
 * ---------------------------------------------------------
 */
export async function apiRefreshTokenServer(
    data: RefreshTokenRequest,
) {
    const response =
        await apiServer.post<RefreshTokenResponse>(
            '/api/auth/refresh-token',
            data,
        )

    return response.data
}
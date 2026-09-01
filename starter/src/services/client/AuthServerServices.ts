import axios from 'axios'
import type { SignInCredential, SignInResponse } from '@/@types/auth'

const apiServer = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export async function apiLoginServer(data: SignInCredential) {
    const response = await apiServer.post<SignInResponse>(
        '/api/auth/login',
        {
            nationalCode: data.nationalCode,
            code: data.code,
        },
    )

    return response.data
}

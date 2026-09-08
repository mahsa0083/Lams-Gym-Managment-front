'use client'

const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

const NAME_IDENTIFIER_CLAIM =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

export interface JwtUser {
    id: number | null
    role: number | null
    token: string | null
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
        if (!token || typeof token !== 'string') return null

        const parts = token.split('.')

        if (parts.length !== 3) return null

        const payloadPart = parts[1]

        if (!payloadPart) return null

        const base64 = payloadPart
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const paddedBase64 =
            base64 + '='.repeat((4 - (base64.length % 4)) % 4)

        const binaryString = atob(paddedBase64)

        const bytes = Uint8Array.from(
            binaryString,
            (char) => char.charCodeAt(0),
        )

        const decoded = new TextDecoder().decode(bytes)

        return JSON.parse(decoded) as Record<string, unknown>
    } catch (error) {
        console.error('Failed to parse JWT:', error)
        return null
    }
}

export function getJwtUser(token: string): JwtUser {
    const payload = parseJwtPayload(token)

    if (!payload) {
        return {
            id: null,
            role: null,
            token,
        }
    }

    const userId = Number(payload[NAME_IDENTIFIER_CLAIM])
    const role = Number(payload[ROLE_CLAIM])

    return {
        id: Number.isInteger(userId) && userId > 0 ? userId : null,
        role: Number.isInteger(role) ? role : null,
        token,
    }
}

export function getUserRole(token: string): number | null {
    const user = getJwtUser(token)

    return user.role
}

export function getUserId(token: string): number | null {
    const user = getJwtUser(token)

    return user.id
}
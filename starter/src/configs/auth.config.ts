import type { NextAuthConfig } from 'next-auth'
import {
    apiLoginServer,
    apiRefreshTokenServer,
} from '@/services/client/AuthServerServices'

import Credentials from 'next-auth/providers/credentials'

const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

function getAuthorityFromAccessToken(
    accessToken: string,
): string[] {
    try {
        const payloadPart = accessToken.split('.')[1]

        if (!payloadPart) {
            return []
        }

        const base64 = payloadPart
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const payload = JSON.parse(
            Buffer.from(base64, 'base64').toString('utf-8'),
        ) as Record<string, unknown>

        const roleValue = payload[ROLE_CLAIM]

        if (roleValue === undefined || roleValue === null) {
            return []
        }

        const roles = Array.isArray(roleValue)
            ? roleValue
            : [roleValue]

        return roles.flatMap((role) => {
            switch (String(role)) {
                case '1':
                    return ['ADMIN']

                case '2':
                    return ['TRAINER']

                case '3':
                    return ['MEMBER']

                default:
                    return []
            }
        })
    } catch (error) {
        console.error(
            'Failed to extract authority from access token:',
            error,
        )

        return []
    }
}

function getAccessTokenExpiresAt(
    accessToken: string,
): number {
    try {
        const payloadPart = accessToken.split('.')[1]

        if (!payloadPart) {
            return 0
        }

        const base64 = payloadPart
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const payload = JSON.parse(
            Buffer.from(base64, 'base64').toString('utf-8'),
        ) as Record<string, unknown>

        const exp = payload.exp

        if (typeof exp === 'number') {
            return exp
        }

        if (typeof exp === 'string') {
            const parsedExp = Number(exp)

            return Number.isFinite(parsedExp)
                ? parsedExp
                : 0
        }

        return 0
    } catch (error) {
        console.error(
            'Failed to extract expiration from access token:',
            error,
        )

        return 0
    }
}

async function refreshAccessToken(token: any) {
    try {
        if (
            typeof token.refreshToken !== 'string' ||
            !token.refreshToken.trim()
        ) {
            throw new Error('Refresh token is missing')
        }

        console.log('Refreshing expired access token...')

        const refreshResponse = await apiRefreshTokenServer({
            refreshToken: token.refreshToken,
        })

        if (!refreshResponse?.accessToken) {
            throw new Error(
                'No access token in refresh response',
            )
        }

        const expiresAt = getAccessTokenExpiresAt(
            refreshResponse.accessToken,
        )

        if (!expiresAt) {
            throw new Error(
                'Expiration claim (exp) was not found in access token',
            )
        }

        const authority = getAuthorityFromAccessToken(
            refreshResponse.accessToken,
        )

        return {
            ...token,
            accessToken: refreshResponse.accessToken,

            // اگر بک‌اند refreshToken جدید برگرداند،
            // همان ذخیره می‌شود؛ در غیر این صورت قبلی حفظ می‌شود.
            refreshToken:
                refreshResponse.refreshToken ??
                token.refreshToken,

            expiresAt,
            authority: authority.length
                ? authority
                : token.authority,

            error: undefined,
        }
    } catch (error) {
        console.error(
            'Failed to refresh access token:',
            error,
        )

        return {
            ...token,
            accessToken: undefined,
            refreshToken: undefined,
            authority: [],
            error: 'RefreshAccessTokenError',
        }
    }
}

export default {
    providers: [
        Credentials({
            name: 'Credentials',

            credentials: {
                nationalCode: {
                    label: 'National Code',
                    type: 'text',
                },
                code: {
                    label: 'OTP Code',
                    type: 'text',
                },
            },

            async authorize(credentials) {
                console.log(
                    'AUTHORIZE HAS BEEN CALLED:',
                    credentials,
                )

                if (
                    typeof credentials?.nationalCode !==
                        'string' ||
                    !credentials.nationalCode.trim()
                ) {
                    return null
                }

                if (
                    typeof credentials?.code !== 'string' ||
                    !credentials.code.trim()
                ) {
                    return null
                }

                try {
                    const loginResponse =
                        await apiLoginServer({
                            nationalCode:
                                credentials.nationalCode.trim(),
                            code: credentials.code.trim(),
                        })

                    if (!loginResponse?.accessToken) {
                        console.error(
                            'Access token was not found in login response',
                        )

                        return null
                    }

                    if (
                        typeof loginResponse.refreshToken !==
                            'string' ||
                        !loginResponse.refreshToken.trim()
                    ) {
                        console.error(
                            'Refresh token was not found in login response',
                        )

                        return null
                    }

                    const expiresAt =
                        getAccessTokenExpiresAt(
                            loginResponse.accessToken,
                        )

                    if (!expiresAt) {
                        console.error(
                            'Expiration claim (exp) was not found in access token',
                        )

                        return null
                    }

                    const authority =
                        getAuthorityFromAccessToken(
                            loginResponse.accessToken,
                        )

                    return {
                         id: credentials.nationalCode.trim(),
    authority,
    accessToken: loginResponse.accessToken,
    refreshToken: loginResponse.refreshToken,
    expiresAt: String(expiresAt),
                    }
                } catch (error) {
                    console.error(
                        'Login failed:',
                        error,
                    )

                    return null
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
           
            if (user) {
        return {
            ...token,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            authority: user.authority ?? [],
            expiresAt: String(user.expiresAt),
            error: undefined,
        }
    }

            const currentTimeInSeconds = Math.floor(
                Date.now() / 1000,
            )

            const tokenExpiresAt =
                Number(token.expiresAt) ||
                getAccessTokenExpiresAt(
                    String(token.accessToken ?? ''),
                )

            // تا ۱۰ ثانیه قبل از انقضا نیازی به refresh نیست.
            if (
                currentTimeInSeconds <
                tokenExpiresAt - 10
            ) {
                return token
            }
    console.log('FORCED REFRESH TEST')

            return refreshAccessToken(token)
        },

        async session({ session, token }) {
            return {
                ...session,
                accessToken: token.accessToken as string,
                error: token.error as
                    | string
                    | undefined,

                user: {
                    ...session.user,
                    id: token.sub ?? '',
                    authority: token.authority ?? [],
                },
            }
        },
    },
} satisfies NextAuthConfig

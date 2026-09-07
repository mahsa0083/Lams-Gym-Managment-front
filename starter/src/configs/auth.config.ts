import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import {
    apiLoginServer,
    apiRefreshTokenServer,
} from '@/services/client/AuthServerServices'

/**
 * Backend ASP.NET Role Claim
 */
const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

/**
 * ---------------------------------------------------------
 * JWT PAYLOAD PARSER
 * ---------------------------------------------------------
 */
function parseJwtPayload(
    token: string,
): Record<string, unknown> | null {
    try {
        if (!token || typeof token !== 'string') {
            return null
        }

        const parts = token.split('.')

        if (parts.length !== 3) {
            return null
        }

        const payloadPart = parts[1]

        if (!payloadPart) {
            return null
        }

        /**
         * JWT uses Base64URL
         */
        const base64 = payloadPart
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        /**
         * Add missing Base64 padding
         */
        const paddedBase64 =
            base64 + '='.repeat((4 - (base64.length % 4)) % 4)

        const payload = JSON.parse(
            Buffer.from(paddedBase64, 'base64').toString('utf-8'),
        ) as Record<string, unknown>

        return payload
    } catch (error) {
        console.error(
            'Failed to parse JWT payload:',
            error,
        )

        return null
    }
}

/**
 * ---------------------------------------------------------
 * ACCESS TOKEN EXPIRATION
 * ---------------------------------------------------------
 */
function getAccessTokenExpiresAt(
    accessToken: string,
): number {
    const payload = parseJwtPayload(accessToken)

    if (!payload) {
        return 0
    }

    const exp = payload.exp

    if (typeof exp === 'number') {
        return exp
    }

    if (typeof exp === 'string') {
        const parsedExp = Number(exp)

        if (Number.isFinite(parsedExp)) {
            return parsedExp
        }
    }

    return 0
}

/**
 * ---------------------------------------------------------
 * ROLE / AUTHORITY
 * ---------------------------------------------------------
 */
function getAuthorityFromAccessToken(
    accessToken: string,
): string[] {
    const payload = parseJwtPayload(accessToken)

    if (!payload) {
        return []
    }

    const roleValue = payload[ROLE_CLAIM]

    if (
        roleValue === undefined ||
        roleValue === null
    ) {
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
}

/**
 * ---------------------------------------------------------
 * REFRESH ACCESS TOKEN
 * ---------------------------------------------------------
 */

async function refreshAccessToken(token: any) {
    console.log('========== REFRESH START ==========')

console.log('Refresh Token:', token.refreshToken)

console.log('Access Token Exp:',
    token.expiresAt
)

console.log(
    'Current Time:',
    Math.floor(Date.now() / 1000)
)
    try {
        /**
         * Refresh Token must exist
         */
        if (
            typeof token.refreshToken !== 'string' ||
            !token.refreshToken.trim()
        ) {
            throw new Error(
                'Refresh token is missing',
            )
        }

        console.log(
            'Refreshing access token...',
        )

        /**
         * IMPORTANT:
         *
         * Backend Refresh API according to
         * AuthServerServices only expects:
         *
         * {
         *     refreshToken: string
         * }
         */
        const refreshResponse =
            await apiRefreshTokenServer({
                refreshToken:
                    token.refreshToken,
            })
console.log(
    'REFRESH RESPONSE:',
    refreshResponse
)
        /**
         * Backend must return a new access token
         */
        if (
            !refreshResponse?.accessToken
        ) {
            throw new Error(
                'No access token returned from refresh endpoint',
            )
        }

        /**
         * Parse new Access Token
         */
        const expiresAt =
            getAccessTokenExpiresAt(
                refreshResponse.accessToken,
            )

        if (!expiresAt) {
            throw new Error(
                'Expiration claim (exp) was not found in refreshed access token',
            )
        }

        /**
         * Extract roles from new Access Token
         */
        const authority =
            getAuthorityFromAccessToken(
                refreshResponse.accessToken,
            )

        /**
         * IMPORTANT:
         *
         * If backend rotates the refresh token,
         * use the new one.
         *
         * If backend doesn't return a new refresh token,
         * keep the old one.
         */
        const newRefreshToken =
            typeof refreshResponse.refreshToken ===
                'string' &&
            refreshResponse.refreshToken.trim()
                ? refreshResponse.refreshToken
                : token.refreshToken
console.log(
    'NEW ACCESS TOKEN:',
    refreshResponse.accessToken
)

console.log(
    'NEW REFRESH TOKEN:',
    refreshResponse.refreshToken
)

console.log('========== REFRESH SUCCESS ==========')
        return {
            ...token,

            accessToken:
                refreshResponse.accessToken,

            refreshToken:
                newRefreshToken,

            expiresAt: String(
                expiresAt,
            ),

            authority:
                authority.length > 0
                    ? authority
                    : token.authority ?? [],

            error: undefined,
        }
    } catch (error) {
        console.error(
            'Failed to refresh access token:',
            error,
        )

        /**
         * VERY IMPORTANT:
         *
         * DO NOT DELETE refreshToken here.
         *
         * We keep it so the next request still
         * has the possibility to refresh again.
         */
        return {
            ...token,

            accessToken:
                token.accessToken,

            refreshToken:
                token.refreshToken,

            authority:
                token.authority ?? [],

            error:
                'RefreshAccessTokenError',
        }
    }
}

/**
 * ---------------------------------------------------------
 * NEXT AUTH CONFIG
 * ---------------------------------------------------------
 */
export default {
    trustHost: true,

    secret:
        process.env.AUTH_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        'your-super-secret-key-change-in-production',

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

            /**
             * -------------------------------------------------
             * LOGIN
             * -------------------------------------------------
             */
            async authorize(credentials) {
                /**
                 * Validate national code
                 */
                if (
                    typeof credentials?.nationalCode !==
                        'string' ||
                    !credentials.nationalCode.trim()
                ) {
                    return null
                }

                /**
                 * Validate OTP
                 */
                if (
                    typeof credentials?.code !==
                        'string' ||
                    !credentials.code.trim()
                ) {
                    return null
                }

                try {
                    /**
                     * Call backend login
                     */
                    const loginResponse =
                        await apiLoginServer({
                            nationalCode:
                                credentials.nationalCode.trim(),

                            code:
                                credentials.code.trim(),
                        })

                    /**
                     * Both tokens are required
                     */
                    if (
                        !loginResponse?.accessToken ||
                        !loginResponse?.refreshToken
                    ) {
                        console.error(
                            'Login response does not contain accessToken or refreshToken',
                        )

                        return null
                    }

                    /**
                     * Parse Access Token
                     */
                    const expiresAt =
                        getAccessTokenExpiresAt(
                            loginResponse.accessToken,
                        )

                    if (!expiresAt) {
                        console.error(
                            'Access token does not contain a valid exp claim',
                        )

                        return null
                    }

                    /**
                     * Get roles from Access Token
                     */
                    const authority =
                        getAuthorityFromAccessToken(
                            loginResponse.accessToken,
                        )

                    /**
                     * Return User object.
                     *
                     * These values will be available
                     * inside the JWT callback.
                     */
                    return {
                        id: credentials.nationalCode.trim(),

                        name: credentials.nationalCode.trim(),

                        authority,

                        accessToken:
                            loginResponse.accessToken,

                        refreshToken:
                            loginResponse.refreshToken,

                        expiresAt:
                            String(expiresAt),
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

    /**
     * ---------------------------------------------------------
     * CALLBACKS
     * ---------------------------------------------------------
     */
    callbacks: {
        /**
         * -----------------------------------------------------
         * JWT CALLBACK
         * -----------------------------------------------------
         */
        async jwt({
            token,
            user,
        }) {
            /**
             * -----------------------------------------------
             * FIRST LOGIN
             * -----------------------------------------------
             *
             * user exists only when Credentials authorize()
             * successfully returns a user.
             */
            if (user) {
                return {
                    ...token,

                    accessToken:
                        (user as any).accessToken,

                    refreshToken:
                        (user as any).refreshToken,

                    authority:
                        (user as any).authority ?? [],

                    expiresAt:
                        (user as any).expiresAt,

                    error: undefined,
                }
            }

            /**
             * -----------------------------------------------
             * CURRENT TIME
             * -----------------------------------------------
             */
            const currentTimeInSeconds =
                Math.floor(
                    Date.now() / 1000,
                )

            /**
             * -----------------------------------------------
             * ACCESS TOKEN EXPIRATION
             * -----------------------------------------------
             */
            const tokenExpiresAt =
                Number(token.expiresAt) ||
                getAccessTokenExpiresAt(
                    String(
                        token.accessToken ?? '',
                    ),
                )

            /**
             * -----------------------------------------------
             * ACCESS TOKEN IS STILL VALID
             * -----------------------------------------------
             *
             * Keep a 10 second safety window.
             */
            if (
                tokenExpiresAt &&
                currentTimeInSeconds <
                    tokenExpiresAt - 10
            ) {
                return {
                    ...token,

                    /**
                     * Keep refresh token unchanged
                     */
                    refreshToken:
                        token.refreshToken,

                    expiresAt:
                        String(tokenExpiresAt),
                }
            }

            /**
             * -----------------------------------------------
             * ACCESS TOKEN EXPIRED / ABOUT TO EXPIRE
             * -----------------------------------------------
             */
            return refreshAccessToken(
                token,
            )
        },

        /**
         * -----------------------------------------------------
         * SESSION CALLBACK
         * -----------------------------------------------------
         */
        async session({
            session,
            token,
        }) {
            return {
                ...session,

                accessToken:
                    token.accessToken as string,

                refreshToken:
                    token.refreshToken as string,

                error:
                    token.error as
                        | string
                        | undefined,

                user: {
                    ...session.user,

                    id:
                        token.sub ?? '',

                    authority:
                        token.authority ?? [],
                },
            }
        },
    },
} satisfies NextAuthConfig
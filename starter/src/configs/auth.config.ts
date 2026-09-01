import type { NextAuthConfig } from 'next-auth'
import { apiLoginServer } from '@/services/client/AuthServerServices'

import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import type { SignInCredential } from '@/@types/auth'
const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

function getAuthorityFromAccessToken(accessToken: string): string[] {
    try {
        const payloadPart = accessToken.split('.')[1]

        if (!payloadPart) {
            return []
        }

        // تبدیل Base64Url به Base64 معمولی
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')

        const payload = JSON.parse(
            Buffer.from(base64, 'base64').toString('utf-8'),
        ) as Record<string, unknown>

        const roleValue = payload[ROLE_CLAIM]

        // اگر بک‌اند در آینده چند Role ارسال کرد، این حالت هم پشتیبانی می‌شود
        const roles = Array.isArray(roleValue) ? roleValue : [roleValue]

        return roles
            .map(String)
            .map((role) => {
                switch (role) {
                    case '1':
                        return 'ADMIN'
                    case '2':
                        return 'TRAINER'
                    case '3':
                        return 'MEMBER'
                    default:
                        return null
                }
            })
            .filter((role): role is string => role !== null)
    } catch (error) {
        console.error('Could not extract role from access token:', error)
        return []
    }
}

export default {
    providers: [
        // Github({
        //     clientId: process.env.GITHUB_AUTH_CLIENT_ID,
        //     clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        // }),
        // Google({
        //     clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
        //     clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        // }),
        Credentials({
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
                console.log('AUTHORIZE HAS BEEN CALLED:', credentials)
                const nationalCode = credentials?.nationalCode
                const code = credentials?.code

                if (
                    typeof nationalCode !== 'string' ||
                    typeof code !== 'string' ||
                    !nationalCode.trim() ||
                    !code.trim()
                ) {
                    return null
                }

                try {
    const loginResponse = await apiLoginServer({
    nationalCode: nationalCode.trim(),
    code: code.trim(),
})


    console.log('OTP API login response:', loginResponse)

    if (!loginResponse?.accessToken) {
        console.error(
            'accessToken was not found in API response:',
            loginResponse,
        )
        return null
    }

    const authority = getAuthorityFromAccessToken(loginResponse.accessToken)

console.log('User authority extracted from access token:', authority)

return {
    id: nationalCode.trim(),
    authority,
    accessToken: loginResponse.accessToken,
    refreshToken: loginResponse.refreshToken,
    expiresAt: loginResponse.expiresAt,
}

} catch (error) {
    console.error('OTP login failed:', error)
    return null
}

            },
        }),
    ],
    callbacks: {
    async jwt({ token, user }) {
        /*
         * user فقط در ورود اولیه وجود دارد؛
         * داده‌های برگشتی authorize را داخل JWT رمزگذاری‌شده NextAuth ذخیره می‌کنیم.
         */
        if (user) {
            token.authority = user.authority ?? []

            token.accessToken = user.accessToken
            token.refreshToken = user.refreshToken
            token.expiresAt = user.expiresAt
        }

        return token
    },

    async session({ session, token }) {
        /*
         * accessToken را برای درخواست‌های سمت کلاینت در دسترس می‌گذاریم.
         * refreshToken را عمداً به Session نمی‌فرستیم.
         */
        return {
            ...session,

            accessToken: token.accessToken,

            user: {
                ...session.user,
                id: token.sub ?? '',
                authority: token.authority ?? [],
            },
        }
    },
},

} satisfies NextAuthConfig

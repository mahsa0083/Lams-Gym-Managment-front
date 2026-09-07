import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        /**
         * فقط accessToken را فعلاً برای استفاده در درخواست‌های API
         * به Session منتقل می‌کنیم.
         */
        accessToken?: string

        user: {
            id: string
            authority: string[]
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        authority: string[]

        accessToken?: string
        refreshToken?: string
        expiresAt?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        authority: string[]

        accessToken?: string
        refreshToken?: string
        expiresAt?: number
    }
}

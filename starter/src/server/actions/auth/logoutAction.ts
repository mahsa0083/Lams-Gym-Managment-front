'use server'

import { auth, signOut } from '@/auth'
import { apiLogoutServer } from '@/services/client/AuthServerServices'

export async function serverLogout() {
    try {
        const session = await auth()
        const refreshToken = (session as any)?.refreshToken
        const accessToken = (session as any)?.accessToken

        console.log('Server Action Logout - RefreshToken found:', !!refreshToken)

        if (refreshToken) {
            await apiLogoutServer(
                { refreshToken },
                accessToken
            )
        }
    } catch (error) {
        console.error('Logout error on backend:', error)
    }

    // خروج از سشن NextAuth و ریدایرکت خودکار به صفحه لاگین
    await signOut({ redirectTo: '/sign-in' })
}

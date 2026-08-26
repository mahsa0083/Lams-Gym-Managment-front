import NextAuth from 'next-auth'
import authConfig from '@/configs/auth.config'
import {
    authRoutes as _authRoutes,
    publicRoutes as _publicRoutes,
    protectedRoutes,
} from '@/configs/routes.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import appConfig from '@/configs/app.config'

const { auth } = NextAuth(authConfig)

const publicRoutes = Object.entries(_publicRoutes).map(([key]) => key)
const authRoutes = Object.entries(_authRoutes).map(([key]) => key)

const apiAuthPrefix = '/api/auth'


function getDashboardUrl(userRoles: string[], nextUrl: URL) {
    if (userRoles.includes('ADMIN')) {
        return new URL('/admin', nextUrl)
    }
    if (userRoles.includes('TRAINER')) {
        return new URL('/trainer', nextUrl)
    }
    return new URL('/member', nextUrl)
}

export default auth((req) => {
    const { nextUrl } = req

    // مسیرهای داخلی NextAuth به هیچ وجه نباید پردازش یا ریدایرکت شوند
    if (nextUrl.pathname.startsWith('/api/auth')) {
        return
    }

    const isSignedIn = !!req.auth
    const userRoles = (req.auth?.user as any)?.authority || []

    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    // ۱. اگر کاربر وارد شده باشد و به / یا صفحات ورود (مثل /sign-in) بیاید
    if (isSignedIn && (nextUrl.pathname === '/' || isAuthRoute)) {
        return Response.redirect(getDashboardUrl(userRoles, nextUrl))
    }

    // ۲. اگر کاربر مهمان است و صفحه نه Public است و نه AuthRoute، به لاگین برود
    if (!isSignedIn && !isPublicRoute && !isAuthRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
            callbackUrl += nextUrl.search
        }

        return Response.redirect(
            new URL(
                `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(callbackUrl)}`,
                nextUrl,
            ),
        )
    }

    // ۳. بررسی دسترسی نقش‌ها برای صفحات محافظت‌شده
    if (isSignedIn && nextUrl.pathname !== '/access-denied') {
        const routeMeta = (protectedRoutes as Record<string, any>)[nextUrl.pathname]
        
        if (routeMeta && routeMeta.authority && routeMeta.authority.length > 0) {
            const hasAccess = routeMeta.authority.some((role: string) => userRoles.includes(role))
            
            if (!hasAccess) {
                return Response.redirect(new URL('/access-denied', nextUrl))
            }
        }
    }
})


export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}
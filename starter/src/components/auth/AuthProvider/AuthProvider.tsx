'use client'

import { useEffect } from 'react'
import { SessionProvider as NextAuthSessionProvider, signOut } from 'next-auth/react'
import SessionContext from './SessionContext'
import type { Session as NextAuthSession } from 'next-auth'
import appConfig from '@/configs/app.config' // یا مسیر کانفیگ شما برای ریدایرکت، مثلاً '/sign-in'
import moment from 'jalali-moment'
moment.locale('fa')

type Session = NextAuthSession | null

type AuthProviderProps = {
    session: Session | null
    children: React.ReactNode
}

const AuthProvider = (props: AuthProviderProps) => {
    const { session, children } = props

    useEffect(() => {
        // هر زمان که رفرش توکن نامعتبر یا منقضی شد، کاربر را به لاگین هدایت کن
        if (session && 'error' in session && (session as any).error === 'RefreshAccessTokenError') {
            signOut({
                callbackUrl: appConfig.unAuthenticatedEntryPath || '/sign-in',
                redirect: true,
            })
            
        }
    }, [session])

    return (
        /** since the next auth useSession hook was triggering mutliple re-renders, hence we are using the our custom session provider and we still included the next auth session provider, incase we need to use any client hooks from next auth */
        <NextAuthSessionProvider session={session} refetchOnWindowFocus={false}>
            <SessionContext.Provider value={session}>
                {children}
            </SessionContext.Provider>
        </NextAuthSessionProvider>
    )
}

export default AuthProvider

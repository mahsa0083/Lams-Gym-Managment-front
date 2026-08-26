import { auth } from '@/auth'
import AuthProvider from '@/components/auth/AuthProvider'
import ThemeProvider from '@/components/template/Theme/ThemeProvider'
import pageMetaConfig from '@/configs/page-meta.config'
import NavigationProvider from '@/components/template/Navigation/NavigationProvider'
import { getNavigation } from '@/server/actions/navigation/getNavigation'
import { getTheme } from '@/server/actions/theme'
import { getLocale } from '@/server/actions/locale'
import type { ReactNode } from 'react'
import '@/assets/styles/app.css'
import '@/assets/styles/global.scss'

export const metadata = {
    ...pageMetaConfig,
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: ReactNode
}>) {
    const session = await auth()
    const locale = await getLocale()
    const navigationTree = await getNavigation()
    const theme = await getTheme()

    const userRole = (session?.user as any)?.authority?.[0] || 'MEMBER'

    return (
        <AuthProvider session={session}>
            <html
                className={theme.mode === 'dark' ? 'dark' : 'light'}
                lang={locale}
                dir={theme.direction}
                data-role={userRole}
                data-theme-schema={theme.themeSchema || 'default'} // 👈 اضافه کردن شِمای تم مستقیم روی HTML
                suppressHydrationWarning
            >
                <body suppressHydrationWarning>
                    <ThemeProvider locale={locale} theme={theme}>
                        <NavigationProvider navigationTree={navigationTree}>
                            {children}
                        </NavigationProvider>
                    </ThemeProvider>
                </body>
            </html>
        </AuthProvider>
    )
}
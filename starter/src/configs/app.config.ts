export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    activeNavTranslation: boolean
}

const appConfig: AppConfig = {
   apiPrefix: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5288'}/api`,


    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    activeNavTranslation: false,
}

export default appConfig

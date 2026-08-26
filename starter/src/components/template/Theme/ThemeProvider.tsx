'use client'

import { useState } from 'react'
import ThemeContext from './ThemeContext'
import ConfigProvider from '@/components/ui/ConfigProvider'
import appConfig from '@/configs/app.config'
import { setTheme as setThemeCookies } from '@/server/actions/theme' // 👈 اضافه کردن ایمپورت اکشن کوکی
import type { Theme } from '@/@types/theme'
import type { CommonProps } from '@/@types/common'

interface ThemeProviderProps extends CommonProps {
    theme: Theme
    locale?: string
}

const ThemeProvider = ({ children, theme, locale }: ThemeProviderProps) => {
    const [themeState, setThemeState] = useState<Theme>(theme)

    const handleSetTheme = async (payload: (param: Theme) => Theme | Theme) => {
        const setTheme = async (theme: Theme) => {
            setThemeState(theme)
            await setThemeCookies(JSON.stringify({ state: theme }))
        }

        if (typeof payload === 'function') {
            const nextTheme = payload(themeState)
            await setTheme(nextTheme)
        } else {
            await setTheme(payload)
        }
    }

    const mode = (() => {
        if (theme.mode !== 'system') return theme.mode
        if (typeof window === 'undefined') return 'light'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    })()

    return (
        <ThemeContext.Provider
            value={{
                theme: themeState,
                setTheme: handleSetTheme,
            }}
        >
            <ConfigProvider
                value={{
                    ...theme,
                    mode,
                    locale: locale || appConfig.locale,
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    )
}

export default ThemeProvider
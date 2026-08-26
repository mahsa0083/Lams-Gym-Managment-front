import type { Mode } from '@/@types/theme'
import type { Variables } from '@/configs/preset-theme-schema.config'

type ThemeVariables = Record<Variables, string>

type ThemeMode = Exclude<Mode, 'system'>

type ThemeSchemaConfig = Record<string, Record<ThemeMode, ThemeVariables>>

interface MappedTheme {
    [key: string]: string
}

const applyTheme = (
    theme: string,
    mode: Mode,
    presetThemeSchemaConfig: ThemeSchemaConfig,
): void => {
    const mapTheme = (variables: ThemeVariables): MappedTheme => {
        return {
            '--primary': variables.primary || '',
            '--primary-deep': variables.primaryDeep || '',
            '--primary-mild': variables.primaryMild || '',
            '--primary-subtle': variables.primarySubtle || '',
            '--muted': variables.muted || '',
        }
    }

    const resolvedMode = (() => {
        if (mode !== 'system') return mode
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    })()

    if (presetThemeSchemaConfig[theme][resolvedMode]) {
        const themeObject = mapTheme(
            presetThemeSchemaConfig[theme][resolvedMode],
        )
        if (!themeObject) return

        const root = document.documentElement

        Object.keys(themeObject).forEach((property) => {
            if (property === 'name') {
                return
            }

            root.style.setProperty(property, themeObject[property])
        })
    }
}

export default applyTheme

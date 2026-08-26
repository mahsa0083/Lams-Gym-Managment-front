export type Variables =
    | 'primary'
    | 'primaryDeep'
    | 'primaryMild'
    | 'primarySubtle'
    | 'muted'

export type ThemeVariables = Record<'light' | 'dark', Record<Variables, string>>

const defaultTheme: ThemeVariables = {
    light: {
        primary: '#286cf0',
        primaryDeep: '#1f56c0',
        primaryMild: '#4c86f4',
        primarySubtle: '#286cf01a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#286cf0',
        primaryDeep: '#1f56c0',
        primaryMild: '#4c86f4',
        primarySubtle: '#286cf01a',
        muted: '#ffffff',
    },
}

const darkTheme: ThemeVariables = {
    light: {
        primary: '#18181b',
        primaryDeep: '#09090b',
        primaryMild: '#27272a',
        primarySubtle: '#18181b0d',
        muted: '#ffffff',
    },
    dark: {
        primary: '#ffffff',
        primaryDeep: '#09090b',
        primaryMild: '#e5e7eb',
        primarySubtle: '#ffffff1a',
        muted: '#111827',
    },
}

const greenTheme: ThemeVariables = {
    light: {
        primary: '#0cbf7a',
        primaryDeep: '#0a9962',
        primaryMild: '#3dcc95',
        primarySubtle: '#0cbf7a1a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#0cbf7a',
        primaryDeep: '#0a9962',
        primaryMild: '#3dcc95',
        primarySubtle: '#0cbf7a1a',
        muted: '#ffffff',
    },
}

const purpleTheme: ThemeVariables = {
    light: {
        primary: '#9d5cfb',
        primaryDeep: '#7d4ac9',
        primaryMild: '#b17dfc',
        primarySubtle: '#9d5cfb1a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#9d5cfb',
        primaryDeep: '#7d4ac9',
        primaryMild: '#b17dfc',
        primarySubtle: '#9d5cfb1a',
        muted: '#ffffff',
    },
}

const orangeTheme: ThemeVariables = {
    light: {
        primary: '#fb732c',
        primaryDeep: '#cc5c24',
        primaryMild: '#fc8f56',
        primarySubtle: '#fb732c1a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#fb732c',
        primaryDeep: '#cc5c24',
        primaryMild: '#fc8f56',
        primarySubtle: '#fb732c1a',
        muted: '#ffffff',
    },
}

const cyanTheme: ThemeVariables = {
    light: {
        primary: '#07b9e7',
        primaryDeep: '#0594b9',
        primaryMild: '#39c7ec',
        primarySubtle: '#07b9e71a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#07b9e7',
        primaryDeep: '#0594b9',
        primaryMild: '#39c7ec',
        primarySubtle: '#07b9e71a',
        muted: '#ffffff',
    },
}

const goldTheme: ThemeVariables = {
    light: {
        primary: '#f3a027',
        primaryDeep: '#c2801f',
        primaryMild: '#f5b352',
        primarySubtle: '#f3a0271a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#f3a027',
        primaryDeep: '#c2801f',
        primaryMild: '#f5b352',
        primarySubtle: '#f3a0271a',
        muted: '#ffffff',
    },
}

const pinkTheme: ThemeVariables = {
    light: {
        primary: '#f93f90',
        primaryDeep: '#c73273',
        primaryMild: '#fa65a6',
        primarySubtle: '#f93f901a',
        muted: '#ffffff',
    },
    dark: {
        primary: '#f93f90',
        primaryDeep: '#c73273',
        primaryMild: '#fa65a6',
        primarySubtle: '#f93f901a',
        muted: '#ffffff',
    },
}

const presetThemeSchemaConfig: Record<string, ThemeVariables> = {
    default: defaultTheme,
    green: greenTheme,
    purple: purpleTheme,
    orange: orangeTheme,
    cyan: cyanTheme,
    gold: goldTheme,
    pink: pinkTheme,
    dark: darkTheme,
}

export default presetThemeSchemaConfig

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import nextConfig from 'eslint-config-next/core-web-vitals'
import { defineConfig } from 'eslint/config'

export default defineConfig(
    { ignores: ['.next/**', 'src/icons/**', 'mcp-server/**'] },
    ...nextConfig,
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
        },
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/incompatible-library': 'off',
            'no-useless-assignment': 'off',
            '@eslint/preserve-caught-error': 'off',
            'preserve-caught-error': 'off',
            'no-unassigned-vars': 'off',
        },
    },
)

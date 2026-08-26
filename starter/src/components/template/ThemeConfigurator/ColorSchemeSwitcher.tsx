import classNames from '@/utils/classNames'
import presetThemeSchemaConfig from '@/configs/preset-theme-schema.config'
import useTheme from '@/utils/hooks/useTheme'

const ColorSchemeSwitcher = () => {
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)
    const mode = useTheme((state) => state.mode)

    const normalizedMode =
        mode === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : mode

    return (
        <div className="inline-flex items-center gap-2">
            {Object.entries(presetThemeSchemaConfig).map(([key, value]) => (
                <button
                    key={key}
                    className={classNames(
                        'h-6 w-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800',
                        schema === key && 'ring-2 ring-primary',
                    )}
                    style={{
                        backgroundColor: value[normalizedMode].primary || '',
                    }}
                    onClick={() => setSchema(key)}
                />
            ))}
        </div>
    )
}

export default ColorSchemeSwitcher

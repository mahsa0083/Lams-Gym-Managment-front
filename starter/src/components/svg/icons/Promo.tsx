import type { SvgProps } from '@/@types/common'
const Promo = ({
    primaryColorClass = 'fill-primary',
    secondaryColorClass = 'fill-primary-subtle',
    ...props
}: SvgProps & { primaryColorClass?: string; secondaryColorClass?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            {...props}
        >
            <title>{'Promo'}</title>
            <defs></defs>
            <g>
                <g>
                    <path
                        d="M74.25 63.86 45.7 54.17l-1.52-14.44s-15.81-3.74-18 6.12 4.76 11.21 4.76 11.21l15.63.34 28.87 15.13Z"
                        className={secondaryColorClass}
                    />
                    <path
                        d="m37.89 59.27-2.21 4.76v15.46h5.78V66.75l5.26-6.63-8.83-.85z"
                        className={secondaryColorClass}
                    />
                </g>
                <g>
                    <path
                        d="M44.78 59.9h-5.63l5.24.48.39-.48z"
                        style={{
                            fill: 'none',
                        }}
                    />
                    <path
                        d="M76.27 19.23a1.39 1.39 0 0 0-1.38-.05l-30 15.69H33.63A12.51 12.51 0 0 0 22.88 41h-6.36a1.41 1.41 0 0 0-1.41 1.41v9.51a1.41 1.41 0 0 0 1.41 1.41h6.1a12.58 12.58 0 0 0 7.11 5.94v20.3a1.41 1.41 0 0 0 1.4 1.43h10a1.41 1.41 0 0 0 1.41-1.41l-.22-12.17 4.89-5.95a1.31 1.31 0 0 0 .21-.36L75 73.82a1.37 1.37 0 0 0 .59.13A1.41 1.41 0 0 0 77 72.54v-16.1a10.42 10.42 0 0 0 0-20.23V20.43a1.4 1.4 0 0 0-.73-1.2ZM39.79 66a1.37 1.37 0 0 0-.32.91l.2 11.26h-7.13V59.86h12.24l-.4.47ZM17.93 43.82h3.71a12.5 12.5 0 0 0-.13 6.7h-3.58Zm6 3.58a9.72 9.72 0 0 1 9.7-9.7h10.14v19.39H33.63a9.71 9.71 0 0 1-9.7-9.69Zm22.66-10.26 27.54-14.38v47.58L46.59 57.6Zm30.36 2A7.6 7.6 0 0 1 77 53.5Z"
                        className={primaryColorClass}
                    />
                    <path
                        d="M32.49 43.14h5.44a1.41 1.41 0 0 0 0-2.82h-5.44a1.41 1.41 0 0 0 0 2.82Z"
                        className={primaryColorClass}
                    />
                </g>
            </g>
        </svg>
    )
}

export default Promo

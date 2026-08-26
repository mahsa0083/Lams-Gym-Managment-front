import type { SvgProps } from '@/@types/common'

const Dots = ({ width = 300, height = 300, ...rest }: SvgProps) => {
    const dotSpacing = 20
    const dotRadius = 1.5

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            {...rest}
        >
            <defs>
                <radialGradient id="dotFade" cx="50%" cy="50%" r="70%">
                    <stop offset="45%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="dotFadeMask">
                    <rect width={width} height={height} fill="url(#dotFade)" />
                </mask>
            </defs>
            <g
                className="fill-gray-200 dark:fill-gray-700"
                mask="url(#dotFadeMask)"
            >
                {Array.from({
                    length: Math.ceil((width as number) / dotSpacing),
                }).map((_, i) =>
                    Array.from({
                        length: Math.ceil((height as number) / dotSpacing),
                    }).map((_, j) => {
                        const cx = i * dotSpacing
                        const cy = j * dotSpacing
                        return (
                            <circle
                                key={`${i}-${j}`}
                                cx={cx}
                                cy={cy}
                                r={dotRadius}
                            />
                        )
                    }),
                )}
            </g>
        </svg>
    )
}

export default Dots

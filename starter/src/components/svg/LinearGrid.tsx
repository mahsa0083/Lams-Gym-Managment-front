import type { SvgProps } from '@/@types/common'

const LinearGrid = ({
    width = 300,
    height = 300,
    spacing = 40,
    ...rest
}: SvgProps) => {
    const lines = []

    for (let x = 0; x <= (width as number); x += spacing as number) {
        lines.push(
            <line
                key={`v-${x}`}
                x1={x}
                y1={0}
                x2={x}
                y2={height}
                className="stroke-gray-200 dark:stroke-gray-700"
            />,
        )
    }

    for (let y = 0; y <= (height as number); y += spacing as number) {
        lines.push(
            <line
                key={`h-${y}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                className="stroke-gray-200 dark:stroke-gray-700"
            />,
        )
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            {...rest}
        >
            <defs>
                <radialGradient id="linearGridFade" cx="50%" cy="50%" r="60%">
                    <stop offset="50%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="fadeMask">
                    <rect
                        width={width}
                        height={height}
                        fill="url(#linearGridFade)"
                    />
                </mask>
            </defs>

            <g strokeWidth="1" mask="url(#fadeMask)">
                {lines}
            </g>
        </svg>
    )
}

export default LinearGrid

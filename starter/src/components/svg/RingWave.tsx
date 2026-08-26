import type { SvgProps } from '@/@types/common'

const RingWave = ({ width = 300, height = 300, ...rest }: SvgProps) => {
    const minSize = Math.min(width as number, height as number)
    const center = minSize / 2

    const radii = [0.3, 0.5, 0.7, 0.9].map((f) => f * center)
    const opacities = [0.9, 0.65, 0.4, 0.3]

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            {...rest}
        >
            <g fill="none" className="stroke-gray-200 dark:stroke-gray-700">
                {radii.map((r, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={r}
                        strokeOpacity={opacities[i]}
                    />
                ))}
            </g>
        </svg>
    )
}
export default RingWave

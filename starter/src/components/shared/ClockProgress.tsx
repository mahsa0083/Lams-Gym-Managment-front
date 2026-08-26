type ClockProgressProps = {
    value: number // 0 to 100
    size?: number
}

const ClockProgress = ({ value, size = 40 }: ClockProgressProps) => {
    const radius = size / 2
    const angle = (value / 100) * 360
    const radians = (angle - 90) * (Math.PI / 180)
    const x = radius + radius * Math.cos(radians)
    const y = radius + radius * Math.sin(radians)
    const largeArc = value > 50 ? 1 : 0

    const pathData =
        value === 100
            ? `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius - 0.01} 0 Z`
            : `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} Z`

    return (
        <div className="rounded-full border border-gray-300 dark:border-gray-700">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={radius}
                    cy={radius}
                    r={radius}
                    className="fill-gray-100 dark:fill-gray-600"
                />
                <path
                    d={pathData}
                    className="fill-gray-400 dark:fill-gray-800"
                />
            </svg>
        </div>
    )
}

export default ClockProgress

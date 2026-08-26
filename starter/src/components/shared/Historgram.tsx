import { useMemo } from 'react'
import classNames from '@/utils/classNames'

type HistorgramProps = {
    data: { value: number; label: string }[]
    range: [number, number]
    min: number
    max: number
    className?: string
}

const Historgram = ({ data, range, min, max, className }: HistorgramProps) => {
    const MIN = min
    const MAX = max
    const maxBar = Math.max(...data.map((d) => d.value))
    const binSize = (MAX - MIN) / data.length
    const bars = useMemo(
        () =>
            data.map((value, i) => {
                const centre = MIN + i * binSize + binSize / 2
                const active = centre >= range[0] && centre <= range[1]
                return { value, active }
            }),
        [MIN, binSize, data, range],
    )

    return (
        <div>
            <div
                style={{
                    height: 60,
                    display: 'flex',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                }}
            >
                {bars.map(({ value, active }, idx) => (
                    <div
                        key={idx}
                        style={{
                            height: `${(value.value / maxBar) * 100}%`,
                        }}
                        className={classNames(
                            'flex-1 mx-0.25 transition-colors duration-150 rounded-xs',
                            active
                                ? 'bg-primary'
                                : 'bg-gray-200 dark:bg-gray-700',
                            className,
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

export default Historgram

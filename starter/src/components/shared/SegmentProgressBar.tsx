import classNames from '@/utils/classNames'
type SegmentedProgressBarProps = {
    segments: number
    percent: number
    filledClass?: string
    className?: string
    emptyColor?: string
    gap?: number
    height?: number
}

const SegmentedProgressBar = ({
    segments,
    percent,
    filledClass = 'bg-emerald-500',
    className,
    gap = 4,
    height = 16,
}: SegmentedProgressBarProps) => {
    const filledSegments = Math.round((percent / 100) * segments)

    const getFilledColor = (index: number) => {
        return index < filledSegments
            ? filledClass
            : 'bg-gray-200 dark:bg-gray-700'
    }

    return (
        <div
            style={{
                gap: `${gap}px`,
            }}
            className="flex w-full"
        >
            {Array.from({ length: segments }).map((_, index) => (
                <div
                    key={index}
                    style={{
                        flex: 1,
                        height,
                    }}
                    className={classNames(
                        'rounded-xs',
                        className,
                        getFilledColor(index),
                    )}
                />
            ))}
        </div>
    )
}

export default SegmentedProgressBar

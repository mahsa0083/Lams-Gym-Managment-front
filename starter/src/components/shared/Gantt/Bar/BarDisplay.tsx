import classNames from '@/utils/classNames'
import type { MouseEvent as ReactMouseEvent } from 'react'

type BarDisplayProps = {
    x: number
    y: number
    width: number
    height: number
    isSelected: boolean
    progressX: number
    progressWidth: number
    barCornerRadius: number
    styles: {
        indicatorColor?: string
        progressClass?: string
        wrapperClass?: string
    }
    onMouseDown: (event: ReactMouseEvent<SVGPolygonElement, MouseEvent>) => void
}
const BarDisplay = ({
    x,
    y,
    width,
    height,
    progressX,
    progressWidth,
    barCornerRadius,
    styles,
    onMouseDown,
}: BarDisplayProps) => {
    return (
        <g onMouseDown={onMouseDown}>
            <rect
                x={x}
                width={width}
                y={y}
                height={height}
                ry={barCornerRadius}
                rx={barCornerRadius}
                className={classNames(
                    'gantt-bar-display select-none',
                    styles?.wrapperClass,
                )}
            />
            <rect
                x={progressX}
                width={progressWidth}
                y={y}
                height={height}
                ry={barCornerRadius}
                rx={barCornerRadius}
                className={styles?.progressClass}
            />
        </g>
    )
}

export default BarDisplay

import type { MouseEvent as ReactMouseEvent } from 'react'

type BarDateHandleProps = {
    x: number
    y: number
    width: number
    height: number
    barCornerRadius: number
    onMouseDown: (event: ReactMouseEvent<SVGRectElement, MouseEvent>) => void
}
const BarDateHandle = ({
    x,
    y,
    width,
    height,
    barCornerRadius,
    onMouseDown,
}: BarDateHandleProps) => {
    return (
        <g className="gantt-bar-date-handler-group opacity-0 group-hover:opacity-100 active:opacity-100">
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                className="gantt-bar-date-handler fill-[#00000047] cursor-ew-resize"
                ry={barCornerRadius}
                rx={barCornerRadius}
                onMouseDown={onMouseDown}
            />
            <line
                x1={x + width / 2}
                y1={y + 8}
                x2={x + width / 2}
                y2={y + height - 8}
                className="gantt-bar-date-handler-line stroke-white stroke-[2] cursor-ew-resize pointer-events-none"
            />
        </g>
    )
}

export default BarDateHandle

import type { MouseEvent as ReactMouseEvent } from 'react'

type BarProgressHandleProps = {
    progressPoint: string
    onMouseDown: (event: ReactMouseEvent<SVGPolygonElement, MouseEvent>) => void
}
const BarProgressHandle = ({
    progressPoint,
    onMouseDown,
}: BarProgressHandleProps) => {
    return (
        <polygon
            className="gantt-bar-progress-handler cursor-ew-resize opacity-0 group-hover:visible group-hover:opacity-100 active:opacity-100 fill-[#00000070]"
            points={progressPoint}
            onMouseDown={onMouseDown}
            style={{
                transform: 'translate(0, 3px)',
            }}
        />
    )
}

export default BarProgressHandle

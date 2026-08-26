import React from 'react'
import { getProgressPoint } from '../utils/bar'
import BarDateHandle from './BarDateHandle'
import BarProgressHandle from './BarProgressHandle'
import BarDisplay from './BarDisplay'
import type { GanttContentMoveAction, BarTask } from '../types'

type BarProps<T = object> = {
    task: BarTask<T>
    isProgressChangeable: boolean
    isDateChangeable: boolean
    isSelected: boolean
    rtl: boolean
    onEventStart: (
        action: GanttContentMoveAction,
        selectedTask: BarTask<T>,
        event?: React.MouseEvent | React.KeyboardEvent,
    ) => void
}

const Bar = <T extends object = object>({
    task,
    isProgressChangeable,
    isDateChangeable,
    rtl,
    onEventStart,
    isSelected,
}: BarProps<T>) => {
    const progressPoint = getProgressPoint(
        +!rtl * task.progressWidth + task.progressX,
        task.y,
        task.height,
    )
    const handleHeight = task.height - 2
    return (
        <g
            className="gantt-bar-wrapper cursor-pointer outline-none group"
            tabIndex={0}
        >
            <BarDisplay
                x={task.x1}
                y={task.y}
                width={task.x2 - task.x1}
                height={task.height}
                progressX={task.progressX}
                progressWidth={task.progressWidth}
                barCornerRadius={task.barCornerRadius}
                styles={task.styles}
                isSelected={isSelected}
                onMouseDown={(e) => {
                    if (isDateChangeable) {
                        onEventStart('move', task, e)
                    }
                }}
            />
            <g className="handleGroup">
                {isDateChangeable && (
                    <g>
                        <BarDateHandle
                            x={task.x1 + 1}
                            y={task.y + 1}
                            width={task.handleWidth}
                            height={handleHeight}
                            barCornerRadius={task.barCornerRadius}
                            onMouseDown={(e) => {
                                onEventStart('start', task, e)
                            }}
                        />
                        <BarDateHandle
                            x={task.x2 - task.handleWidth - 1}
                            y={task.y + 1}
                            width={task.handleWidth}
                            height={handleHeight}
                            barCornerRadius={task.barCornerRadius}
                            onMouseDown={(e) => {
                                onEventStart('end', task, e)
                            }}
                        />
                    </g>
                )}
                {isProgressChangeable && (
                    <BarProgressHandle
                        progressPoint={progressPoint}
                        onMouseDown={(e) => {
                            onEventStart('progress', task, e)
                        }}
                    />
                )}
            </g>
        </g>
    )
}

export default Bar

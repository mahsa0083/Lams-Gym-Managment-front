import classNames from '@/components/ui/utils/classNames'
import type { BarTask, GanttContentMoveAction } from './types'
import type { MouseEvent, KeyboardEvent } from 'react'

type MilestoneProps<T = object> = {
    task: BarTask<T>
    isDateChangeable?: boolean
    isSelected: boolean
    onEventStart: (
        action: GanttContentMoveAction,
        selectedTask: BarTask<T>,
        event?: MouseEvent | KeyboardEvent,
    ) => void
}

const Milestone = <T extends object = object>({
    task,
    isDateChangeable,
    onEventStart,
}: MilestoneProps<T>) => {
    const transform = `rotate(45 ${task.x1 + task.height * 0.356} 
    ${task.y + task.height * 0.85})`
    return (
        <g
            tabIndex={0}
            className="milestone-wrapper cursor-pointer outline-none"
        >
            <rect
                x={task.x1}
                width={task.height}
                y={task.y}
                height={task.height}
                rx={task.barCornerRadius}
                ry={task.barCornerRadius}
                transform={transform}
                className={classNames(
                    'gantt-milestone select-none',
                    task.styles.wrapperClass,
                )}
                onMouseDown={(e) => {
                    if (isDateChangeable) {
                        onEventStart('move', task, e)
                    }
                }}
            />
        </g>
    )
}

export default Milestone

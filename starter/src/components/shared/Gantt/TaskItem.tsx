import Bar from './Bar'
import Milestone from './MileStone'
import Project from './Project'
import type { BarTask, GanttContentMoveAction, CustomBarContent } from './types'

export type TaskItemProps<T> = {
    task: BarTask<T>
    arrowIndent: number
    taskHeight: number
    isProgressChangeable: boolean
    isDateChangeable: boolean
    isDelete: boolean
    isSelected: boolean
    rtl: boolean
    customBarContent?: CustomBarContent<T>
    onEventStart: (
        action: GanttContentMoveAction,
        selectedTask: BarTask<T>,
        event?: React.MouseEvent | React.KeyboardEvent,
    ) => void
}

const TaskItem = <T extends object>(props: TaskItemProps<T>) => {
    const { task, isDelete, taskHeight, customBarContent, onEventStart } = {
        ...props,
    }

    const getX = () => {
        return task.x1 + 8
    }
    return (
        <g
            onKeyDown={(e) => {
                switch (e.key) {
                    case 'Delete': {
                        if (isDelete) onEventStart('delete', task, e)
                        break
                    }
                }
                e.stopPropagation()
            }}
            onMouseEnter={(e) => {
                onEventStart('mouseenter', task, e)
            }}
            onMouseLeave={(e) => {
                onEventStart('mouseleave', task, e)
            }}
            onDoubleClick={(e) => {
                onEventStart('dblclick', task, e)
            }}
            onClick={(e) => {
                onEventStart('click', task, e)
            }}
            onFocus={() => {
                onEventStart('select', task)
            }}
        >
            {task.typeInternal === 'task' && <Bar<T> {...props} />}
            {task.typeInternal === 'milestone' && <Milestone<T> {...props} />}
            {task.typeInternal === 'project' && <Project<T> {...props} />}
            {task.typeInternal === 'task' && (
                <foreignObject
                    x={getX()}
                    y={task.y}
                    width={Math.max(0, task.x2 - getX() - 8)}
                    height={taskHeight}
                    className="overflow-hidden pointer-events-none"
                >
                    <div
                        className="flex items-center h-full px-1"
                        style={{ width: '100%' }}
                    >
                        {customBarContent ? (
                            customBarContent(task)
                        ) : (
                            <span className="text-white text-nowrap select-none">
                                {task.name}
                            </span>
                        )}
                    </div>
                </foreignObject>
            )}
            {task.typeInternal === 'project' && (
                <foreignObject
                    x={getX() - 10}
                    y={task.y - 10}
                    width={Math.max(0, task.x2 - getX() - 8)}
                    height={taskHeight}
                    className="overflow-hidden pointer-events-none"
                >
                    <div
                        className="flex items-center h-full px-1"
                        style={{ width: '100%' }}
                    >
                        <span className="heading-text font-semibold text-nowrap select-none">
                            {task.name}
                        </span>
                    </div>
                </foreignObject>
            )}
        </g>
    )
}

export default TaskItem

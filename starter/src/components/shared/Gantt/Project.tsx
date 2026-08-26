import classNames from '@/components/ui/utils/classNames'
import type { BarTask } from './types'

type ProjectProps<T = object> = {
    task: BarTask<T>
    isSelected: boolean
}

const projectBarHeight = 6

const Project = <T extends object = object>({ task }: ProjectProps<T>) => {
    const projectWith = task.x2 - task.x1

    return (
        <g
            tabIndex={0}
            className="gantt-project-wrapper cursor-pointer outline-none"
        >
            <rect
                x={task.x1}
                width={projectWith}
                y={task.y + 16}
                height={projectBarHeight}
                rx={task.barCornerRadius}
                ry={task.barCornerRadius}
                className={classNames(
                    'gantt-project-background select-none',
                    task.styles?.wrapperClass,
                )}
            />
            <rect
                x={task.progressX}
                width={task.progressWidth}
                y={task.y + 16}
                height={projectBarHeight}
                ry={task.barCornerRadius}
                rx={task.barCornerRadius}
                className={classNames(
                    'gantt-project-progress select-none',
                    task.styles?.progressClass,
                )}
            />
        </g>
    )
}

export default Project

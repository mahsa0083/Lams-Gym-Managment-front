import { useEffect, useState, useCallback } from 'react'
import { Arrow } from './Arrow'
import TaskItem from './TaskItem'
import { handleTaskBySVGMouseEvent } from './utils/bar'
import { isKeyboardEvent } from './utils/others'
import classNames from '@/utils/classNames'
import type {
    HandlerEventOption,
    BarTask,
    BarMoveAction,
    GanttContentMoveAction,
    GanttEvent,
    CustomBarContent,
} from './types'
import type { RefObject } from 'react'

export type TaskGanttContentProps<T> = {
    tasks: BarTask<T>[]
    dates: Date[]
    ganttEvent: GanttEvent<T>
    selectedTask: BarTask<T> | undefined
    rowHeight: number
    gridColumnsWidth: number
    timeStep: number
    svg?: RefObject<SVGSVGElement>
    svgWidth: number
    taskHeight: number
    arrowClass: string
    arrowIndent: number
    rtl: boolean
    setGanttEvent: (value: GanttEvent<T>) => void
    setFailedTask: (value: BarTask<T> | null) => void
    setSelectedEvent: (taskId: string) => void
    customBarContent?: CustomBarContent<T>
} & HandlerEventOption<T>

const TaskGanttContent = <T extends object>({
    tasks,
    dates,
    ganttEvent,
    selectedTask,
    rowHeight,
    gridColumnsWidth,
    timeStep,
    svg,
    taskHeight,
    arrowClass,
    arrowIndent,
    rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedEvent,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    customBarContent,
}: TaskGanttContentProps<T>) => {
    const point = svg?.current?.createSVGPoint()
    const [xStep, setXStep] = useState(0)
    const [initEventX1Delta, setInitEventX1Delta] = useState(0)
    const [isMoving, setIsMoving] = useState(false)

    useEffect(() => {
        const dateDelta =
            dates[1].getTime() -
            dates[0].getTime() -
            dates[1].getTimezoneOffset() * 60 * 1000 +
            dates[0].getTimezoneOffset() * 60 * 1000
        const newXStep = (timeStep * gridColumnsWidth) / dateDelta
        setXStep(newXStep)
    }, [gridColumnsWidth, dates, timeStep])

    const handleMouseMove = useCallback(
        async (event: MouseEvent) => {
            if (!ganttEvent.changedTask || !point || !svg?.current) return
            event.preventDefault()

            point.x = event.clientX
            const cursor = point.matrixTransform(
                svg?.current.getScreenCTM()?.inverse(),
            )

            const { isChanged, changedTask } = handleTaskBySVGMouseEvent(
                cursor.x,
                ganttEvent.action as BarMoveAction,
                ganttEvent.changedTask,
                xStep,
                timeStep,
                initEventX1Delta,
                rtl,
            )
            if (isChanged) {
                setGanttEvent({ action: ganttEvent.action, changedTask })
            }
        },
        [
            ganttEvent.changedTask,
            ganttEvent.action,
            point,
            svg,
            xStep,
            timeStep,
            initEventX1Delta,
            rtl,
            setGanttEvent,
        ],
    )

    const handleMouseUp = useCallback(
        async (event: MouseEvent) => {
            const { action, originalSelectedTask, changedTask } = ganttEvent
            if (
                !changedTask ||
                !point ||
                !svg?.current ||
                !originalSelectedTask
            )
                return
            event.preventDefault()

            point.x = event.clientX
            const cursor = point.matrixTransform(
                svg?.current.getScreenCTM()?.inverse(),
            )
            const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
                cursor.x,
                action as BarMoveAction,
                changedTask,
                xStep,
                timeStep,
                initEventX1Delta,
                rtl,
            )

            const isNotLikeOriginal =
                originalSelectedTask.start !== newChangedTask.start ||
                originalSelectedTask.end !== newChangedTask.end ||
                originalSelectedTask.progress !== newChangedTask.progress

            // remove listeners
            if (svg.current) {
                svg.current.removeEventListener('mousemove', handleMouseMove)
                svg.current.removeEventListener('mouseup', handleMouseUp)
            }
            setGanttEvent({ action: '' })
            setIsMoving(false)

            // custom operation start
            let operationSuccess = true
            if (
                (action === 'move' || action === 'end' || action === 'start') &&
                onDateChange &&
                isNotLikeOriginal
            ) {
                try {
                    const result = await onDateChange(
                        newChangedTask,
                        newChangedTask.barChildren,
                    )
                    if (result !== undefined) {
                        operationSuccess = result
                    }
                } catch (error) {
                    console.error(error)
                    operationSuccess = false
                }
            } else if (onProgressChange && isNotLikeOriginal) {
                try {
                    const result = await onProgressChange(
                        newChangedTask,
                        newChangedTask.barChildren,
                    )
                    if (result !== undefined) {
                        operationSuccess = result
                    }
                } catch (error) {
                    console.error(error)
                    operationSuccess = false
                }
            }

            // If operation is failed - return old state
            if (!operationSuccess) {
                setFailedTask(originalSelectedTask)
            }
        },
        [
            ganttEvent,
            point,
            svg,
            xStep,
            timeStep,
            initEventX1Delta,
            rtl,
            onDateChange,
            onProgressChange,
            setGanttEvent,
            setIsMoving,
            setFailedTask,
            handleMouseMove,
        ],
    )

    useEffect(() => {
        if (
            !isMoving &&
            (ganttEvent.action === 'move' ||
                ganttEvent.action === 'end' ||
                ganttEvent.action === 'start' ||
                ganttEvent.action === 'progress') &&
            svg?.current
        ) {
            svg.current.addEventListener('mousemove', handleMouseMove)
            svg.current.addEventListener('mouseup', handleMouseUp)
            setIsMoving(true)
        }
    }, [ganttEvent.action, isMoving, svg, handleMouseMove, handleMouseUp])

    /**
     * Method is Start point of task change
     */
    const handleBarEventStart = async (
        action: GanttContentMoveAction,
        task: BarTask<T>,
        event?: React.MouseEvent | React.KeyboardEvent,
    ) => {
        if (!event) {
            if (action === 'select') {
                setSelectedEvent(task.id)
            }
        }
        // Keyboard events
        else if (isKeyboardEvent(event)) {
            if (action === 'delete') {
                if (onDelete) {
                    try {
                        const result = await onDelete(task)
                        if (result !== undefined && result) {
                            setGanttEvent({ action, changedTask: task })
                        }
                    } catch (error) {
                        console.error('Error on Delete. ' + error)
                    }
                }
            }
        }
        // Mouse Events
        else if (action === 'mouseenter') {
            if (!ganttEvent.action) {
                setGanttEvent({
                    action,
                    changedTask: task,
                    originalSelectedTask: task,
                })
            }
        } else if (action === 'mouseleave') {
            if (ganttEvent.action === 'mouseenter') {
                setGanttEvent({ action: '' })
            }
        } else if (action === 'dblclick') {
            if (onDoubleClick) {
                onDoubleClick(task)
            }
        } else if (action === 'click') {
            if (onClick) {
                onClick(task)
            }
        }
        // Change task event start
        else if (action === 'move') {
            if (!svg?.current || !point) return
            point.x = event.clientX
            const cursor = point.matrixTransform(
                svg.current.getScreenCTM()?.inverse(),
            )
            setInitEventX1Delta(cursor.x - task.x1)
            setGanttEvent({
                action,
                changedTask: task,
                originalSelectedTask: task,
            })
        } else {
            setGanttEvent({
                action,
                changedTask: task,
                originalSelectedTask: task,
            })
        }
    }

    return (
        <g className="content">
            <g
                className={classNames(
                    'gantt-arrows stroke-gray-300 fill-gray-300 dark:stroke-gray-600 dark:fill-gray-600',
                    arrowClass,
                )}
            >
                {tasks.map((task) => {
                    return task.barChildren.map((child) => {
                        return (
                            <Arrow<T>
                                key={`Arrow from ${task.id} to ${tasks[child.index].id}`}
                                taskFrom={task}
                                taskTo={tasks[child.index]}
                                rowHeight={rowHeight}
                                taskHeight={taskHeight}
                                arrowIndent={arrowIndent}
                                rtl={rtl}
                            />
                        )
                    })
                })}
            </g>
            <g className="bar">
                {tasks.map((task) => {
                    return (
                        <TaskItem<T>
                            task={task}
                            arrowIndent={arrowIndent}
                            taskHeight={taskHeight}
                            isProgressChangeable={
                                !!onProgressChange && !task.isDisabled
                            }
                            isDateChangeable={
                                !!onDateChange && !task.isDisabled
                            }
                            isDelete={!task.isDisabled}
                            onEventStart={handleBarEventStart}
                            key={task.id}
                            isSelected={
                                !!selectedTask && task.id === selectedTask.id
                            }
                            customBarContent={customBarContent}
                            rtl={rtl}
                        />
                    )
                })}
            </g>
        </g>
    )
}

export default TaskGanttContent

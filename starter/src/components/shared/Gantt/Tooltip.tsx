import { useRef, useEffect, useState } from 'react'
import classNames from '@/utils/classNames'
import type { Task, BarTask } from './types'
import dayjs from 'dayjs'

const formatDateRange = (start: Date, end: Date): string => {
    return `${dayjs(start).format('DD MMM')} - ${dayjs(end).format('DD MMM')}`
}

const calculateDuration = (start: Date, end: Date): number => {
    return dayjs(end).diff(dayjs(start), 'day')
}

export type TooltipProps<T = object> = {
    task: BarTask<T>
    arrowIndent: number
    rtl: boolean
    svgContainerHeight: number
    svgContainerWidth: number
    svgWidth: number
    headerHeight: number
    taskListWidth: number
    scrollX: number
    scrollY: number
    rowHeight: number
    TooltipContent: React.FC<{
        task: Task<T>
    }>
}
export const Tooltip = <T extends object = object>({
    task,
    rowHeight,
    rtl,
    svgContainerHeight,
    svgContainerWidth,
    scrollX,
    scrollY,
    arrowIndent,
    headerHeight,
    taskListWidth,
    TooltipContent,
}: TooltipProps<T>) => {
    const tooltipRef = useRef<HTMLDivElement | null>(null)
    const [relatedY, setRelatedY] = useState(0)
    const [relatedX, setRelatedX] = useState(0)
    useEffect(() => {
        if (tooltipRef.current) {
            const tooltipHeight = tooltipRef.current.offsetHeight * 1.1
            const tooltipWidth = tooltipRef.current.offsetWidth * 1.1

            let newRelatedY = task.index * rowHeight - scrollY + headerHeight
            let newRelatedX: number
            if (rtl) {
                newRelatedX =
                    task.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX
                if (newRelatedX < 0) {
                    newRelatedX = task.x2 + arrowIndent * 1.5 - scrollX
                }
                const tooltipLeftmostPoint = tooltipWidth + newRelatedX
                if (tooltipLeftmostPoint > svgContainerWidth) {
                    newRelatedX = svgContainerWidth - tooltipWidth
                    newRelatedY += rowHeight
                }
            } else {
                newRelatedX =
                    task.x2 + arrowIndent * 1.5 + taskListWidth - scrollX
                const tooltipLeftmostPoint = tooltipWidth + newRelatedX
                const fullChartWidth = taskListWidth + svgContainerWidth
                if (tooltipLeftmostPoint > fullChartWidth) {
                    newRelatedX =
                        task.x1 +
                        taskListWidth -
                        arrowIndent * 1.5 -
                        scrollX -
                        tooltipWidth
                }
                if (newRelatedX < taskListWidth) {
                    newRelatedX =
                        svgContainerWidth + taskListWidth - tooltipWidth
                    newRelatedY += rowHeight
                }
            }

            const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY
            if (tooltipLowerPoint > svgContainerHeight - scrollY) {
                newRelatedY = svgContainerHeight - tooltipHeight
            }
            setRelatedY(newRelatedY)
            setRelatedX(newRelatedX)
        }
    }, [
        tooltipRef,
        task,
        arrowIndent,
        scrollX,
        scrollY,
        headerHeight,
        taskListWidth,
        rowHeight,
        svgContainerHeight,
        svgContainerWidth,
        rtl,
    ])

    return (
        <div
            ref={tooltipRef}
            className={classNames(
                'gantt-tooltip-details-container absolute pointer-events-none flex',
                relatedX ? 'flex-shrink-0 select-none' : 'invisible',
            )}
            style={{ left: relatedX, top: relatedY }}
        >
            <TooltipContent task={task} />
        </div>
    )
}

export const StandardTooltipContent = <T extends object = object>({
    task,
}: {
    task: Task<T>
}) => {
    return (
        <div className="gantt-tooltip-default-container rounded-lg bg-white dark:bg-gray-900 ring-0 shadow-md border border-gray-200 dark:border-gray-800 p-4">
            <div className="heading-text font-medium">
                {task.name}: {formatDateRange(task.start, task.end)}
            </div>
            <div className="mt-2">
                {task.end.getTime() - task.start.getTime() !== 0 && (
                    <p className="tooltipDefaultContainerParagraph text-xs mb-1.5">
                        Duration: {calculateDuration(task.start, task.end)}{' '}
                        day(s)
                    </p>
                )}

                <p className="tooltipDefaultContainerParagraph text-xs mb-1.5">
                    {!!task.progress && `Progress: ${task.progress} %`}
                </p>
            </div>
        </div>
    )
}

import { addToDate } from './utils/date'
import classNames from '@/utils/classNames'
import type { ReactElement } from 'react'
import type { Task } from './types'

export type GridProps = {
    tasks: Task[]
    dates: Date[]
    svgWidth: number
    rowHeight: number
    gridColumnsWidth: number
    todayColor: string
    rtl: boolean
    isDragging?: boolean
    onBackgroundMouseDown?: (event: React.MouseEvent) => void
}
const Grid = ({
    tasks,
    dates,
    rowHeight,
    svgWidth,
    gridColumnsWidth,
    todayColor,
    rtl,
    isDragging = false,
    onBackgroundMouseDown,
}: GridProps) => {
    let y = 0
    const gridRows: ReactElement[] = []
    const rowLines: ReactElement[] = [
        <line
            key="RowLineFirst"
            x="0"
            y1={0}
            x2={svgWidth}
            y2={0}
            className="gantt-grid-row-line stroke-2 stroke-gray-200 dark:stroke-gray-700"
        />,
    ]
    for (const task of tasks) {
        gridRows.push(
            <rect
                key={'Row' + task.id}
                x="0"
                y={y}
                width={svgWidth}
                height={rowHeight}
                className={classNames(
                    'gantt-grid-row fill-transparent',
                    isDragging ? 'cursor-grabbing' : 'cursor-grab',
                )}
                onMouseDown={onBackgroundMouseDown}
            />,
        )
        rowLines.push(
            <line
                key={'RowLine' + task.id}
                x="0"
                y1={y + rowHeight}
                x2={svgWidth}
                y2={y + rowHeight}
                className="gantt-grid-row-line stroke-transparent"
            />,
        )
        y += rowHeight
    }

    const now = new Date()
    let tickX = 0
    const ticks: ReactElement[] = []
    let today: ReactElement = <rect />
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        ticks.push(
            <line
                key={date.getTime()}
                x1={tickX}
                y1={0}
                x2={tickX}
                y2={y}
                className={classNames(
                    'grid-tick stroke-gray-200 dark:stroke-gray-700',
                    isDragging ? 'cursor-grabbing' : 'cursor-grab',
                    i === 0 && 'hidden',
                )}
                onMouseDown={onBackgroundMouseDown}
            />,
        )
        if (
            (i + 1 !== dates.length &&
                date.getTime() < now.getTime() &&
                dates[i + 1].getTime() >= now.getTime()) ||
            (i !== 0 &&
                i + 1 === dates.length &&
                date.getTime() < now.getTime() &&
                addToDate(
                    date,
                    date.getTime() - dates[i - 1].getTime(),
                    'millisecond',
                ).getTime() >= now.getTime())
        ) {
            today = (
                <rect
                    x={tickX}
                    y={0}
                    width={gridColumnsWidth}
                    height={y}
                    fill={todayColor}
                />
            )
        }
        if (
            rtl &&
            i + 1 !== dates.length &&
            date.getTime() >= now.getTime() &&
            dates[i + 1].getTime() < now.getTime()
        ) {
            today = (
                <rect
                    x={tickX + gridColumnsWidth}
                    y={0}
                    width={gridColumnsWidth}
                    height={y}
                    fill={todayColor}
                />
            )
        }
        tickX += gridColumnsWidth
    }
    // Add final grid line at the end
    ticks.push(
        <line
            key="final-tick"
            x1={tickX}
            y1={0}
            x2={tickX}
            y2={y}
            className={classNames(
                'grid-tick stroke-gray-200 dark:stroke-gray-700',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onMouseDown={onBackgroundMouseDown}
        />,
    )
    return (
        <g className="gantt-grid">
            <g
                className={classNames(
                    'gantt-grid-body',
                    isDragging ? 'cursor-grabbing' : 'cursor-grab',
                )}
                onMouseDown={onBackgroundMouseDown}
            >
                <g className="gantt-rows">{gridRows}</g>
                <g className="gantt-row-lines">{rowLines}</g>
                <g className="gantt-ticks">{ticks}</g>
                <g className="gantt-today">{today}</g>
            </g>
        </g>
    )
}

export default Grid

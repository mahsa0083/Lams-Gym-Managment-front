import { useRef, useEffect, useState, useCallback } from 'react'
import Grid from './Grid'

import Calendar from './Calendar'
import TaskGanttContent from './TaskGanttContent'

import type { GridProps } from './Grid'
import type { CalendarProps } from './Calendar'
import type { TaskGanttContentProps } from './TaskGanttContent'
import type { CustomBarContent } from './types'

export type TaskGanttProps<T> = {
    gridProps: GridProps
    calendarProps: CalendarProps
    barProps: TaskGanttContentProps<T>
    ganttHeight: number
    scrollY: number
    scrollX: number
    customBarContent?: CustomBarContent<T>
    onScrollChange?: (scrollX: number, scrollY: number) => void
    maxScrollX?: number
    maxScrollY?: number
}

const TaskGantt = <T extends object>({
    gridProps,
    calendarProps,
    barProps,
    ganttHeight,
    scrollY,
    scrollX,
    customBarContent,
    onScrollChange,
    maxScrollX = 0,
    maxScrollY = 0,
}: TaskGanttProps<T>) => {
    const ganttSVGRef = useRef<SVGSVGElement>(null!)
    const horizontalContainerRef = useRef<HTMLDivElement>(null)
    const verticalGanttContainerRef = useRef<HTMLDivElement>(null)
    const newBarProps = { ...barProps, svg: ganttSVGRef }

    // Simple drag state
    const [isDragging, setIsDragging] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

    // Simple grid background detection
    const isGridBackground = (event: React.MouseEvent): boolean => {
        const target = event.target as SVGElement
        if (!target) return false

        const isGridRow = target.classList.contains('gantt-grid-row')
        const isGridBody = target.classList.contains('gantt-grid-body')
        const isGridTick = target.classList.contains('grid-tick')
        const isSVGElement = target.tagName === 'svg'

        return isGridRow || isGridBody || isGridTick || isSVGElement
    }

    // Mouse down handler
    const handleMouseDown = (event: React.MouseEvent) => {
        if (!isGridBackground(event)) return

        event.preventDefault()
        setIsDragging(true)
        setLastMousePos({ x: event.clientX, y: event.clientY })
        document.body.style.userSelect = 'none'
    }

    // Mouse move handler
    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (!isDragging) return

            const deltaX = lastMousePos.x - event.clientX
            const deltaY = lastMousePos.y - event.clientY

            const newScrollX = Math.max(
                0,
                Math.min(maxScrollX, scrollX + deltaX),
            )
            const newScrollY = Math.max(
                0,
                Math.min(maxScrollY, scrollY + deltaY),
            )

            onScrollChange?.(newScrollX, newScrollY)
            setLastMousePos({ x: event.clientX, y: event.clientY })
        },
        [
            isDragging,
            lastMousePos.x,
            lastMousePos.y,
            maxScrollX,
            maxScrollY,
            onScrollChange,
            scrollX,
            scrollY,
        ],
    )

    // Mouse up handler
    const handleMouseUp = () => {
        setIsDragging(false)
        document.body.style.userSelect = ''
    }

    useEffect(() => {
        if (horizontalContainerRef.current) {
            horizontalContainerRef.current.scrollTop = scrollY
        }
    }, [scrollY])

    useEffect(() => {
        if (verticalGanttContainerRef.current) {
            verticalGanttContainerRef.current.scrollLeft = scrollX
        }
    }, [scrollX])

    // Event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [
        isDragging,
        lastMousePos.x,
        lastMousePos.y,
        scrollX,
        scrollY,
        maxScrollX,
        maxScrollY,
        onScrollChange,
        handleMouseMove,
    ])

    return (
        <div
            className="gantt-vertical-container lg:overflow-hidden text-[0] m-0 p-0"
            ref={verticalGanttContainerRef}
            dir="ltr"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={gridProps.svgWidth}
                height={calendarProps.headerHeight}
            >
                <Calendar {...calendarProps} />
            </svg>
            <div
                ref={horizontalContainerRef}
                className="gantt-horizontal-container m-0 p-0 overflow-hidden"
                style={
                    ganttHeight
                        ? { height: ganttHeight, width: gridProps.svgWidth }
                        : { width: gridProps.svgWidth }
                }
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={gridProps.svgWidth}
                    height={barProps.rowHeight * barProps.tasks.length}
                    ref={ganttSVGRef}
                    onMouseDown={handleMouseDown}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <Grid
                        {...gridProps}
                        isDragging={isDragging}
                        onBackgroundMouseDown={handleMouseDown}
                    />
                    <TaskGanttContent<T>
                        {...newBarProps}
                        customBarContent={customBarContent}
                    />
                </svg>
            </div>
        </div>
    )
}

export default TaskGantt

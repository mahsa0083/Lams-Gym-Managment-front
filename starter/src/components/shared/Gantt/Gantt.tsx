import { useState, useRef, useEffect, useMemo } from 'react'
import { StandardTooltipContent, Tooltip } from './Tooltip'
import VerticalScroll from './VerticalScroll'
import EventList from './EventList'
import TaskGantt from './TaskGantt'
import { convertToBarTasks } from './utils/bar'
import HorizontalScroll from './HorizontalScroll'
import { removeHiddenTasks, sortTasks } from './utils/others'
import { ganttDateRange, seedDates } from './utils/date'
import { ViewMode } from './constants'
import type { CalendarProps } from './Calendar'
import type { GridProps } from './Grid'
import type { TaskGanttContentProps } from './TaskGanttContent'
import type { EventListProps } from './EventList'
import type { GanttProps, Task, BarTask, GanttEvent, DateSetup } from './types'
import type { SyntheticEvent } from 'react'

const Gantt = <T extends object>({
    tasks,
    columns = [],
    customBarContent,
    headerHeight = 70,
    gridColumnsWidth = 100,
    rowHeight = 50,
    ganttHeight = 0,
    viewMode = ViewMode.Day,
    preStepsCount = 1,
    locale = 'en-GB',
    barFill = 60,
    barCornerRadius = 4,
    barProgressClass = 'fill-primary',
    barWrapperClass = 'fill-[#b8c2cc]',
    projectProgressClass = 'fill-primary',
    projectWrapperClass = 'fill-[#b8c2cc]',
    milestoneClass = 'fill-primary',
    rtl = false,
    handleWidth = 8,
    timeStep = 300000,
    arrowClass = 'grey',
    arrowIndent = 20,
    todayColor = '#fafafa',
    viewDate,
    TooltipContent = StandardTooltipContent,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    onSelect,
    onExpanderClick,
}: GanttProps<T>) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const taskListRef = useRef<HTMLDivElement>(null)
    const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
        const [startDate, endDate] = ganttDateRange(
            tasks,
            viewMode,
            preStepsCount,
        )
        return { viewMode, dates: seedDates(startDate, endDate, viewMode) }
    })
    const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
        undefined,
    )

    const [taskListWidth, setTaskListWidth] = useState(0)
    const [svgContainerWidth, setSvgContainerWidth] = useState(0)
    const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight)
    const [barTasks, setBarTasks] = useState<BarTask<T>[]>([])
    const [filteredTasks, setFilteredTasks] = useState<Task<T>[]>([])
    const [ganttEvent, setGanttEvent] = useState<GanttEvent<T>>({
        action: '',
    })
    const taskHeight = useMemo(
        () => (rowHeight * barFill) / 100,
        [rowHeight, barFill],
    )

    const [selectedTask, setSelectedEvent] = useState<BarTask<T>>()
    const [failedTask, setFailedTask] = useState<BarTask<T> | null>(null)

    const svgWidth = dateSetup.dates.length * gridColumnsWidth
    const ganttFullHeight = barTasks.length * rowHeight

    const [scrollY, setScrollY] = useState(0)
    const [scrollX, setScrollX] = useState(-1)
    const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false)

    // task change events
    useEffect(() => {
        let filteredTasks: Task<T>[]
        if (onExpanderClick) {
            filteredTasks = removeHiddenTasks(tasks)
        } else {
            filteredTasks = tasks
        }
        filteredTasks = filteredTasks.sort(sortTasks)
        const [startDate, endDate] = ganttDateRange(
            filteredTasks,
            viewMode,
            preStepsCount,
        )
        let newDates = seedDates(startDate, endDate, viewMode)
        if (rtl) {
            newDates = newDates.reverse()
        }
        setDateSetup({ dates: newDates, viewMode })
        setFilteredTasks(filteredTasks)
        setBarTasks(
            convertToBarTasks<T>(
                filteredTasks,
                {
                    dates: newDates,
                    columnWidth: gridColumnsWidth,
                    rowHeight,
                    taskHeight,
                    barCornerRadius,
                    handleWidth,
                    rtl,
                },
                {
                    barProgressClass,
                    barWrapperClass,
                    projectProgressClass,
                    projectWrapperClass,
                    milestoneClass,
                },
            ),
        )
    }, [
        tasks,
        viewMode,
        preStepsCount,
        rowHeight,
        barCornerRadius,
        gridColumnsWidth,
        taskHeight,
        handleWidth,
        barProgressClass,
        barWrapperClass,
        projectProgressClass,
        projectWrapperClass,
        milestoneClass,
        rtl,
        onExpanderClick,
    ])

    useEffect(() => {
        if (
            viewMode === dateSetup.viewMode &&
            ((viewDate && !currentViewDate) ||
                (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
        ) {
            const dates = dateSetup.dates
            const index = dates.findIndex(
                (d, i) =>
                    viewDate.valueOf() >= d.valueOf() &&
                    i + 1 !== dates.length &&
                    viewDate.valueOf() < dates[i + 1].valueOf(),
            )
            if (index === -1) {
                return
            }
            setCurrentViewDate(viewDate)
            setScrollX(gridColumnsWidth * index)
        }
    }, [
        viewDate,
        gridColumnsWidth,
        dateSetup.dates,
        dateSetup.viewMode,
        viewMode,
        currentViewDate,
        setCurrentViewDate,
    ])

    useEffect(() => {
        const { changedTask, action } = ganttEvent
        if (changedTask) {
            if (action === 'delete') {
                setGanttEvent({ action: '' })
                setBarTasks(barTasks.filter((t) => t.id !== changedTask.id))
            } else if (
                action === 'move' ||
                action === 'end' ||
                action === 'start' ||
                action === 'progress'
            ) {
                const prevStateTask = barTasks.find(
                    (t) => t.id === changedTask.id,
                )
                if (
                    prevStateTask &&
                    (prevStateTask.start.getTime() !==
                        changedTask.start.getTime() ||
                        prevStateTask.end.getTime() !==
                            changedTask.end.getTime() ||
                        prevStateTask.progress !== changedTask.progress)
                ) {
                    // actions for change
                    const newTaskList = barTasks.map((t) =>
                        t.id === changedTask.id ? changedTask : t,
                    )
                    setBarTasks(newTaskList)
                }
            }
        }
    }, [ganttEvent, barTasks])

    useEffect(() => {
        if (failedTask) {
            setBarTasks(
                barTasks.map((t) => (t.id !== failedTask.id ? t : failedTask)),
            )
            setFailedTask(null)
        }
    }, [failedTask, barTasks])

    useEffect(() => {
        if (columns === null) {
            setTaskListWidth(0)
        }
        if (taskListRef.current) {
            setTaskListWidth(taskListRef.current.offsetWidth)
        }
    }, [taskListRef, columns])

    useEffect(() => {
        if (wrapperRef.current) {
            setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth)
        }
    }, [wrapperRef, taskListWidth])

    useEffect(() => {
        if (ganttHeight) {
            setSvgContainerHeight(ganttHeight + headerHeight)
        } else {
            setSvgContainerHeight(tasks.length * rowHeight + headerHeight)
        }
    }, [ganttHeight, tasks, headerHeight, rowHeight])

    // scroll events
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (event.shiftKey || event.deltaX) {
                let scrollMove = event.deltaX ? event.deltaX : event.deltaY
                if (rtl && event.deltaX) {
                    scrollMove = -scrollMove
                }
                let newScrollX = scrollX + scrollMove
                if (newScrollX < 0) {
                    newScrollX = 0
                } else if (newScrollX > svgWidth) {
                    newScrollX = svgWidth
                }
                setScrollX(newScrollX)
                event.preventDefault()
            } else if (ganttHeight) {
                let newScrollY = scrollY + event.deltaY
                if (newScrollY < 0) {
                    newScrollY = 0
                } else if (newScrollY > ganttFullHeight - ganttHeight) {
                    newScrollY = ganttFullHeight - ganttHeight
                }
                if (newScrollY !== scrollY) {
                    setScrollY(newScrollY)
                    event.preventDefault()
                }
            }

            setIgnoreScrollEvent(true)
        }

        // subscribe if scroll is necessary
        wrapperRef.current?.addEventListener('wheel', handleWheel, {
            passive: false,
        })
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            wrapperRef.current?.removeEventListener('wheel', handleWheel)
        }
    }, [
        wrapperRef,
        scrollY,
        scrollX,
        ganttHeight,
        svgWidth,
        rtl,
        ganttFullHeight,
    ])

    const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
        if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
            setScrollY(event.currentTarget.scrollTop)
            setIgnoreScrollEvent(true)
        } else {
            setIgnoreScrollEvent(false)
        }
    }

    const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
        const newScrollX = Math.abs(event.currentTarget.scrollLeft)
        if (scrollX !== newScrollX) {
            setScrollX(newScrollX)
            setIgnoreScrollEvent(true)
        } else {
            setIgnoreScrollEvent(false)
        }
    }

    /**
     * Handles arrow keys events and transform it to new scroll
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault()
        let newScrollY = scrollY
        let newScrollX = scrollX
        let isX = true
        switch (event.key) {
            case 'Down': // IE/Edge specific value
            case 'ArrowDown':
                newScrollY += rowHeight
                isX = false
                break
            case 'Up': // IE/Edge specific value
            case 'ArrowUp':
                newScrollY -= rowHeight
                isX = false
                break
            case 'Left':
            case 'ArrowLeft':
                if (rtl) {
                    newScrollX += gridColumnsWidth
                } else {
                    newScrollX -= gridColumnsWidth
                }
                break
            case 'Right': // IE/Edge specific value
            case 'ArrowRight':
                if (rtl) {
                    newScrollX -= gridColumnsWidth
                } else {
                    newScrollX += gridColumnsWidth
                }
                break
        }
        if (isX) {
            if (newScrollX < 0) {
                newScrollX = 0
            } else if (newScrollX > svgWidth) {
                newScrollX = svgWidth
            }
            setScrollX(newScrollX)
        } else {
            if (newScrollY < 0) {
                newScrollY = 0
            } else if (newScrollY > ganttFullHeight - ganttHeight) {
                newScrollY = ganttFullHeight - ganttHeight
            }
            setScrollY(newScrollY)
        }
        setIgnoreScrollEvent(true)
    }

    /**
     * Task select event
     */
    const handleSelectedTask = (taskId: string) => {
        const newSelectedTask = barTasks.find((t) => t.id === taskId)
        const oldSelectedTask = barTasks.find(
            (t) => !!selectedTask && t.id === selectedTask.id,
        )
        if (onSelect) {
            if (oldSelectedTask) {
                onSelect(oldSelectedTask as unknown as Task<T>, false)
            }
            if (newSelectedTask) {
                onSelect(newSelectedTask as unknown as Task<T>, true)
            }
        }
        setSelectedEvent(newSelectedTask)
    }
    const handleExpanderClick = (task: Task<T>) => {
        if (onExpanderClick && task.hideChildren !== undefined) {
            onExpanderClick({ ...task, hideChildren: !task.hideChildren })
        }
    }
    const gridProps: GridProps = {
        gridColumnsWidth,
        svgWidth,
        tasks: tasks,
        rowHeight,
        dates: dateSetup.dates,
        todayColor,
        rtl,
    }
    const calendarProps: CalendarProps = {
        dateSetup,
        locale,
        viewMode,
        headerHeight,
        gridColumnsWidth,
        rtl,
    }
    const barProps: TaskGanttContentProps<T> = {
        tasks: barTasks,
        dates: dateSetup.dates,
        ganttEvent,
        selectedTask,
        rowHeight,
        taskHeight,
        gridColumnsWidth,
        arrowClass,
        timeStep,
        arrowIndent,
        svgWidth,
        rtl,
        setGanttEvent,
        setFailedTask,
        setSelectedEvent: handleSelectedTask,
        onDateChange: (task: Task<T>, children: Task<T>[]) => {
            onDateChange?.(task, children)
        },
        onProgressChange,
        onDoubleClick,
        onClick,
        onDelete,
    }

    const tableProps: EventListProps<T> = {
        rowHeight,
        tasks: filteredTasks,
        locale,
        headerHeight,
        scrollY,
        ganttHeight,
        horizontalContainerClass: 'gantt-horizontal-container',
        selectedTask,
        taskListRef,
        setSelectedEvent: handleSelectedTask,
        onExpanderClick: handleExpanderClick,
        ...(columns && columns?.length > 0 && { columns }),
    }

    const maxScroll = svgWidth - svgContainerWidth
    const displayedScrollX = rtl ? maxScroll - scrollX : scrollX

    return (
        <div className="overflow-x-auto lg:overflow-x-hidden overflow-y-hidden">
            <div
                className="gantt-wrapper flex p-0 m-0 list-none outline-none relative lg:overflow-x-hidden"
                onKeyDown={handleKeyDown}
                tabIndex={0}
                ref={wrapperRef}
            >
                {columns && <EventList {...tableProps} />}
                <TaskGantt
                    gridProps={gridProps}
                    calendarProps={calendarProps}
                    barProps={barProps}
                    ganttHeight={ganttHeight}
                    scrollY={scrollY}
                    scrollX={displayedScrollX}
                    customBarContent={customBarContent}
                    onScrollChange={(newScrollX, newScrollY) => {
                        const logicalX = rtl
                            ? maxScroll - newScrollX
                            : newScrollX
                        setScrollX(logicalX)
                        setScrollY(newScrollY)
                        setIgnoreScrollEvent(true)
                    }}
                    maxScrollX={svgWidth}
                    maxScrollY={ganttFullHeight - ganttHeight}
                />
                {ganttEvent.changedTask && (
                    <Tooltip<T>
                        arrowIndent={arrowIndent}
                        rowHeight={rowHeight}
                        svgContainerHeight={svgContainerHeight}
                        svgContainerWidth={svgContainerWidth}
                        scrollX={displayedScrollX}
                        scrollY={scrollY}
                        task={ganttEvent.changedTask}
                        headerHeight={headerHeight}
                        taskListWidth={taskListWidth}
                        TooltipContent={TooltipContent}
                        rtl={rtl}
                        svgWidth={svgWidth}
                    />
                )}
                <VerticalScroll
                    ganttFullHeight={ganttFullHeight}
                    ganttHeight={ganttHeight}
                    headerHeight={headerHeight}
                    scroll={scrollY}
                    onScroll={handleScrollY}
                    rtl={rtl}
                />
            </div>
            <HorizontalScroll
                svgWidth={svgWidth}
                taskListWidth={taskListWidth}
                scroll={scrollX}
                rtl={rtl}
                onScroll={handleScrollX}
            />
        </div>
    )
}

export default Gantt

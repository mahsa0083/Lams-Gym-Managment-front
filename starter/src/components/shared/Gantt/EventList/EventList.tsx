import { useEffect, useRef } from 'react'
import EventListHeader from './EventListHeader'
import EventListTable from './EventListTable'
import classNames from '@/utils/classNames'
import type { Task, BarTask, Columns } from '../types'
import type { Ref } from 'react'

export type EventListProps<T> = {
    headerHeight: number
    rowHeight: number
    ganttHeight: number
    scrollY: number
    locale: string
    tasks: Task<T>[]
    taskListRef: Ref<HTMLDivElement>
    horizontalContainerClass?: string
    selectedTask: BarTask | undefined
    setSelectedEvent: (task: string) => void
    onExpanderClick: (task: Task<T>) => void
    columns?: Columns<T>[]
}

const EventList = <T,>({
    headerHeight,
    columns,
    rowHeight,
    scrollY,
    tasks,
    selectedTask,
    setSelectedEvent,
    onExpanderClick,
    locale,
    ganttHeight,
    taskListRef,
    horizontalContainerClass,
}: EventListProps<T>) => {
    const horizontalContainerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (horizontalContainerRef.current) {
            horizontalContainerRef.current.scrollTop = scrollY
        }
    }, [scrollY])

    const headerProps = {
        headerHeight,
        columns,
    }
    const selectedEventId = selectedTask ? selectedTask.id : ''
    const tableProps = {
        rowHeight,
        tasks,
        locale,
        selectedEventId: selectedEventId,
        setSelectedEvent,
        onExpanderClick,
        columns,
    }

    return (
        <div ref={taskListRef}>
            <EventListHeader<T> {...headerProps} />
            <div
                ref={horizontalContainerRef}
                className={classNames(horizontalContainerClass)}
                style={ganttHeight ? { height: ganttHeight } : {}}
            >
                <EventListTable<T> {...tableProps} />
            </div>
        </div>
    )
}

export default EventList

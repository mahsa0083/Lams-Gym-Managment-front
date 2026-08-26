import { useMemo } from 'react'
import EventBullet from '../EventBullet'
import DroppableArea from '../DropableArea'
import { isToday, isSunday, isSameDay } from '../utils'
import {
    DAY_NUMBER_HEIGHT,
    DAY_NUMBER_HEIGHT_GAP,
    OVERFLOW_COUNT_HEIGHT,
    CELL_VERTICAL_GAP,
} from '../constant'
import classNames from '@/utils/classNames'
import type { CalendarCell, FullCalendarEvent, CallbackProps } from '../types'

export type BaseDayCellProps = {
    maxVisibleEvents?: number
    onEventClick?: (event: FullCalendarEvent) => void
    onMoreClick?: (
        overflowedEvents: FullCalendarEvent[],
        allEvents: FullCalendarEvent[],
    ) => void
} & Pick<CallbackProps, 'onCellClick'>

type DayCellProps = BaseDayCellProps & {
    cell: CalendarCell
    singleDayEvents: FullCalendarEvent[]
    multiDayEvents: FullCalendarEvent[]
    eventPositions: Record<string, number>
    rowHeight: number
}

const DayCell = ({
    cell,
    singleDayEvents,
    multiDayEvents,
    eventPositions,
    rowHeight,
    maxVisibleEvents = 5,
    onCellClick,
    onEventClick,
    onMoreClick,
}: DayCellProps) => {
    const { day, currentMonth, date } = cell

    const cellEvents = useMemo(() => {
        const cellSingleDayEvents = singleDayEvents.filter((event) =>
            isSameDay(new Date(event.startDate), date),
        )

        const cellMultiDayEvents = multiDayEvents.filter((event) => {
            const eventStart = new Date(event.startDate)
            const eventEnd = new Date(event.endDate)
            return date >= eventStart && date <= eventEnd
        })

        return [...cellSingleDayEvents, ...cellMultiDayEvents]
    }, [singleDayEvents, multiDayEvents, date])

    const eventsWithPositions = cellEvents.filter(
        (event) => eventPositions[event.id] !== undefined,
    )

    const overflowCount = Math.max(
        0,
        cellEvents.length - eventsWithPositions.length,
    )

    const overflowedEvents = cellEvents.filter(
        (event) => eventPositions[event.id] === undefined,
    )

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onMoreClick) {
            onMoreClick(overflowedEvents, cellEvents)
        }
    }

    const dynamicHeight = rowHeight

    return (
        <div
            className={classNames(
                'flex flex-col gap-1 border-l border-t relative border-gray-200 dark:border-gray-700',
                isSunday(date) && 'border-l-0',
            )}
            style={{ height: `${dynamicHeight}px` }}
            onClick={() => onCellClick?.(date)}
        >
            <DroppableArea
                date={date}
                className="w-full h-full"
                style={{
                    paddingTop: CELL_VERTICAL_GAP,
                    paddingBottom: CELL_VERTICAL_GAP,
                }}
            >
                <div
                    className={classNames(
                        'text-xs font-medium relative z-30 inline-flex justify-center items-center',
                        !currentMonth && 'opacity-40',
                        isToday(date)
                            ? 'flex translate-x-1 rounded-full bg-primary px-0 text-white'
                            : 'heading-text',
                    )}
                    style={{
                        minHeight: `${DAY_NUMBER_HEIGHT - DAY_NUMBER_HEIGHT_GAP}px`,
                        width: `${DAY_NUMBER_HEIGHT - DAY_NUMBER_HEIGHT_GAP}px`,
                    }}
                >
                    {day}
                </div>
                <div className="lg:hidden flex gap-1 px-2 mt-2">
                    {cellEvents.slice(0, maxVisibleEvents).map((event) => (
                        <EventBullet
                            key={event.id}
                            color={event.color}
                            event={event}
                            onEventClick={onEventClick}
                        />
                    ))}
                </div>
                {overflowCount > 0 && (
                    <button
                        className={classNames(
                            'absolute bottom-1 left-1 right-1 z-40',
                            onMoreClick &&
                                'hover:opacity-80 transition-opacity',
                        )}
                        style={{ height: OVERFLOW_COUNT_HEIGHT }}
                        onClick={onMoreClick ? handleMoreClick : undefined}
                        disabled={!onMoreClick}
                    >
                        <div className="text-xs text-center bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded px-1 py-0.5 border">
                            +{overflowCount} more
                        </div>
                    </button>
                )}
            </DroppableArea>
        </div>
    )
}

export default DayCell

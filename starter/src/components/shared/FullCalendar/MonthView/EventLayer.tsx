import DraggableEvent from '../DraggableEvent'
import classNames from '@/utils/classNames'
import { isSameDay, getColorClasses, formatTime } from '../utils'
import useFullCalendar from '../hooks/useFullCalendar'
import useFullCalendarDnd from '../hooks/useFullCalendarDnd'
import {
    EVENT_HEIGHT,
    DAY_NUMBER_HEIGHT,
    EVENT_GAP,
    CELL_VERTICAL_GAP,
} from '../constant'
import type {
    FullCalendarEvent,
    CalendarCell,
    EventRenderResult,
} from '../types'

type EventLayerProps = {
    multiDayEvents: FullCalendarEvent[]
    singleDayEvents: FullCalendarEvent[]
    cells: CalendarCell[]
    eventPositions: Record<string, number>
    getRowHeight: (rowIndex: number) => number
    maxVisibleEvents?: number
    onEventClick?: (event: FullCalendarEvent) => void
    renderEvent?: (props: { event: FullCalendarEvent }) => EventRenderResult
}

const EventLayer = ({
    multiDayEvents,
    singleDayEvents,
    cells,
    eventPositions,
    getRowHeight,
    maxVisibleEvents = 5,
    onEventClick,
    renderEvent,
}: EventLayerProps) => {
    const { use24HourFormat } = useFullCalendar()
    const { isDragging, draggedEvent } = useFullCalendarDnd()

    const handleEventClick = (
        event: FullCalendarEvent,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation()
        if (onEventClick && !isDragging && !event.disabled) {
            onEventClick(event)
        }
    }

    const getEventContent = (
        event: FullCalendarEvent,
        isFirstSegment: boolean,
        eventStart: Date,
    ) => {
        if (renderEvent) {
            const customRender = renderEvent({ event })
            return {
                content: customRender.content,
                customClassName: customRender.className,
            }
        }

        // Default rendering
        return {
            content: (
                <div className="flex items-center gap-1.5 truncate">
                    <p className="flex-1 truncate font-semibold">
                        {event.title}
                        {isFirstSegment && (
                            <span className="ml-1 font-normal">
                                {formatTime(eventStart, use24HourFormat)}
                            </span>
                        )}
                    </p>
                </div>
            ),
            customClassName: undefined,
        }
    }

    const renderMultiDayEvent = (event: FullCalendarEvent) => {
        const eventStart = new Date(event.startDate)
        const eventEnd = new Date(event.endDate)
        const position = eventPositions[event.id]

        // Don't render events that don't have a position or exceed the visible limit
        if (position === undefined || position >= maxVisibleEvents) {
            return null
        }

        const startCellIndex = cells.findIndex((cell) =>
            isSameDay(cell.date, eventStart),
        )
        const endCellIndex = cells.findIndex((cell) =>
            isSameDay(cell.date, eventEnd),
        )

        // Handle events that extend beyond the calendar view
        let actualStartIndex = startCellIndex
        let actualEndIndex = endCellIndex

        // If event starts before the calendar view, start from the first cell
        if (startCellIndex === -1 && eventStart < cells[0].date) {
            actualStartIndex = 0
        }

        // If event ends after the calendar view, end at the last cell
        if (endCellIndex === -1 && eventEnd > cells[cells.length - 1].date) {
            actualEndIndex = cells.length - 1
        }

        // Only skip rendering if the event doesn't intersect with the calendar view at all
        if (actualStartIndex === -1 && actualEndIndex === -1) return null
        if (actualStartIndex === -1 || actualEndIndex === -1) return null

        const startRow = Math.floor(actualStartIndex / 7)
        const endRow = Math.floor(actualEndIndex / 7)

        const segments = []

        for (let row = startRow; row <= endRow; row++) {
            const rowStartIndex = row * 7
            const rowEndIndex = Math.min((row + 1) * 7 - 1, cells.length - 1)

            const segmentStartIndex = Math.max(actualStartIndex, rowStartIndex)
            const segmentEndIndex = Math.min(actualEndIndex, rowEndIndex)

            if (segmentStartIndex <= segmentEndIndex) {
                const startCol = segmentStartIndex % 7
                const colSpan = segmentEndIndex - segmentStartIndex + 1

                const isFirstSegment = segmentStartIndex === actualStartIndex
                const isLastSegment = segmentEndIndex === actualEndIndex

                let borderRadius = ''
                if (isFirstSegment && isLastSegment) {
                    borderRadius = 'rounded-md'
                } else if (isFirstSegment) {
                    borderRadius = 'rounded-l-md'
                } else if (isLastSegment) {
                    borderRadius = 'rounded-r-md'
                }

                const color = event.color

                // Calculate cumulative height of all previous rows
                let cumulativeHeight = 0
                for (let i = 0; i < row; i++) {
                    cumulativeHeight += getRowHeight(i)
                }

                const shouldShowContent =
                    isFirstSegment || (row > startRow && startCol === 0)
                const { content, customClassName } = shouldShowContent
                    ? getEventContent(event, isFirstSegment, eventStart)
                    : { content: null, customClassName: undefined }

                segments.push(
                    <DraggableEvent key={`${event.id}-${row}`} event={event}>
                        <div
                            className={classNames(
                                'absolute mx-1 flex items-center justify-between gap-1.5 truncate whitespace-nowrap border px-2 text-xs select-none z-20 cursor-pointer',
                                'hover:z-30', // Bring to front on hover for better interaction
                                // Only disable pointer events for OTHER events when something is being dragged
                                // Keep pointer events for the event being dragged itself
                                isDragging && draggedEvent?.id !== event.id
                                    ? 'pointer-events-none'
                                    : 'pointer-events-auto',
                                !customClassName && getColorClasses(color).bar,
                                borderRadius,
                                customClassName,
                            )}
                            style={{
                                height: EVENT_HEIGHT,
                                left: `${(startCol / 7) * 100}%`,
                                width: `calc(${(colSpan / 7) * 100}% - 8px)`,
                                top: `${cumulativeHeight + CELL_VERTICAL_GAP + DAY_NUMBER_HEIGHT + position * (EVENT_HEIGHT + EVENT_GAP)}px`,
                            }}
                            onClick={(e) => handleEventClick(event, e)}
                        >
                            {content}
                        </div>
                    </DraggableEvent>,
                )
            }
        }

        return segments
    }

    const renderSingleDayEvent = (event: FullCalendarEvent) => {
        const eventDate = new Date(event.startDate)
        const position = eventPositions[event.id]

        // Don't render events that don't have a position or exceed the visible limit
        if (position === undefined || position >= maxVisibleEvents) {
            return null
        }

        const cellIndex = cells.findIndex((cell) =>
            isSameDay(cell.date, eventDate),
        )
        if (cellIndex === -1) return null

        const row = Math.floor(cellIndex / 7)
        const col = cellIndex % 7
        const color = event.color

        // Calculate cumulative height of all previous rows
        let cumulativeHeight = 0
        for (let i = 0; i < row; i++) {
            cumulativeHeight += getRowHeight(i)
        }

        const { content, customClassName } = getEventContent(
            event,
            true,
            eventDate,
        )

        return (
            <DraggableEvent key={event.id} event={event}>
                <div
                    className={classNames(
                        'absolute mx-1 flex items-center justify-between gap-1.5 truncate whitespace-nowrap border px-2 text-xs select-none z-10 rounded-md cursor-pointer',
                        'hover:z-30', // Bring to front on hover for better interaction
                        // Only disable pointer events for OTHER events when something is being dragged
                        // Keep pointer events for the event being dragged itself
                        isDragging && draggedEvent?.id !== event.id
                            ? 'pointer-events-none'
                            : 'pointer-events-auto',
                        !customClassName && getColorClasses(color).bar,
                        customClassName,
                    )}
                    style={{
                        height: EVENT_HEIGHT,
                        left: `${(col / 7) * 100}%`,
                        width: `calc(${(1 / 7) * 100}% - 8px)`,
                        top: `${cumulativeHeight + CELL_VERTICAL_GAP + DAY_NUMBER_HEIGHT + position * (EVENT_HEIGHT + EVENT_GAP)}px`,
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                >
                    {content}
                </div>
            </DraggableEvent>
        )
    }

    return (
        <div className="absolute inset-0 pointer-events-none">
            {multiDayEvents.map(renderMultiDayEvent)}
            {singleDayEvents.map(renderSingleDayEvent)}
        </div>
    )
}

export default EventLayer

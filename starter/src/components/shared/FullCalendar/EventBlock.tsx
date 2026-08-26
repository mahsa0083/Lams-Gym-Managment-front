import classNames from '@/utils/classNames'
import useFullCalendar from './hooks/useFullCalendar'
import DraggableEvent from './DraggableEvent'
import ResizableEvent from './ResizableEvent'
import { formatTime, differenceInMinutes, getColorClasses } from './utils'
import dayjs from 'dayjs'
import type { FullCalendarEvent, EventRenderResult } from './types'
import type { ComponentProps } from 'react'

type EventBlockProps = ComponentProps<'div'> & {
    event: FullCalendarEvent
    onEventClick?: (event: FullCalendarEvent) => void
    renderEvent?: (props: { event: FullCalendarEvent }) => EventRenderResult
}

function EventBlock({
    event,
    className,
    onEventClick,
    renderEvent,
}: EventBlockProps) {
    const { use24HourFormat } = useFullCalendar()

    const handleEventClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onEventClick && !event.disabled) {
            onEventClick(event)
        }
    }

    const start = dayjs(event.startDate).toDate()
    const end = dayjs(event.endDate).toDate()
    const durationInMinutes = differenceInMinutes(end, start)
    const heightInPixels = (durationInMinutes / 60) * 96 - 8

    // Get custom rendering if provided
    const customRender = renderEvent ? renderEvent({ event }) : null

    const calendarWeekEventCardClasses = classNames(
        'flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-offset-2 cursor-pointer',
        !renderEvent && getColorClasses(event.color).bar,
        durationInMinutes < 35 && 'py-0 justify-center',
        className,
        customRender?.className,
    )

    // Default content
    const defaultContent = (
        <>
            <div className="flex items-center gap-1.5 truncate">
                <p className="truncate font-medium">{event.title}</p>
            </div>
            {durationInMinutes > 25 && (
                <p>
                    {formatTime(start, use24HourFormat)} -{' '}
                    {formatTime(end, use24HourFormat)}
                </p>
            )}
        </>
    )

    return (
        <ResizableEvent event={event}>
            <DraggableEvent event={event}>
                <div
                    role="button"
                    tabIndex={0}
                    className={calendarWeekEventCardClasses}
                    style={{ height: `${heightInPixels}px` }}
                    onClick={handleEventClick}
                >
                    {customRender ? customRender.content : defaultContent}
                </div>
            </DraggableEvent>
        </ResizableEvent>
    )
}

export default EventBlock

import DraggableEvent from './DraggableEvent'
import classNames from '@/utils/classNames'
import {
    startOfDay,
    formatTime,
    endOfDay,
    isSameDay,
    getColorClasses,
} from './utils'
import useFullCalendar from './hooks/useFullCalendar'
import type { FullCalendarEvent } from './types'
import type { ComponentProps } from 'react'

type EventBadgeProps = ComponentProps<'div'> & {
    event: FullCalendarEvent
    cellDate: Date
    eventCurrentDay?: number
    eventTotalDays?: number
    className?: string
    position?: 'first' | 'middle' | 'last' | 'none'
}

const positionClasses = {
    first: 'relative z-10 mr-0 rounded-r-none border-r-0 [&>span]:mr-2.5',
    middle: 'relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0',
    last: 'ml-0 rounded-l-none border-l-0',
    none: '',
}

const EventBadge = ({
    event,
    cellDate,
    eventCurrentDay,
    eventTotalDays,
    className,
    position: propPosition,
}: EventBadgeProps) => {
    const { use24HourFormat } = useFullCalendar()

    const itemStart = startOfDay(event.startDate)
    const itemEnd = endOfDay(event.endDate)

    if (cellDate < itemStart || cellDate > itemEnd) return null

    let position: 'first' | 'middle' | 'last' | 'none' | undefined

    if (propPosition) {
        position = propPosition
    } else if (eventCurrentDay && eventTotalDays) {
        position = 'none'
    } else if (isSameDay(itemStart, itemEnd)) {
        position = 'none'
    } else if (isSameDay(cellDate, itemStart)) {
        position = 'first'
    } else if (isSameDay(cellDate, itemEnd)) {
        position = 'last'
    } else {
        position = 'middle'
    }

    const renderBadgeText = ['first', 'none'].includes(position)
    const renderBadgeTime = ['last', 'none'].includes(position)

    const color = event.color

    const eventBadgeClasses = classNames(
        'mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs',
        getColorClasses(color).bar,
        positionClasses[position],
        className,
    )
    return (
        <DraggableEvent event={event}>
            <div role="button" tabIndex={0} className={eventBadgeClasses}>
                <div className="flex items-center gap-1.5 truncate">
                    {renderBadgeText && (
                        <p className="flex-1 truncate font-semibold">
                            {eventCurrentDay && (
                                <span className="text-xs">
                                    Day {eventCurrentDay} of {eventTotalDays}{' '}
                                    •{' '}
                                </span>
                            )}
                            {event.title}
                        </p>
                    )}
                </div>

                <div className="hidden sm:block">
                    {renderBadgeTime && (
                        <span>
                            {formatTime(
                                new Date(event.startDate),
                                use24HourFormat,
                            )}
                        </span>
                    )}
                </div>
            </div>
        </DraggableEvent>
    )
}

export default EventBadge

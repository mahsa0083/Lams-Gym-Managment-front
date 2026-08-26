import { getEventBlockStyle, areIntervalsOverlapping } from './utils'
import type { FullCalendarEvent, EventRenderResult } from './types'
import EventBlock from './EventBlock'
import dayjs from 'dayjs'

type GroupedEventsProps = {
    groupedEvents: FullCalendarEvent[][]
    day: Date
    onEventClick?: (event: FullCalendarEvent) => void
    renderEvent?: (props: { event: FullCalendarEvent }) => EventRenderResult
}

function GroupedEvents({
    groupedEvents,
    day,
    onEventClick,
    renderEvent,
}: GroupedEventsProps) {
    return groupedEvents.map((group, groupIndex) =>
        group.map((event) => {
            let style = getEventBlockStyle(
                event,
                day,
                groupIndex,
                groupedEvents.length,
            )
            const hasOverlap = groupedEvents.some(
                (otherGroup, otherIndex) =>
                    otherIndex !== groupIndex &&
                    otherGroup.some((otherEvent) =>
                        areIntervalsOverlapping(
                            {
                                start: dayjs(event.startDate).toDate(),
                                end: dayjs(event.endDate).toDate(),
                            },
                            {
                                start: dayjs(otherEvent.startDate).toDate(),
                                end: dayjs(otherEvent.endDate).toDate(),
                            },
                        ),
                    ),
            )

            if (!hasOverlap) style = { ...style, width: '100%', left: '0%' }

            return (
                <div key={event.id} className="absolute p-1" style={style}>
                    <EventBlock
                        event={event}
                        onEventClick={onEventClick}
                        renderEvent={renderEvent}
                    />
                </div>
            )
        }),
    )
}

export default GroupedEvents

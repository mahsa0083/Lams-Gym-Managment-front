import {
    differenceInDays,
    endOfDay,
    isWithinInterval,
    startOfDay,
} from '../utils'
import EventBadge from '../EventBadge'
import dayjs from 'dayjs'
import type { ViewProps } from '../types'

type DayMultiDayEventsRowProps = Pick<ViewProps, 'multiDayEvents'> & {
    selectedDate: Date
}

const DayMultiDayEventsRow = ({
    selectedDate,
    multiDayEvents,
}: DayMultiDayEventsRowProps) => {
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

    const multiDayEventsInDay = multiDayEvents
        .filter((event) => {
            const eventStart = dayjs(event.startDate).toDate()
            const eventEnd = dayjs(event.endDate).toDate()

            return (
                isWithinInterval(dayStart, {
                    start: eventStart,
                    end: eventEnd,
                }) ||
                isWithinInterval(dayEnd, {
                    start: eventStart,
                    end: eventEnd,
                }) ||
                (eventStart <= dayStart && eventEnd >= dayEnd)
            )
        })
        .sort((a, b) => {
            const durationA = differenceInDays(
                dayjs(a.endDate).toDate(),
                dayjs(a.startDate).toDate(),
            )
            const durationB = differenceInDays(
                dayjs(b.endDate).toDate(),
                dayjs(b.startDate).toDate(),
            )
            return durationB - durationA
        })

    if (multiDayEventsInDay.length === 0) return null

    return (
        <div className="flex border-b">
            <div className="w-18"></div>
            <div className="flex flex-1 flex-col gap-1 border-l py-1">
                {multiDayEventsInDay.map((event) => {
                    const eventStart = startOfDay(
                        dayjs(event.startDate).toDate(),
                    )
                    const eventEnd = startOfDay(dayjs(event.endDate).toDate())
                    const currentDate = startOfDay(selectedDate)

                    const eventTotalDays =
                        differenceInDays(eventEnd, eventStart) + 1
                    const eventCurrentDay =
                        differenceInDays(currentDate, eventStart) + 1

                    return (
                        <EventBadge
                            key={event.id}
                            event={event}
                            cellDate={selectedDate}
                            eventCurrentDay={eventCurrentDay}
                            eventTotalDays={eventTotalDays}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default DayMultiDayEventsRow

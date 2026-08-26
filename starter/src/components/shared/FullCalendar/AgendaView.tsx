import useFullCalendar from './hooks/useFullCalendar'

import classNames from '@/utils/classNames'

import { getColorClasses, getEventsForMonth } from './utils'
import dayjs from 'dayjs'

const AgendaView = () => {
    const { events, use24HourFormat, selectedDate } = useFullCalendar()

    const monthEvents = getEventsForMonth(events, selectedDate)

    const agendaEvents = monthEvents.reduce(
        (groups, event) => {
            const key = dayjs(event.startDate).format('YYYY-MM-DD')
            if (!groups[key]) groups[key] = []
            groups[key].push(event)
            return groups
        },
        {} as Record<string, typeof monthEvents>,
    )

    const groupedAndSortedEvents = Object.entries(agendaEvents).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
    )

    const timeFormat = use24HourFormat ? 'HH:mm' : 'hh:mm A'

    return (
        <div className="py-4 h-[80vh] bg-transparent">
            <div className="max-h-max space-y-4 px-4">
                {groupedAndSortedEvents.map(([date, groupedEvents]) => (
                    <div key={date}>
                        <div className="font-medium mb-2">
                            {dayjs(date).format('ddd, MMMM DD, YYYY')}
                        </div>
                        {groupedEvents!.map((event) => (
                            <div
                                key={event.id}
                                className={classNames(
                                    'mb-2 p-4 border rounded-md data-[selected=true]:bg-bg transition-all data-[selected=true]:text-none hover:cursor-pointer',
                                    getColorClasses(event.color).bar,
                                )}
                            >
                                <div className="w-full flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <p className="font-medium">
                                                {event.title}
                                            </p>
                                            <p className="text-muted-foreground text-sm line-clamp-1 text-ellipsis md:text-clip w-1/3">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-40 flex justify-center items-center gap-1">
                                        <>
                                            <p>
                                                {dayjs(event.startDate).format(
                                                    timeFormat,
                                                )}
                                            </p>
                                            <span className="text-muted-foreground">
                                                -
                                            </span>
                                            <p>
                                                {dayjs(event.endDate).format(
                                                    timeFormat,
                                                )}
                                            </p>
                                        </>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AgendaView

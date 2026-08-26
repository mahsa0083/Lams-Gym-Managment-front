import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'
import YearView from './YearView'
import AgendaView from './AgendaView'
import useFullCalendar from './hooks/useFullCalendar'
import { isSameDay } from './utils'
import dayjs from 'dayjs'
import type { ViewCallbackProps } from './types'

type FullCalendarBodyProps = ViewCallbackProps

const FullCalendarBody = ({
    onCellClick,
    onEventClick,
    renderEvent,
    onMoreClick,
}: FullCalendarBodyProps) => {
    const { view, events } = useFullCalendar()

    const singleDayEvents = events.filter((event) => {
        const startDate = dayjs(event.startDate).toDate()
        const endDate = dayjs(event.endDate).toDate()
        return isSameDay(startDate, endDate)
    })

    const multiDayEvents = events.filter((event) => {
        const startDate = dayjs(event.startDate).toDate()
        const endDate = dayjs(event.endDate).toDate()
        return !isSameDay(startDate, endDate)
    })

    return (
        <div className="w-full h-full relative">
            {view === 'month' && (
                <MonthView
                    singleDayEvents={singleDayEvents}
                    multiDayEvents={multiDayEvents}
                    onCellClick={onCellClick}
                    onEventClick={onEventClick}
                    renderEvent={renderEvent}
                    onMoreClick={onMoreClick}
                />
            )}
            {view === 'week' && (
                <WeekView
                    singleDayEvents={singleDayEvents}
                    multiDayEvents={multiDayEvents}
                    onCellClick={onCellClick}
                    onEventClick={onEventClick}
                    renderEvent={renderEvent}
                />
            )}
            {view === 'day' && (
                <DayView
                    singleDayEvents={singleDayEvents}
                    multiDayEvents={multiDayEvents}
                    onCellClick={onCellClick}
                    onEventClick={onEventClick}
                    renderEvent={renderEvent}
                />
            )}
            {view === 'year' && (
                <YearView
                    singleDayEvents={singleDayEvents}
                    multiDayEvents={multiDayEvents}
                    onCellClick={onCellClick}
                    onEventClick={onEventClick}
                    renderEvent={renderEvent}
                />
            )}
            {view === 'agenda' && <AgendaView />}
        </div>
    )
}

export default FullCalendarBody

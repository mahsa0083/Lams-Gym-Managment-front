import EventBullet from './EventBullet'
import useFullCalendar from './hooks/useFullCalendar'
import classNames from '@/utils/classNames'
import { getYear, getCalendarCells, isSameDay, isSameMonth } from './utils'
import type { ViewProps } from './types'

type YearViewProps = ViewProps

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const YearView = ({
    singleDayEvents,
    multiDayEvents,
    onCellClick,
}: YearViewProps) => {
    const { selectedDate, setSelectedDate } = useFullCalendar()
    const currentYear = getYear(selectedDate)
    const allEvents = [...multiDayEvents, ...singleDayEvents]

    return (
        <div className="flex flex-col h-full  overflow-y-auto p-4  sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
                {MONTHS.map((month, monthIndex) => {
                    const monthDate = new Date(currentYear, monthIndex, 1)
                    const cells = getCalendarCells(monthDate)

                    return (
                        <div
                            key={month}
                            className="flex flex-col rounded-lg overflow-hidden"
                            aria-label={`${month} ${currentYear} calendar`}
                        >
                            {/* Month header */}
                            <button
                                className="px-3 py-2 text-center font-semibold heading-text"
                                onClick={() =>
                                    setSelectedDate(
                                        new Date(currentYear, monthIndex, 1),
                                    )
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setSelectedDate(
                                            new Date(
                                                currentYear,
                                                monthIndex,
                                                1,
                                            ),
                                        )
                                    }
                                }}
                                aria-label={`Select ${month}`}
                            >
                                {month}
                            </button>

                            <div className="grid grid-cols-7 text-center text-xs py-2">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="p-1 font-medium">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-0.5 p-1.5 flex-grow">
                                {cells.map((cell) => {
                                    const isCurrentMonth = isSameMonth(
                                        cell.date,
                                        monthDate,
                                    )
                                    const dayEvents = allEvents.filter(
                                        (event) =>
                                            isSameDay(
                                                new Date(event.startDate),
                                                cell.date,
                                            ),
                                    )

                                    const handleCellClick = () => {
                                        if (onCellClick && isCurrentMonth) {
                                            onCellClick(cell.date)
                                        }
                                    }

                                    return (
                                        <div
                                            key={cell.date.toISOString()}
                                            className={classNames(
                                                'flex flex-col items-center justify-start p-1 h-10 relative font-medium',
                                                isCurrentMonth &&
                                                    'heading-text',
                                            )}
                                        >
                                            <div className="w-full h-full flex flex-col items-center justify-start relative">
                                                <button
                                                    className={classNames(
                                                        'size-9 flex items-center justify-center font-medium hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-gray-300 rounded-lg',
                                                    )}
                                                    onClick={handleCellClick}
                                                >
                                                    {cell.day}
                                                </button>
                                                <div className="flex justify-center items-center gap-0.5 absolute -bottom-1">
                                                    {dayEvents.length <= 3 ? (
                                                        dayEvents
                                                            .slice(0, 3)
                                                            .map((event) => (
                                                                <EventBullet
                                                                    key={
                                                                        event.id
                                                                    }
                                                                    color={
                                                                        event.color
                                                                    }
                                                                    className="size-1.5"
                                                                />
                                                            ))
                                                    ) : (
                                                        <div className="flex flex-col justify-center items-center">
                                                            <EventBullet
                                                                color={
                                                                    dayEvents[0]
                                                                        .color
                                                                }
                                                                className="size-1.5"
                                                            />
                                                            <span className="text-[0.6rem]">
                                                                +
                                                                {dayEvents.length -
                                                                    1}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default YearView

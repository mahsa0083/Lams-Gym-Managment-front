import Scroll from '@/components/ui/Scroll'
import CalendarTimeline from '../CalendarTimeline'
import WeekMultiDayEventsRow from './WeekMultiDayEventsRow'
import GroupedEvents from '../GroupedEvents'
import DroppableArea from '../DropableArea'
import useFullCalendar from '../hooks/useFullCalendar'
import { addDays, startOfWeek, isSameDay, groupEvents } from '../utils'
import dayjs from 'dayjs'
import type { ViewProps } from '../types'

type WeekViewProps = ViewProps

const WeekView = ({
    singleDayEvents,
    multiDayEvents,
    onCellClick,
    onEventClick,
    renderEvent,
}: WeekViewProps) => {
    const { selectedDate, use24HourFormat } = useFullCalendar()

    const weekStart = startOfWeek(selectedDate)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
        <div className="flex-col sm:flex">
            <div>
                <WeekMultiDayEventsRow
                    selectedDate={selectedDate}
                    multiDayEvents={multiDayEvents}
                />

                <div className="relative z-20 flex border-b border-gray-200 dark:border-gray-700">
                    {/* Time column header - responsive width */}
                    <div className="w-18"></div>
                    <div className="grid flex-1 grid-cols-7 border-l border-gray-200 dark:border-gray-700">
                        {weekDays.map((day, index) => (
                            <span
                                key={index}
                                className="py-1 sm:py-2 text-center text-xs font-medium heading-text"
                            >
                                {/* Mobile: Show only day abbreviation and number */}
                                <span className="block sm:hidden">
                                    {dayjs(day).format('dd').charAt(0)}
                                    <span className="block font-semibold text-xs">
                                        {dayjs(day).format('d')}
                                    </span>
                                </span>
                                {/* Desktop: Show full format */}
                                <span className="hidden sm:inline">
                                    {dayjs(day).format('ddd')}{' '}
                                    <span className="ml-1 font-semibold">
                                        {dayjs(day).format('D')}
                                    </span>
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <Scroll className="h-[736px]" type="always" scrollbars="vertical">
                <div className="flex">
                    {/* Hours column */}
                    <div className="relative w-18">
                        {hours.map((hour, index) => (
                            <div
                                key={hour}
                                className="relative"
                                style={{ height: '96px' }}
                            >
                                <div className="absolute -top-3 right-2 flex h-6 items-center">
                                    {index !== 0 && (
                                        <span className="text-xs heading-text">
                                            {dayjs(
                                                new Date().setHours(
                                                    hour,
                                                    0,
                                                    0,
                                                    0,
                                                ),
                                            ).format(
                                                use24HourFormat
                                                    ? 'HH:00'
                                                    : 'h a',
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative flex-1 border-l border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-800">
                            {weekDays.map((day, dayIndex) => {
                                const dayEvents = singleDayEvents.filter(
                                    (event) =>
                                        isSameDay(
                                            dayjs(event.startDate).toDate(),
                                            day,
                                        ) ||
                                        isSameDay(
                                            dayjs(event.endDate).toDate(),
                                            day,
                                        ),
                                )
                                const groupedEvents = groupEvents(dayEvents)

                                return (
                                    <div key={dayIndex} className="relative">
                                        {hours.map((hour, index) => (
                                            <div
                                                key={hour}
                                                className="relative"
                                                style={{ height: '96px' }}
                                            >
                                                {index !== 0 && (
                                                    <div className="pointer-events-none absolute inset-x-0 top-0 border-b border-gray-200 dark:border-gray-700"></div>
                                                )}

                                                <DroppableArea
                                                    date={day}
                                                    hour={hour}
                                                    minute={0}
                                                    className="absolute inset-x-0 top-0 h-[48px]"
                                                    onCellClick={onCellClick}
                                                >
                                                    <div className="absolute inset-0" />
                                                </DroppableArea>

                                                <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-gray-200 dark:border-gray-700 border-dashed"></div>

                                                <DroppableArea
                                                    date={day}
                                                    hour={hour}
                                                    minute={30}
                                                    className="absolute inset-x-0 bottom-0 h-[48px]"
                                                    onCellClick={onCellClick}
                                                >
                                                    <div className="absolute inset-0" />
                                                </DroppableArea>
                                            </div>
                                        ))}

                                        <GroupedEvents
                                            groupedEvents={groupedEvents}
                                            day={day}
                                            onEventClick={onEventClick}
                                            renderEvent={renderEvent}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        <CalendarTimeline />
                    </div>
                </div>
            </Scroll>
        </div>
    )
}

export default WeekView

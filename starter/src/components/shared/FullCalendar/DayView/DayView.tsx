import { useEffect, useRef } from 'react'
import CalendarDayPicker from '@/components/ui/Calendar'
import Scroll from '@/components/ui/Scroll'
import DroppableArea from '../DropableArea'
import CalendarTimeline from '../CalendarTimeline'
import DayMultiDayEventsRow from './DayMultiDayEventsRow'
import GroupedEvents from '../GroupedEvents'
import useFullCalendar from '../hooks/useFullCalendar'
import { groupEvents, isWithinInterval } from '../utils'
import dayjs from 'dayjs'
import { LuCalendar, LuClock } from 'react-icons/lu'
import type { FullCalendarEvent, ViewProps } from '../types'

type DayViewProps = ViewProps

const DayView = ({
    singleDayEvents,
    multiDayEvents,
    onCellClick,
    onEventClick,
    renderEvent,
}: DayViewProps) => {
    const { selectedDate, setSelectedDate, use24HourFormat } = useFullCalendar()
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const hours = Array.from({ length: 24 }, (_, i) => i)

    useEffect(() => {
        const handleDragOver = (e: DragEvent) => {
            if (!scrollAreaRef.current) return

            const scrollArea = scrollAreaRef.current
            const rect = scrollArea.getBoundingClientRect()
            const scrollSpeed = 15

            const scrollContainer =
                scrollArea.querySelector('[data-radix-scroll-area-viewport]') ||
                scrollArea

            if (e.clientY < rect.top + 60) {
                scrollContainer.scrollTop -= scrollSpeed
            }

            if (e.clientY > rect.bottom - 60) {
                scrollContainer.scrollTop += scrollSpeed
            }
        }

        document.addEventListener('dragover', handleDragOver)
        return () => {
            document.removeEventListener('dragover', handleDragOver)
        }
    }, [])

    const getCurrentEvents = (events: FullCalendarEvent[]) => {
        const now = new Date()

        return (
            events.filter((event) =>
                isWithinInterval(now, {
                    start: dayjs(event.startDate).toDate(),
                    end: dayjs(event.endDate).toDate(),
                }),
            ) || []
        )
    }

    const currentEvents = getCurrentEvents(singleDayEvents)

    const dayEvents = singleDayEvents.filter((event) => {
        const eventDate = dayjs(event.startDate).toDate()
        return (
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear()
        )
    })

    const groupedEvents = groupEvents(dayEvents)

    return (
        <div className="flex">
            <div className="flex flex-1 flex-col">
                <div>
                    <DayMultiDayEventsRow
                        selectedDate={selectedDate}
                        multiDayEvents={multiDayEvents}
                    />

                    <div className="relative z-20 flex border-b border-gray-200 dark:border-gray-700">
                        <div className="w-18"></div>
                        <span className="flex-1 border-l py-2 text-center text-xs font-medium border-gray-200 dark:border-gray-800">
                            {dayjs(selectedDate).format('DD')}{' '}
                            <span className="font-semibold">
                                {dayjs(selectedDate).format('ddd')}
                            </span>
                        </span>
                    </div>
                </div>
                <Scroll
                    className="h-[800px]"
                    scrollbars="vertical"
                    type="always"
                    ref={scrollAreaRef}
                >
                    <div className="flex">
                        <div className="relative w-18">
                            {hours.map((hour, index) => (
                                <div key={hour} className="relative h-[96px]">
                                    <div className="absolute -top-3 right-2 flex h-6 items-center font-medium">
                                        {index !== 0 && (
                                            <span className="text-xs">
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
                                                        : 'hh:00 A',
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative flex-1 border-l border-gray-200 dark:border-gray-700">
                            <div className="relative">
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
                                            date={selectedDate}
                                            hour={hour}
                                            minute={0}
                                            className="absolute inset-x-0 top-0 h-[48px]"
                                            onCellClick={onCellClick}
                                        >
                                            <div className="absolute inset-0" />
                                        </DroppableArea>

                                        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-gray-200 dark:border-gray-800 border-dashed"></div>

                                        <DroppableArea
                                            date={selectedDate}
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
                                    day={selectedDate}
                                    onEventClick={onEventClick}
                                    renderEvent={renderEvent}
                                />
                            </div>

                            <CalendarTimeline />
                        </div>
                    </div>
                </Scroll>
            </div>

            <div className="hidden w-72 divide-y border-l md:block divide-gray-200 dark:divide-gray-800 border-gray-200 dark:border-gray-800">
                <div className="py-4">
                    <CalendarDayPicker
                        className="mx-auto w-fit"
                        value={selectedDate}
                        onChange={(date) => date && setSelectedDate(date)}
                    />
                </div>

                <div className="flex-1 space-y-3">
                    {currentEvents.length > 0 && (
                        <div className="flex items-start gap-2 px-4 pt-4">
                            <span className="relative mt-[5px] flex size-2.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex size-2.5 rounded-full bg-success"></span>
                            </span>

                            <p className="font-semibold">Happening now</p>
                        </div>
                    )}
                    {currentEvents.length > 0 && (
                        <Scroll.FlexSize
                            className="px-4 h-full"
                            scrollbars="vertical"
                            type="always"
                        >
                            <div className="space-y-6 pb-4">
                                {currentEvents.map((event) => {
                                    return (
                                        <div
                                            key={event.id}
                                            className="space-y-1.5"
                                        >
                                            <p className="line-clamp-2 font-semibold">
                                                {event.title}
                                            </p>

                                            <div className="flex items-center gap-1.5">
                                                <LuCalendar className="size-4" />
                                                <span>
                                                    {dayjs(
                                                        new Date(
                                                            event.startDate,
                                                        ),
                                                    ).format('MMM d, yyyy')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <LuClock className="size-4" />
                                                <span>
                                                    {dayjs(
                                                        dayjs(
                                                            event.startDate,
                                                        ).toDate(),
                                                    ).format(
                                                        use24HourFormat
                                                            ? 'HH:mm'
                                                            : 'hh:mm a',
                                                    )}{' '}
                                                    -
                                                    {dayjs(
                                                        dayjs(event.endDate),
                                                    ).format(
                                                        use24HourFormat
                                                            ? 'HH:mm'
                                                            : 'hh:mm a',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Scroll.FlexSize>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DayView

import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

import type { CalendarView, FullCalendarEvent, CalendarCell } from './types'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const isAfter = (
    date1: Date | string,
    date2: Date | string,
): boolean => {
    return dayjs(date1).isAfter(dayjs(date2))
}

export const isBefore = (
    date1: Date | string,
    date2: Date | string,
): boolean => {
    return dayjs(date1).isBefore(dayjs(date2))
}

export const addMinutes = (date: Date | string, amount: number): Date => {
    return dayjs(date).add(amount, 'minute').toDate()
}

export const addDays = (date: Date | string, amount: number): Date => {
    return dayjs(date).add(amount, 'day').toDate()
}

export const addWeeks = (date: Date | string, amount: number): Date => {
    return dayjs(date).add(amount, 'week').toDate()
}

export const addMonths = (date: Date | string, amount: number): Date => {
    return dayjs(date).add(amount, 'month').toDate()
}

export const addYears = (date: Date | string, amount: number): Date => {
    return dayjs(date).add(amount, 'year').toDate()
}

export const subDays = (date: Date | string, amount: number): Date => {
    return dayjs(date).subtract(amount, 'day').toDate()
}

export const subWeeks = (date: Date | string, amount: number): Date => {
    return dayjs(date).subtract(amount, 'week').toDate()
}

export const subMonths = (date: Date | string, amount: number): Date => {
    return dayjs(date).subtract(amount, 'month').toDate()
}

export const subYears = (date: Date | string, amount: number): Date => {
    return dayjs(date).subtract(amount, 'year').toDate()
}

export const isToday = (date: Date | string): boolean => {
    return dayjs(date).isSame(dayjs(), 'day')
}

export const isSunday = (date: Date | string): boolean => {
    return dayjs(date).day() === 0
}

export const startOfDay = (date: Date | string): Date => {
    return dayjs(date).startOf('day').toDate()
}

export const startOfWeek = (
    date: Date | string,
    options?: { weekStartsOn?: number },
): Date => {
    const weekStartsOn = options?.weekStartsOn ?? 0
    return dayjs(date).startOf('week').add(weekStartsOn, 'day').toDate()
}

export const startOfMonth = (date: Date | string): Date => {
    return dayjs(date).startOf('month').toDate()
}

export const endOfDay = (date: Date | string): Date => {
    return dayjs(date).endOf('day').toDate()
}

export const endOfWeek = (
    date: Date | string,
    options?: { weekStartsOn?: number },
): Date => {
    const weekStartsOn = options?.weekStartsOn ?? 0
    return dayjs(date).endOf('week').add(weekStartsOn, 'day').toDate()
}

export const endOfMonth = (date: Date | string): Date => {
    return dayjs(date).endOf('month').toDate()
}

export const isSameDay = (
    date1: Date | string,
    date2: Date | string,
): boolean => {
    return dayjs(date1).isSame(dayjs(date2), 'day')
}

export const isSameWeek = (
    date1: Date | string,
    date2: Date | string,
): boolean => {
    return dayjs(date1).isSame(dayjs(date2), 'week')
}

export const isSameMonth = (
    date1: Date | string,
    date2: Date | string,
): boolean => {
    return dayjs(date1).isSame(dayjs(date2), 'month')
}

export const formatTime = (
    date: Date | string,
    use24HourFormat: boolean,
): string => {
    const parsedDate = dayjs(date)
    if (!parsedDate.isValid()) return ''
    return parsedDate.format(use24HourFormat ? 'HH:mm' : 'h:mm A')
}

export const getYear = (date: Date | string): number => {
    return dayjs(date).year()
}

export const eachDayOfInterval = (interval: {
    start: Date | string
    end: Date | string
}): Date[] => {
    const start = dayjs(interval.start)
    const end = dayjs(interval.end)
    const days: Date[] = []

    let current = start
    while (current.isSameOrBefore(end, 'day')) {
        days.push(current.toDate())
        current = current.add(1, 'day')
    }

    return days
}

export const differenceInMinutes = (
    dateLeft: Date | string,
    dateRight: Date | string,
): number => {
    return dayjs(dateLeft).diff(dayjs(dateRight), 'minute')
}

export const differenceInDays = (
    dateLeft: Date | string,
    dateRight: Date | string,
): number => {
    return dayjs(dateLeft).diff(dayjs(dateRight), 'day')
}

export const areIntervalsOverlapping = (
    interval1: { start: Date | string; end: Date | string },
    interval2: { start: Date | string; end: Date | string },
): boolean => {
    const start1 = dayjs(interval1.start)
    const end1 = dayjs(interval1.end)
    const start2 = dayjs(interval2.start)
    const end2 = dayjs(interval2.end)

    return start1.isBefore(end2) && start2.isBefore(end1)
}

export const isWithinInterval = (
    date: Date | string,
    interval: { start: Date | string; end: Date | string },
): boolean => {
    const checkDate = dayjs(date)
    const start = dayjs(interval.start)
    const end = dayjs(interval.end)

    return checkDate.isSameOrAfter(start) && checkDate.isSameOrBefore(end)
}

export function navigateDate(
    date: Date,
    view: CalendarView,
    direction: 'previous' | 'next',
): Date {
    const operations: Record<CalendarView, (d: Date, n: number) => Date> = {
        month: direction === 'next' ? addMonths : subMonths,
        week: direction === 'next' ? addWeeks : subWeeks,
        day: direction === 'next' ? addDays : subDays,
        year: direction === 'next' ? addYears : subYears,
        agenda: direction === 'next' ? addMonths : subMonths,
    }

    return operations[view](date, 1)
}

export function getMonthCellEvents(
    date: Date,
    events: FullCalendarEvent[],
    eventPositions: Record<string, number>,
) {
    const dayStart = startOfDay(date)
    const eventsForDate = events.filter((event) => {
        const eventStart = dayjs(event.startDate).toDate()
        const eventEnd = dayjs(event.endDate).toDate()
        return (
            (dayStart >= eventStart && dayStart <= eventEnd) ||
            isSameDay(dayStart, eventStart) ||
            isSameDay(dayStart, eventEnd)
        )
    })

    return eventsForDate
        .map((event) => ({
            ...event,
            position: eventPositions[event.id] ?? -1,
            isMultiDay: event.startDate !== event.endDate,
        }))
        .sort((a, b) => {
            if (a.isMultiDay && !b.isMultiDay) return -1
            if (!a.isMultiDay && b.isMultiDay) return 1
            return a.position - b.position
        })
}

export function getCalendarCells(selectedDate: Date): CalendarCell[] {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const daysInMonth = endOfMonth(selectedDate).getDate() // Faster than new Date(year, month + 1, 0)
    const firstDayOfMonth = startOfMonth(selectedDate).getDay()
    const daysInPrevMonth = endOfMonth(new Date(year, month - 1)).getDate()
    const totalDays = firstDayOfMonth + daysInMonth

    const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
        day: daysInPrevMonth - firstDayOfMonth + i + 1,
        currentMonth: false,
        date: new Date(
            year,
            month - 1,
            daysInPrevMonth - firstDayOfMonth + i + 1,
        ),
    }))

    const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        currentMonth: true,
        date: new Date(year, month, i + 1),
    }))

    const nextMonthCells = Array.from(
        { length: (7 - (totalDays % 7)) % 7 },
        (_, i) => ({
            day: i + 1,
            currentMonth: false,
            date: new Date(year, month + 1, i + 1),
        }),
    )

    return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells]
}

export function calculateMonthEventPositions(
    multiDayEvents: FullCalendarEvent[],
    singleDayEvents: FullCalendarEvent[],
    selectedDate: Date,
    maxVisibleEvents: number = 5,
): Record<string, number> {
    const eventPositions: Record<string, number> = {}
    const occupiedPositions: Record<string, boolean[]> = {}

    // Get all calendar cells (including previous/next month days)
    const calendarCells = getCalendarCells(selectedDate)

    // Create occupied positions for ALL calendar cells, not just current month
    calendarCells.forEach((cell) => {
        const dayKey = startOfDay(cell.date).toISOString()
        occupiedPositions[dayKey] = new Array(maxVisibleEvents).fill(false)
    })

    const sortedEvents = [
        ...multiDayEvents.sort((a, b) => {
            const aDuration = differenceInDays(
                dayjs(a.endDate).toDate(),
                dayjs(a.startDate).toDate(),
            )
            const bDuration = differenceInDays(
                dayjs(b.endDate).toDate(),
                dayjs(b.startDate).toDate(),
            )
            return (
                bDuration - aDuration ||
                dayjs(a.startDate).toDate().getTime() -
                    dayjs(b.startDate).toDate().getTime()
            )
        }),
        ...singleDayEvents.sort(
            (a, b) =>
                dayjs(a.startDate).toDate().getTime() -
                dayjs(b.startDate).toDate().getTime(),
        ),
    ]

    sortedEvents.forEach((event) => {
        const eventStart = dayjs(event.startDate).toDate()
        const eventEnd = dayjs(event.endDate).toDate()

        // Get the full calendar range (including prev/next month days)
        const calendarStart = calendarCells[0].date
        const calendarEnd = calendarCells[calendarCells.length - 1].date

        // Only include days that are within the calendar view AND within the event range
        const eventDays = eachDayOfInterval({
            start: eventStart < calendarStart ? calendarStart : eventStart,
            end: eventEnd > calendarEnd ? calendarEnd : eventEnd,
        }).filter((day) => {
            // Only include days that are actually in the calendar cells
            return calendarCells.some((cell) =>
                dayjs(cell.date)
                    .startOf('day')
                    .isSame(dayjs(day).startOf('day')),
            )
        })

        let position = -1

        for (let i = 0; i < maxVisibleEvents; i++) {
            if (
                eventDays.every((day) => {
                    const dayPositions =
                        occupiedPositions[startOfDay(day).toISOString()]
                    return dayPositions && !dayPositions[i]
                })
            ) {
                position = i
                break
            }
        }

        if (position !== -1) {
            eventDays.forEach((day) => {
                const dayKey = startOfDay(day).toISOString()
                occupiedPositions[dayKey][position] = true
            })
            eventPositions[event.id] = position
        }
    })

    return eventPositions
}

export function groupEvents(
    dayEvents: FullCalendarEvent[],
): FullCalendarEvent[][] {
    const sortedEvents = dayEvents.sort(
        (a, b) =>
            dayjs(a.startDate).toDate().getTime() -
            dayjs(b.startDate).toDate().getTime(),
    )
    const groups: FullCalendarEvent[][] = []

    for (const event of sortedEvents) {
        const eventStart = dayjs(event.startDate).toDate()
        let placed = false

        for (const group of groups) {
            const lastEventInGroup = group[group.length - 1]
            const lastEventEnd = dayjs(lastEventInGroup.endDate).toDate()

            if (eventStart >= lastEventEnd) {
                group.push(event)
                placed = true
                break
            }
        }

        if (!placed) groups.push([event])
    }

    return groups
}

export const getEventsForMonth = (
    events: FullCalendarEvent[],
    date: Date,
): FullCalendarEvent[] => {
    const startOfMonthDate = startOfMonth(date)
    const endOfMonthDate = endOfMonth(date)

    return events.filter((event) => {
        const eventStart = dayjs(event.startDate).toDate()
        const eventEnd = dayjs(event.endDate).toDate()
        return (
            dayjs(eventStart).isValid() &&
            dayjs(eventEnd).isValid() &&
            eventStart <= endOfMonthDate &&
            eventEnd >= startOfMonthDate
        )
    })
}

export function getEventBlockStyle(
    event: FullCalendarEvent,
    day: Date,
    groupIndex: number,
    groupSize: number,
) {
    const startDate = dayjs(event.startDate).toDate()
    const dayStart = startOfDay(day)
    const eventStart = startDate < dayStart ? dayStart : startDate
    const startMinutes = differenceInMinutes(eventStart, dayStart)

    const top = (startMinutes / 1440) * 100 // 1440 minutes in a day
    const width = 100 / groupSize
    const left = groupIndex * width

    return { top: `${top}%`, width: `${width}%`, left: `${left}%` }
}

const colorsClasses: Record<string, Record<'bullet' | 'bar', string>> = {
    blue: {
        bullet: 'bg-blue-600 dark:bg-blue-500',
        bar: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    green: {
        bullet: 'bg-green-600 dark:bg-green-500',
        bar: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
    },
    red: {
        bullet: 'bg-red-600 dark:bg-red-500',
        bar: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
    },
    yellow: {
        bullet: 'bg-yellow-600 dark:bg-yellow-500',
        bar: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    },
    purple: {
        bullet: 'bg-purple-600 dark:bg-purple-500',
        bar: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    orange: {
        bullet: 'bg-orange-600 dark:bg-orange-500',
        bar: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300',
    },
    gray: {
        bullet: 'bg-gray-600 dark:bg-gray-500',
        bar: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300',
    },
}

export function getColorClasses(color: keyof typeof colorsClasses) {
    return colorsClasses[color] || colorsClasses.gray
}

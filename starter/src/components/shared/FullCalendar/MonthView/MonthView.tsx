import { useMemo } from 'react'
import dayjs from 'dayjs'
import DayCell from './DayCell'
import EventLayer from './EventLayer'
import useFullCalendar from '../hooks/useFullCalendar'
import {
    getCalendarCells,
    calculateMonthEventPositions,
    isSameDay,
} from '../utils'
import {
    EVENT_HEIGHT,
    EVENT_GAP,
    DAY_NUMBER_HEIGHT,
    MIN_CELL_HEIGHT,
    OVERFLOW_COUNT_HEIGHT,
} from '../constant'
import type { BaseDayCellProps } from './DayCell'
import type { ViewProps } from '../types'

type MonthViewProps = ViewProps & BaseDayCellProps

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MonthView = ({
    singleDayEvents,
    multiDayEvents,
    onCellClick,
    onEventClick,
    renderEvent,
    onMoreClick,
    maxVisibleEvents = 5,
    ...rest
}: MonthViewProps) => {
    const { selectedDate } = useFullCalendar()

    const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate])

    const eventPositions = calculateMonthEventPositions(
        multiDayEvents,
        singleDayEvents,
        selectedDate,
        maxVisibleEvents,
    )

    const getRowEventCount = (rowIndex: number) => {
        let maxPosition = 0
        const allEvents = [...multiDayEvents, ...singleDayEvents]

        allEvents.forEach((event) => {
            const position = eventPositions[event.id]
            if (position !== undefined) {
                const eventStart = dayjs(event.startDate).startOf('day')
                const eventEnd = dayjs(event.endDate).startOf('day')

                const rowStartIndex = rowIndex * 7
                const rowEndIndex = Math.min(
                    (rowIndex + 1) * 7 - 1,
                    cells.length - 1,
                )

                let eventAffectsThisRow = false
                for (
                    let cellIndex = rowStartIndex;
                    cellIndex <= rowEndIndex;
                    cellIndex++
                ) {
                    const cell = cells[cellIndex]
                    if (cell) {
                        const cellDay = dayjs(cell.date).startOf('day')
                        if (
                            cellDay.isSameOrAfter(eventStart) &&
                            cellDay.isSameOrBefore(eventEnd)
                        ) {
                            eventAffectsThisRow = true
                            break
                        }
                    }
                }

                if (eventAffectsThisRow) {
                    maxPosition = Math.max(maxPosition, position + 1)
                }
            }
        })

        return maxPosition
    }

    const getRowHeight = (rowIndex: number) => {
        const rowEventCount = getRowEventCount(rowIndex)

        const rowStartIndex = rowIndex * 7
        const rowEndIndex = Math.min((rowIndex + 1) * 7 - 1, cells.length - 1)

        let hasOverflow = false
        for (
            let cellIndex = rowStartIndex;
            cellIndex <= rowEndIndex;
            cellIndex++
        ) {
            const cell = cells[cellIndex]
            if (cell) {
                const cellSingleDayEvents = singleDayEvents.filter((event) =>
                    isSameDay(new Date(event.startDate), cell.date),
                )

                const cellMultiDayEvents = multiDayEvents.filter((event) => {
                    const eventStart = new Date(event.startDate)
                    const eventEnd = new Date(event.endDate)
                    return cell.date >= eventStart && cell.date <= eventEnd
                })

                const cellEvents = [
                    ...cellSingleDayEvents,
                    ...cellMultiDayEvents,
                ]

                const overflowCount = cellEvents.filter(
                    (event) => eventPositions[event.id] === undefined,
                ).length

                if (overflowCount > 0) {
                    hasOverflow = true
                    break
                }
            }
        }

        return Math.max(
            MIN_CELL_HEIGHT,
            DAY_NUMBER_HEIGHT +
                rowEventCount * (EVENT_HEIGHT + EVENT_GAP) +
                (hasOverflow ? OVERFLOW_COUNT_HEIGHT : 0) +
                20,
        )
    }

    return (
        <div>
            <div className="grid grid-cols-7">
                {WEEK_DAYS.map((day) => (
                    <div
                        key={day}
                        className="flex items-center justify-center py-2"
                    >
                        <span className="text-xs font-medium heading-text">
                            {day}
                        </span>
                    </div>
                ))}
            </div>

            <div className="relative">
                <div className="grid grid-cols-7 overflow-hidden">
                    {cells.map((cell, index) => {
                        const rowIndex = Math.floor(index / 7)
                        const rowHeight = getRowHeight(rowIndex)

                        return (
                            <DayCell
                                key={index}
                                cell={cell}
                                singleDayEvents={singleDayEvents}
                                multiDayEvents={multiDayEvents}
                                eventPositions={eventPositions}
                                rowHeight={rowHeight}
                                maxVisibleEvents={maxVisibleEvents}
                                onCellClick={onCellClick}
                                onEventClick={onEventClick}
                                onMoreClick={onMoreClick}
                                {...rest}
                            />
                        )
                    })}
                </div>

                {/* Absolutely positioned event layer for continuous bars */}
                <EventLayer
                    multiDayEvents={multiDayEvents}
                    singleDayEvents={singleDayEvents}
                    cells={cells}
                    eventPositions={eventPositions}
                    getRowHeight={getRowHeight}
                    maxVisibleEvents={maxVisibleEvents}
                    onEventClick={onEventClick}
                    renderEvent={renderEvent}
                />
            </div>
        </div>
    )
}

export default MonthView

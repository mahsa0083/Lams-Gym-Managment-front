import {
    getCachedDateTimeFormat,
    getDaysInMonth,
    getLocalDayOfWeek,
    getLocaleMonth,
    getWeekNumberISO8601,
} from './utils/date'
import { ViewMode } from './constants'
import type { DateSetup, ViewMode as ViewModeType } from './types'
import type { ReactElement } from 'react'

export type CalendarProps = {
    dateSetup: DateSetup
    locale: string
    viewMode: ViewModeType
    rtl: boolean
    headerHeight: number
    gridColumnsWidth: number
}

const ganttCalendarBottomTextClass =
    'gantt-calendar-bottom-text text-center fill-gray-500 dark:fill-gray-400 select-none pointer-events-none font-medium'
const TOP_CALENDAR_Y_POSITION_GAP = 0.8

export const TopPartOfCalendar = ({
    value,
    x1Line,
    y1Line,
    y2Line,
    xText,
    yText,
}: {
    value: string
    x1Line: number
    y1Line: number
    y2Line: number
    xText: number
    yText: number
}) => {
    return (
        <g className="gantt-calendar-top">
            <line
                x1={x1Line}
                y1={y1Line}
                x2={x1Line}
                y2={y2Line}
                className="gantt-calendar-top-tick stroke-gray-200 dark:stroke-gray-800"
                key={value + 'line'}
            />
            <text
                key={value + 'text'}
                y={yText}
                x={xText}
                textAnchor="middle"
                className="gantt-calendar-top-text text-center fill-gray-900 dark:fill-gray-100 font-medium select-none pointer-events-none"
            >
                {value}
            </text>
        </g>
    )
}

const Calendar: React.FC<CalendarProps> = ({
    dateSetup,
    locale,
    viewMode,
    rtl,
    headerHeight,
    gridColumnsWidth,
}) => {
    const getCalendarValuesForYear = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        const topDefaultHeight = headerHeight * 0.5
        for (let i = 0; i < dateSetup.dates.length; i++) {
            const date = dateSetup.dates[i]
            const bottomValue = date.getFullYear()
            bottomValues.push(
                <text
                    key={date.getTime()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * i + gridColumnsWidth * 0.5}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {bottomValue}
                </text>,
            )
            if (
                i === 0 ||
                date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
            ) {
                const topValue = date.getFullYear().toString()
                let xText: number
                if (rtl) {
                    xText = (6 + i + date.getFullYear() + 1) * gridColumnsWidth
                } else {
                    xText = (6 + i - date.getFullYear()) * gridColumnsWidth
                }
                topValues.push(
                    <TopPartOfCalendar
                        key={topValue}
                        value={topValue}
                        x1Line={gridColumnsWidth * i}
                        y1Line={0}
                        y2Line={headerHeight}
                        xText={xText}
                        yText={topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP}
                    />,
                )
            }
        }
        return [topValues, bottomValues]
    }

    const getCalendarValuesForQuarterYear = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        const topDefaultHeight = headerHeight * 0.5
        for (let i = 0; i < dateSetup.dates.length; i++) {
            const date = dateSetup.dates[i]
            // const bottomValue = getLocaleMonth(date, locale);
            const quarter = 'Q' + Math.floor((date.getMonth() + 3) / 3)
            bottomValues.push(
                <text
                    key={date.getTime()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * i + gridColumnsWidth * 0.5}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {quarter}
                </text>,
            )
            if (
                i === 0 ||
                date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
            ) {
                const topValue = date.getFullYear().toString()
                let xText: number
                if (rtl) {
                    xText = (6 + i + date.getMonth() + 1) * gridColumnsWidth
                } else {
                    xText = (6 + i - date.getMonth()) * gridColumnsWidth
                }
                topValues.push(
                    <TopPartOfCalendar
                        key={topValue}
                        value={topValue}
                        x1Line={gridColumnsWidth * i}
                        y1Line={0}
                        y2Line={headerHeight}
                        xText={Math.abs(xText)}
                        yText={topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP}
                    />,
                )
            }
        }
        return [topValues, bottomValues]
    }

    const getCalendarValuesForMonth = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        const topDefaultHeight = headerHeight * 0.5
        for (let i = 0; i < dateSetup.dates.length; i++) {
            const date = dateSetup.dates[i]
            const bottomValue = getLocaleMonth(date, locale)
            bottomValues.push(
                <text
                    key={bottomValue + date.getFullYear()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * i + gridColumnsWidth * 0.5}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {bottomValue}
                </text>,
            )
            if (
                i === 0 ||
                date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
            ) {
                const topValue = date.getFullYear().toString()
                let xText: number
                if (rtl) {
                    xText = (6 + i + date.getMonth() + 1) * gridColumnsWidth
                } else {
                    xText = (6 + i - date.getMonth()) * gridColumnsWidth
                }
                topValues.push(
                    <TopPartOfCalendar
                        key={topValue}
                        value={topValue}
                        x1Line={gridColumnsWidth * i}
                        y1Line={0}
                        y2Line={headerHeight}
                        xText={xText}
                        yText={topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP}
                    />,
                )
            }
        }
        return [topValues, bottomValues]
    }

    const getCalendarValuesForWeek = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        let weeksCount: number = 1
        const topDefaultHeight = headerHeight * 0.5
        const dates = dateSetup.dates
        for (let i = dates.length - 1; i >= 0; i--) {
            const date = dates[i]
            let topValue = ''
            if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
                // top
                topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`
            }
            // bottom
            const bottomValue = `W${getWeekNumberISO8601(date)}`

            bottomValues.push(
                <text
                    key={date.getTime()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * (i + +rtl) + gridColumnsWidth * 0.5}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {bottomValue}
                </text>,
            )

            if (topValue) {
                // if last day is new month
                if (i !== dates.length - 1) {
                    topValues.push(
                        <TopPartOfCalendar
                            key={topValue}
                            value={topValue}
                            x1Line={
                                gridColumnsWidth * i +
                                weeksCount * gridColumnsWidth
                            }
                            y1Line={0}
                            y2Line={headerHeight}
                            xText={
                                gridColumnsWidth * i +
                                gridColumnsWidth * weeksCount * 0.5
                            }
                            yText={
                                topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP
                            }
                        />,
                    )
                }
                weeksCount = 0
            }
            weeksCount++
        }
        return [topValues, bottomValues]
    }

    const getCalendarValuesForDay = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        const topDefaultHeight = headerHeight * 0.5
        const dates = dateSetup.dates
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i]
            const bottomValue = `${getLocalDayOfWeek(date, locale, 'short')}, ${date
                .getDate()
                .toString()}`

            bottomValues.push(
                <text
                    key={date.getTime()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * i + gridColumnsWidth * 0.5}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {bottomValue}
                </text>,
            )
            if (
                i + 1 !== dates.length &&
                date.getMonth() !== dates[i + 1].getMonth()
            ) {
                const topValue = getLocaleMonth(date, locale)

                topValues.push(
                    <TopPartOfCalendar
                        key={topValue + date.getFullYear()}
                        value={topValue}
                        x1Line={gridColumnsWidth * (i + 1)}
                        y1Line={0}
                        y2Line={headerHeight}
                        xText={
                            gridColumnsWidth * (i + 1) -
                            getDaysInMonth(
                                date.getMonth(),
                                date.getFullYear(),
                            ) *
                                gridColumnsWidth *
                                0.5
                        }
                        yText={topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP}
                    />,
                )
            }
        }
        return [topValues, bottomValues]
    }

    const getCalendarValuesForPartOfDay = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        const ticks = viewMode === ViewMode.HalfDay ? 2 : 4
        const topDefaultHeight = headerHeight * 0.5
        const dates = dateSetup.dates
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i]
            const bottomValue = getCachedDateTimeFormat(locale, {
                hour: 'numeric',
            }).format(date)

            bottomValues.push(
                <text
                    key={date.getTime()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * (i + +rtl)}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {bottomValue}
                </text>,
            )
            if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
                const topValue = `${getLocalDayOfWeek(
                    date,
                    locale,
                    'short',
                )}, ${date.getDate()} ${getLocaleMonth(date, locale)}`
                topValues.push(
                    <TopPartOfCalendar
                        key={topValue + date.getFullYear()}
                        value={topValue}
                        x1Line={gridColumnsWidth * i + ticks * gridColumnsWidth}
                        y1Line={0}
                        y2Line={headerHeight}
                        xText={
                            gridColumnsWidth * i +
                            ticks * gridColumnsWidth * 0.5
                        }
                        yText={topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP}
                    />,
                )
            }
        }

        return [topValues, bottomValues]
    }

    const getCalendarValuesForHour = () => {
        const topValues: ReactElement[] = []
        const bottomValues: ReactElement[] = []
        const topDefaultHeight = headerHeight * 0.5
        const dates = dateSetup.dates
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i]
            const bottomValue = getCachedDateTimeFormat(locale, {
                hour: 'numeric',
            }).format(date)

            bottomValues.push(
                <text
                    key={date.getTime()}
                    y={headerHeight * 0.8}
                    x={gridColumnsWidth * (i + +rtl)}
                    textAnchor="middle"
                    className={ganttCalendarBottomTextClass}
                >
                    {bottomValue}
                </text>,
            )
            if (i !== 0 && date.getDate() !== dates[i - 1].getDate()) {
                const displayDate = dates[i - 1]
                const topValue = `${getLocalDayOfWeek(
                    displayDate,
                    locale,
                    'long',
                )}, ${displayDate.getDate()} ${getLocaleMonth(displayDate, locale)}`
                const topPosition = (date.getHours() - 24) / 2
                topValues.push(
                    <TopPartOfCalendar
                        key={topValue + displayDate.getFullYear()}
                        value={topValue}
                        x1Line={gridColumnsWidth * i}
                        y1Line={0}
                        y2Line={headerHeight}
                        xText={gridColumnsWidth * (i + topPosition)}
                        yText={topDefaultHeight * TOP_CALENDAR_Y_POSITION_GAP}
                    />,
                )
            }
        }

        return [topValues, bottomValues]
    }

    let topValues: ReactElement[] = []
    let bottomValues: ReactElement[] = []
    switch (dateSetup.viewMode) {
        case ViewMode.Year:
            ;[topValues, bottomValues] = getCalendarValuesForYear()
            break
        case ViewMode.QuarterYear:
            ;[topValues, bottomValues] = getCalendarValuesForQuarterYear()
            break
        case ViewMode.Month:
            ;[topValues, bottomValues] = getCalendarValuesForMonth()
            break
        case ViewMode.Week:
            ;[topValues, bottomValues] = getCalendarValuesForWeek()
            break
        case ViewMode.Day:
            ;[topValues, bottomValues] = getCalendarValuesForDay()
            break
        case ViewMode.QuarterDay:
        case ViewMode.HalfDay:
            ;[topValues, bottomValues] = getCalendarValuesForPartOfDay()
            break
        case ViewMode.Hour:
            ;[topValues, bottomValues] = getCalendarValuesForHour()
    }
    return (
        <g className="gantt-calendar">
            <rect
                x={0}
                y={0}
                width={gridColumnsWidth * dateSetup.dates.length}
                height={headerHeight}
                className="gantt-calendar-header fill-transparent"
                style={{ strokeWidth: 1.4 }}
            />
            {bottomValues} {topValues}
        </g>
    )
}

export default Calendar

import type { ReactNode } from 'react'

export type CalendarView = 'day' | 'week' | 'month' | 'year' | 'agenda'

export interface FullCalendarEvent {
    id: number
    startDate: string
    endDate: string
    title: string
    color: string
    description: string
    type: string /** a prop to identify the type of event for ease of categorization */
    disabled?: boolean
}

export interface CalendarCell {
    day: number
    currentMonth: boolean
    date: Date
}

export type ViewProps = {
    singleDayEvents: FullCalendarEvent[]
    multiDayEvents: FullCalendarEvent[]
} & ViewCallbackProps

export type CallbackProps = {
    onCellClick?: (date: Date) => void
}

export type FullCalendarCallbackProps = {
    onCellClick?: (date: Date) => void
    onEventClick?: (event: FullCalendarEvent) => void
    renderEvent?: (props: { event: FullCalendarEvent }) => EventRenderResult
    onChange?: (events: FullCalendarEvent[], event: FullCalendarEvent) => void
    onMoreClick?: (
        overflowedEvents: FullCalendarEvent[],
        allEvents: FullCalendarEvent[],
    ) => void
}

export type EventRenderResult = {
    className?: string
    content: ReactNode
}

export type ViewCallbackProps = {
    onCellClick?: (date: Date) => void
    onEventClick?: (event: FullCalendarEvent) => void
    renderEvent?: (props: { event: FullCalendarEvent }) => EventRenderResult
    onMoreClick?: (
        overflowedEvents: FullCalendarEvent[],
        allEvents: FullCalendarEvent[],
    ) => void
}

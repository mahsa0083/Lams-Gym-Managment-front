import { createContext } from 'react'
import type {
    CalendarView,
    FullCalendarEvent,
    FullCalendarCallbackProps,
} from '../types'

type ICalendarContext = {
    selectedDate: Date
    view: CalendarView
    setView: (view: CalendarView) => void
    use24HourFormat: boolean
    toggleTimeFormat: () => void
    setSelectedDate: (date: Date | undefined) => void
    events: FullCalendarEvent[]
    updateEvent: (event: FullCalendarEvent) => void
} & Pick<FullCalendarCallbackProps, 'onChange'>

const FullCalendarContext = createContext({} as ICalendarContext)

export default FullCalendarContext

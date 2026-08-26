import { useState } from 'react'
import FullCalendarContext from './context/FullCalendarContext'
import type {
    CalendarView,
    FullCalendarEvent,
    FullCalendarCallbackProps,
} from './types'

type CalendarSettings = {
    view: CalendarView
    use24HourFormat: boolean
}

const DEFAULT_SETTINGS: CalendarSettings = {
    view: 'day',
    use24HourFormat: true,
}

type FullCalendarProviderProps = {
    children: React.ReactNode
    events: FullCalendarEvent[]
    view?: CalendarView
    badge?: 'dot' | 'colored'
} & Pick<FullCalendarCallbackProps, 'onChange'>

function FullCalendarProvider({
    children,
    events,
    view = 'day',
    onChange,
}: FullCalendarProviderProps) {
    const [settings, setSettings] = useState<CalendarSettings>({
        ...DEFAULT_SETTINGS,
        view: view,
    })

    const [currentView, setCurrentViewState] = useState<CalendarView>(
        settings.view,
    )
    const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
        settings.use24HourFormat,
    )

    const [selectedDate, setSelectedDate] = useState(new Date())

    const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
        setSettings({
            ...settings,
            ...newPartialSettings,
        })
    }

    const setView = (newView: CalendarView) => {
        setCurrentViewState(newView)
        updateSettings({ view: newView })
    }

    const toggleTimeFormat = () => {
        const newValue = !use24HourFormat
        setUse24HourFormatState(newValue)
        updateSettings({ use24HourFormat: newValue })
    }

    const handleSelectDate = (date: Date | undefined) => {
        if (!date) return
        setSelectedDate(date)
    }

    const updateEvent = (event: FullCalendarEvent) => {
        const updated = {
            ...event,
            startDate: new Date(event.startDate).toISOString(),
            endDate: new Date(event.endDate).toISOString(),
        }

        const newEvents = events.map((e) => (e.id === event.id ? updated : e))

        if (onChange) {
            onChange(newEvents, updated)
        }
    }

    const value = {
        selectedDate,
        setSelectedDate: handleSelectDate,
        events,
        view: currentView,
        use24HourFormat,
        toggleTimeFormat,
        setView,
        updateEvent,
        onChange,
    }

    return (
        <FullCalendarContext.Provider value={value}>
            {children}
        </FullCalendarContext.Provider>
    )
}

export default FullCalendarProvider

import { useContext } from 'react'
import FullCalendarContext from '../context/FullCalendarContext'

function useFullCalendar() {
    const context = useContext(FullCalendarContext)
    if (!context)
        throw new Error(
            'useFullCalendar must be used within a FullCalendarProvider.',
        )
    return context
}

export default useFullCalendar

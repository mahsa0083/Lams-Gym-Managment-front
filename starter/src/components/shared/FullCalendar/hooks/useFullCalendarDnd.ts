import { useContext } from 'react'
import FullCalendarDndContext from '../context/FullCalendarDndContext'

function useFullCalendarDnd() {
    const context = useContext(FullCalendarDndContext)
    if (!context) {
        throw new Error(
            'useFullCalendarDnd must be used within a FullCalendarDndProvider',
        )
    }
    return context
}

export default useFullCalendarDnd

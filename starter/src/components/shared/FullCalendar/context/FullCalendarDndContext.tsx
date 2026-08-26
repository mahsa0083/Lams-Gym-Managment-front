import { createContext } from 'react'
import type { FullCalendarEvent } from '../types'

type PendingDropData = {
    event: FullCalendarEvent
    newStartDate: Date
    newEndDate: Date
}

type FullCalendarDndContextProps = {
    draggedEvent: FullCalendarEvent | null
    isDragging: boolean
    startDrag: (event: FullCalendarEvent) => void
    endDrag: () => void
    handleEventDrop: (date: Date, hour?: number, minute?: number) => void
    pendingDropData: PendingDropData | null
    handleConfirmDrop: () => void
    handleCancelDrop: () => void
}

const FullCalendarDndContext = createContext<
    FullCalendarDndContextProps | undefined
>(undefined)

export default FullCalendarDndContext

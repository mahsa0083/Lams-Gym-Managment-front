import React, { useCallback, useRef, useState, useMemo } from 'react'
import useFullCalendar from './hooks/useFullCalendar'
import FullCalendarDndContext from './context/FullCalendarDndContext'
import type { FullCalendarEvent } from './types'
import type { ReactNode } from 'react'

interface PendingDropData {
    event: FullCalendarEvent
    newStartDate: Date
    newEndDate: Date
}

interface FullCalendarDndProviderProps {
    children: ReactNode
}

export function FullCalendarDndProvider({
    children,
}: FullCalendarDndProviderProps) {
    const { updateEvent } = useFullCalendar()
    const [dragState, setDragState] = useState<{
        draggedEvent: FullCalendarEvent | null
        isDragging: boolean
    }>({ draggedEvent: null, isDragging: false })

    const [pendingDropData, setPendingDropData] =
        useState<PendingDropData | null>(null)

    const onEventDroppedRef = useRef<
        | ((
              event: FullCalendarEvent,
              newStartDate: Date,
              newEndDate: Date,
          ) => void)
        | null
    >(null)

    const startDrag = useCallback((event: FullCalendarEvent) => {
        setDragState({ draggedEvent: event, isDragging: true })
    }, [])

    const endDrag = useCallback(() => {
        setDragState({ draggedEvent: null, isDragging: false })
    }, [])

    const calculateNewDates = useCallback(
        (
            event: FullCalendarEvent,
            targetDate: Date,
            hour?: number,
            minute?: number,
        ) => {
            const originalStart = new Date(event.startDate)
            const originalEnd = new Date(event.endDate)
            const duration = originalEnd.getTime() - originalStart.getTime()

            const newStart = new Date(targetDate)
            if (hour !== undefined) {
                newStart.setHours(hour, minute || 0, 0, 0)
            } else {
                newStart.setHours(
                    originalStart.getHours(),
                    originalStart.getMinutes(),
                    0,
                    0,
                )
            }

            return {
                newStart,
                newEnd: new Date(newStart.getTime() + duration),
            }
        },
        [],
    )

    const isSamePosition = useCallback((date1: Date, date2: Date) => {
        return date1.getTime() === date2.getTime()
    }, [])

    const handleEventDrop = useCallback(
        (targetDate: Date, hour?: number, minute?: number) => {
            const { draggedEvent } = dragState
            if (!draggedEvent) return

            const { newStart, newEnd } = calculateNewDates(
                draggedEvent,
                targetDate,
                hour,
                minute,
            )
            const originalStart = new Date(draggedEvent.startDate)

            // Check if dropped in same position
            if (isSamePosition(originalStart, newStart)) {
                endDrag()
                return
            }

            // Instantly update event if user doesn't want confirmation
            const callback = onEventDroppedRef.current
            if (callback) {
                callback(draggedEvent, newStart, newEnd)
            }
            endDrag()
        },
        [dragState, calculateNewDates, isSamePosition, endDrag],
    )

    const handleConfirmDrop = useCallback(() => {
        if (!pendingDropData) return

        const callback = onEventDroppedRef.current
        if (callback) {
            callback(
                pendingDropData.event,
                pendingDropData.newStartDate,
                pendingDropData.newEndDate,
            )
        }

        // Reset states
        setPendingDropData(null)
        endDrag()
    }, [pendingDropData, endDrag])

    const handleCancelDrop = useCallback(() => {
        setPendingDropData(null)
        endDrag()
    }, [endDrag])

    // Default event update handler
    const handleEventUpdate = useCallback(
        (event: FullCalendarEvent, newStartDate: Date, newEndDate: Date) => {
            const updatedEvent = {
                ...event,
                startDate: newStartDate.toISOString(),
                endDate: newEndDate.toISOString(),
            }
            updateEvent(updatedEvent)
        },
        [updateEvent],
    )

    // Set default callback
    React.useEffect(() => {
        onEventDroppedRef.current = handleEventUpdate
    }, [handleEventUpdate])

    const contextValue = useMemo(
        () => ({
            draggedEvent: dragState.draggedEvent,
            isDragging: dragState.isDragging,
            startDrag,
            endDrag,
            handleEventDrop,
            pendingDropData,
            handleConfirmDrop,
            handleCancelDrop,
        }),
        [
            dragState,
            pendingDropData,
            startDrag,
            endDrag,
            handleEventDrop,
            handleConfirmDrop,
            handleCancelDrop,
        ],
    )

    return (
        <FullCalendarDndContext.Provider value={contextValue}>
            {children}
        </FullCalendarDndContext.Provider>
    )
}

export default FullCalendarDndProvider

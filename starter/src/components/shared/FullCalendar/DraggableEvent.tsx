import { motion } from 'motion/react'
import useFullCalendarDnd from './hooks/useFullCalendarDnd'
import type { ReactNode } from 'react'
import type { FullCalendarEvent } from './types'

type DraggableEventProps = {
    event: FullCalendarEvent
    children: ReactNode
    className?: string
}

function DraggableEvent({ event, children, className }: DraggableEventProps) {
    const { startDrag, endDrag, isDragging, draggedEvent } =
        useFullCalendarDnd()

    const isCurrentlyDragged = isDragging && draggedEvent?.id === event.id

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    return (
        <motion.div
            className={`${className || ''} ${isCurrentlyDragged ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
            draggable
            onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
            onDragStart={(e) => {
                ;(e as DragEvent).dataTransfer!.setData(
                    'text/plain',
                    event.id.toString(),
                )
                startDrag(event)
            }}
            onDragEnd={() => {
                endDrag()
            }}
        >
            {children}
        </motion.div>
    )
}

export default DraggableEvent

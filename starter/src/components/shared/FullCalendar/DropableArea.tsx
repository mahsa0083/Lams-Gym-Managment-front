import useFullCalendarDnd from './hooks/useFullCalendarDnd'
import type { ComponentProps } from 'react'

type DroppableAreaProps = ComponentProps<'div'> & {
    date: Date
    hour?: number
    minute?: number
    onCellClick?: (date: Date) => void
}

function DroppableArea({
    date,
    hour,
    minute,
    children,
    className,
    style,
    onCellClick,
}: DroppableAreaProps) {
    const { handleEventDrop, isDragging } = useFullCalendarDnd()

    const handleClick = () => {
        if (onCellClick) {
            // Create a new date with the specific hour and minute if provided
            const clickDate = new Date(date)
            if (hour !== undefined) {
                clickDate.setHours(hour)
            }
            if (minute !== undefined) {
                clickDate.setMinutes(minute)
            }
            onCellClick(clickDate)
        }
    }

    return (
        <div
            className={`${className || ''} ${isDragging ? 'drop-target' : ''}`}
            style={style}
            onDragOver={(e) => {
                // Prevent default to allow drop
                e.preventDefault()
                e.currentTarget.classList.add('bg-gray-100')
            }}
            onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-gray-100')
            }}
            onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('bg-gray-100')
                handleEventDrop(date, hour, minute)
            }}
            onClick={handleClick}
        >
            {children}
        </div>
    )
}

export default DroppableArea

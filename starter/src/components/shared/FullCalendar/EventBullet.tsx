import classNames from '@/utils/classNames'
import { getColorClasses } from './utils'
import type { ComponentProps, MouseEvent } from 'react'
import type { FullCalendarEvent } from './types'

type EventBulletProps = ComponentProps<'div'> & {
    color: string
    event?: FullCalendarEvent
    onEventClick?: (event: FullCalendarEvent) => void
}

const EventBullet = (props: EventBulletProps) => {
    const { className, color, event, onEventClick, onClick, ...rest } = props

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (event && onEventClick && !event.disabled) {
            onEventClick(event)
        }
        if (onClick) {
            onClick(e)
        }
    }

    return (
        <div
            className={classNames(
                'size-2 rounded-full',
                getColorClasses(color).bullet,
                event &&
                    onEventClick &&
                    'cursor-pointer hover:scale-110 transition-transform',
                className,
            )}
            onClick={handleClick}
            {...rest}
        />
    )
}

export default EventBullet

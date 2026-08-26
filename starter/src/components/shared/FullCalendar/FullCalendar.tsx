import FullCalendarProvider from './FullCalendarProvider'
import FullCalendarDndProvider from './FullCalendarDndProvider'
import FullCalendarHeader from './FullCalendarHeader'
import FullCalendarBody from './FullCalendarBody'
import type { BaseFullCalendarHeaderProps } from './FullCalendarHeader'
import type { FullCalendarEvent, FullCalendarCallbackProps } from './types'

export type FullCalendarProps = {
    events: FullCalendarEvent[]
} & BaseFullCalendarHeaderProps &
    FullCalendarCallbackProps

const FullCalendar = (props: FullCalendarProps) => {
    const {
        events,
        onCellClick,
        onEventClick,
        renderEvent,
        onChange,
        onMoreClick,
        ...headerProps
    } = props

    return (
        <FullCalendarProvider events={events} view="month" onChange={onChange}>
            <FullCalendarDndProvider>
                <div className="w-full">
                    <FullCalendarHeader {...headerProps} />
                    <FullCalendarBody
                        onCellClick={onCellClick}
                        onEventClick={onEventClick}
                        renderEvent={renderEvent}
                        onMoreClick={onMoreClick}
                    />
                </div>
            </FullCalendarDndProvider>
        </FullCalendarProvider>
    )
}

export default FullCalendar

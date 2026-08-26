import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import InputGroup from '@/components/ui/InputGroup/InputGroup'
import useFullCalendar from './hooks/useFullCalendar'
import { navigateDate } from './utils'
import { LiArrowLeft, LiArrowRight } from '@/icons'
import dayjs from 'dayjs'
import type { CalendarView } from './types'
import type { ReactNode } from 'react'

type CustomeRenderPayload = {
    handlePrevious: () => void
    handleNext: () => void
    selectedDate: Date
    setView: (view: CalendarView) => void
    setSelectedDate: (date: Date) => void
}

export type BaseFullCalendarHeaderProps = {
    renderHeaderStart?: (payload: CustomeRenderPayload) => ReactNode | string
    renderHeaderEnd?: (payload: CustomeRenderPayload) => ReactNode | string
}

export type FullCalendarHeaderProps = BaseFullCalendarHeaderProps

const tabs: { label: string; value: string }[] = [
    {
        label: 'Agenda',
        value: 'agenda',
    },
    {
        label: 'Day',
        value: 'day',
    },
    {
        label: 'Week',
        value: 'week',
    },
    {
        label: 'Month',
        value: 'month',
    },
    {
        label: 'Year',
        value: 'year',
    },
]

const FullCalendarHeader = ({
    renderHeaderStart,
    renderHeaderEnd,
}: FullCalendarHeaderProps) => {
    const { view, setView, selectedDate, setSelectedDate } = useFullCalendar()

    const handlePrevious = () =>
        setSelectedDate(navigateDate(selectedDate, view, 'previous'))
    const handleNext = () =>
        setSelectedDate(navigateDate(selectedDate, view, 'next'))

    const callbackPayload = {
        handlePrevious,
        handleNext,
        selectedDate,
        setSelectedDate,
        setView,
    }

    return (
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 py-2 px-4 lg:flex-row lg:items-center lg:justify-between">
            {renderHeaderStart ? (
                renderHeaderStart(callbackPayload)
            ) : (
                <div className="flex items-center gap-2">
                    <h5 className="heading-text">
                        {dayjs(selectedDate).format('MMMM YYYY')}
                    </h5>
                </div>
            )}

            {renderHeaderEnd ? (
                renderHeaderEnd(callbackPayload)
            ) : (
                <div className="flex items-center gap-2">
                    <InputGroup>
                        <Button
                            icon={<LiArrowLeft />}
                            onClick={handlePrevious}
                        />
                        <Button onClick={() => setSelectedDate(new Date())}>
                            Today
                        </Button>
                        <Button icon={<LiArrowRight />} onClick={handleNext} />
                    </InputGroup>
                    <Select
                        className="w-[100px]"
                        options={tabs}
                        value={tabs.find((item) => item.value === view)}
                        onChange={(selected) => setView(selected.value)}
                    />
                </div>
            )}
        </div>
    )
}

export default FullCalendarHeader

import classNames from 'classnames'
import { DEFAULT_COLUMN_WIDTH } from '../constants'

import type { Task, Columns } from '../types'

type EventListTableProps<T> = {
    rowHeight: number
    locale: string
    tasks: Task<T>[]
    selectedEventId: string
    setSelectedEvent: (eventId: string) => void
    onExpanderClick: (event: Task<T>) => void
    columns?: Columns<T>[]
}

const ChevronRight = () => {
    return (
        <div className="gantt-event-chevron text-lg">
            <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M9 6l6 6l-6 6"></path>
            </svg>
        </div>
    )
}

const ChevronDown = () => {
    return (
        <div className="gantt-event-chevron text-lg">
            <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M6 9l6 6l6 -6"></path>
            </svg>
        </div>
    )
}

const EventListTable = <T,>({
    rowHeight,
    tasks,
    columns = [],
    onExpanderClick,
}: EventListTableProps<T>) => {
    return (
        <div className="gantt-table-task-list-wrapper table ltr:border-r rtl:border-l ltr:border-r-gray-200 rtl:border-l-gray-200 ltr:dark:border-r-gray-700 rtl:dark:border-l-gray-700 border-b-transparent w-full">
            {tasks.map((t, taskIndex) => {
                let expanderSymbol = null
                if (t.hideChildren === false) {
                    expanderSymbol = <ChevronDown />
                } else if (t.hideChildren === true) {
                    expanderSymbol = <ChevronRight />
                }

                return (
                    <div
                        className="gantt-task-list-table-row table-row truncate"
                        style={{ height: rowHeight }}
                        key={`${t.id}row`}
                    >
                        {columns.length > 0 ? (
                            columns.map((column, index) => (
                                <div
                                    key={`column-${index}`}
                                    className={classNames(
                                        'gantt-task-list-cell table-cell align-middle whitespace-nowrap overflow-hidden truncate relative',
                                        tasks.length === taskIndex + 1
                                            ? ''
                                            : 'border-b border-gray-200 dark:border-gray-700',
                                    )}
                                    style={{
                                        minWidth:
                                            column?.width ||
                                            DEFAULT_COLUMN_WIDTH,
                                        maxWidth:
                                            column?.width ||
                                            DEFAULT_COLUMN_WIDTH,
                                    }}
                                    title={t.name}
                                >
                                    {column.cell({
                                        ...t,
                                        expander: expanderSymbol,
                                    })}
                                </div>
                            ))
                        ) : (
                            <div
                                className={classNames(
                                    'gantt-task-list-cell table-cell align-middle whitespace-nowrap overflow-hidden truncate px-4',
                                    tasks.length === taskIndex + 1
                                        ? ''
                                        : 'border-b border-gray-200 dark:border-gray-800',
                                )}
                                style={{
                                    minWidth: DEFAULT_COLUMN_WIDTH,
                                    maxWidth: DEFAULT_COLUMN_WIDTH,
                                }}
                                title={t.name}
                            >
                                <div className="gantt-task-list-wrapper flex gap-2">
                                    <button
                                        className={
                                            expanderSymbol
                                                ? 'gantt-task-list-expander text-gray-600 text-xs px-1 py-0.5 select-none cursor-pointer'
                                                : 'gantt-task-list-empty-expander text-xs pl-4 select-none'
                                        }
                                        onClick={() => onExpanderClick(t)}
                                    >
                                        {expanderSymbol}
                                    </button>
                                    <div className="font-medium">{t.name}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default EventListTable

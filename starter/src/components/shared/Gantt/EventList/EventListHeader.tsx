import { DEFAULT_COLUMN_WIDTH } from '../constants'
import type { Columns } from '../types'

type EventListHeaderProps<T> = {
    headerHeight: number
    columns?: Columns<T>[]
}

const EventListHeader = <T,>({
    headerHeight,
    columns = [],
}: EventListHeaderProps<T>) => {
    return (
        <div className="gantt-table table border border-transparent border-b-gray-200 ltr:border-r-gray-200 rtl:border-l-gray-200 ltr:dark:border-b-gray-700 rtl:dark:border-b-gray-700 dark:border-r-gray-700">
            <div
                className="gantt-table-header table-row list-none"
                style={{
                    height: headerHeight - 2,
                }}
            >
                {columns.length > 0 ? (
                    columns.map((column, index) => (
                        <div
                            key={`column.header-${index}`}
                            className="gantt-table-header-item table-cell align-middle px-4 font-medium"
                            style={{
                                minWidth: column.width || DEFAULT_COLUMN_WIDTH,
                            }}
                        >
                            {column.header}
                        </div>
                    ))
                ) : (
                    <div
                        className="gantt-table-header-item table-cell align-middle px-4 font-medium"
                        style={{
                            minWidth: DEFAULT_COLUMN_WIDTH,
                        }}
                    >
                        Name
                    </div>
                )}
            </div>
        </div>
    )
}

export default EventListHeader

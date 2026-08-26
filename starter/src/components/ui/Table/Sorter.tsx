import { Unsort, SortUp, SortDown } from '../Icons'
import classNames from '../utils/classNames'

export type SorterProps = {
    className?: string
    sort?: boolean | 'asc' | 'desc'
}

const Sorter = ({ sort, className }: SorterProps) => {
    const color = 'text-primary'

    const renderSort = () => {
        if (typeof sort === 'boolean') {
            return <Unsort />
        }

        if (sort === 'asc') {
            return <SortUp className={color} />
        }

        if (sort === 'desc') {
            return <SortDown className={color} />
        }

        return null
    }

    return (
        <div className={classNames('inline-flex', className)}>
            {renderSort()}
        </div>
    )
}

export default Sorter

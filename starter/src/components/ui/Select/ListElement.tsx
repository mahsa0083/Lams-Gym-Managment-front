import classNames from '../utils/classNames'
import type { ComponentProps } from 'react'

const ListElement = ({ className, ...rest }: ComponentProps<'li'>) => {
    return <li {...rest} className={classNames('select-item', className)} />
}

export default ListElement

import classNames from 'classnames'
import type { ComponentPropsWithRef, ElementType } from 'react'

export interface TableProps extends ComponentPropsWithRef<'table'> {
    asElement?: ElementType
    bordered?: boolean
    compact?: boolean
    hoverable?: boolean
    overflow?: boolean
    overflowClass?: string
    verticalDivider?: {
        head?: boolean
        body?: boolean
        footer?: boolean
    }
}

const defaultVerticalDivider = { head: false, body: false }

const BorderWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="table-border">{children}</div>
)

const OverflowWrapper = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => <div className={classNames('overflow-x-auto', className)}>{children}</div>

const Table = (props: TableProps) => {
    const {
        asElement: Component = 'table',
        bordered,
        children,
        className,
        compact = false,
        hoverable = true,
        overflow = true,
        overflowClass,
        verticalDivider: _verticalDivider,
        ref,
        ...rest
    } = props

    const verticalDivider = {
        ...defaultVerticalDivider,
        ..._verticalDivider,
    }

    const tableClass = classNames(
        Component === 'table' ? 'table-default' : 'table-flex',
        hoverable && 'table-hover',
        compact && 'table-compact',
        verticalDivider.body && 'table-vertical-divider-body',
        verticalDivider.head && 'table-vertical-divider-head',
        verticalDivider.footer && 'table-vertical-divider-foot',
        className,
    )

    const renderTable = () => {
        const table = (
            <Component className={tableClass} {...rest} ref={ref}>
                {children}
            </Component>
        )

        if (overflow) {
            return (
                <OverflowWrapper className={overflowClass}>
                    {table}
                </OverflowWrapper>
            )
        }

        if (bordered) {
            return <BorderWrapper>{table}</BorderWrapper>
        }

        return table
    }

    return <>{renderTable()}</>
}

export default Table

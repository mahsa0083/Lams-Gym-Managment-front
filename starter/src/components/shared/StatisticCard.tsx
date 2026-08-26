import classNames from '@/utils/classNames'
import type { ComponentProps, ReactNode } from 'react'

type StatisticCardProps = ComponentProps<'div'> & {
    inset?: boolean
    footer?: ReactNode | string
    header?: ReactNode | string
    bodyClass?: string
}

const StatisticCard = ({
    children,
    className,
    bodyClass,
    footer,
    header,
    inset,
}: StatisticCardProps) => {
    const borderClasses =
        'border border-gray-200 dark:border-gray-700 rounded-lg'

    const renderBody = (
        classes?: string,
        innerHeader?: ReactNode,
        innerFooter?: ReactNode,
    ) => {
        return (
            <div
                className={classNames(
                    'bg-white dark:bg-gray-800 rounded-lg',
                    classes,
                )}
            >
                {innerHeader && (
                    <div className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                        {innerHeader}
                    </div>
                )}
                {innerHeader || innerFooter ? (
                    <div className="p-4">{children}</div>
                ) : (
                    children
                )}
                {innerFooter && (
                    <div className="py-2 px-4 border-t border-gray-200 dark:border-gray-700">
                        {innerFooter}
                    </div>
                )}
            </div>
        )
    }

    const renderInsetCard = () => {
        return (
            <div
                className={classNames(
                    borderClasses,
                    'p-1 bg-gray-100 dark:bg-gray-700',
                    className,
                )}
            >
                {header && <div className="py-1.5 px-4">{header}</div>}
                {renderBody(
                    classNames(
                        'p-4 border-b border-gray-200 dark:border-gray-800',
                        bodyClass,
                    ),
                )}
                {footer && <div className="pt-1.5 pb-0.5">{footer}</div>}
            </div>
        )
    }

    const renderDefaultCard = () => {
        return renderBody(
            classNames(
                header || footer ? 'p-0' : 'p-4',
                borderClasses,
                className,
            ),
            header,
            footer,
        )
    }

    return inset ? renderInsetCard() : renderDefaultCard()
}

export default StatisticCard

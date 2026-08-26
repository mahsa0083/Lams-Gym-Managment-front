import classNames from '@/utils/classNames'
import { ResponsiveContainer } from 'recharts'
import type { ComponentProps, ReactElement } from 'react'

type ChartContainerProps = ComponentProps<'div'> & {
    children: ReactElement
    height?: number
    width?: number
}

const ChartContainer = (props: ChartContainerProps) => {
    const { className, children, height = 300, width, style, ...rest } = props

    return (
        <div
            className={classNames('chart', className)}
            style={{ height: height, width: width || '100%', ...style }}
            {...rest}
        >
            <ResponsiveContainer
                width="100%"
                height="100%"
                minHeight={20}
                initialDimension={{ width: 1000, height: 200 }}
            >
                {children}
            </ResponsiveContainer>
        </div>
    )
}

export default ChartContainer

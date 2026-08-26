import { defaultChartConfig } from './configs'
import type {
    XAxisProps,
    TooltipProps,
    YAxisProps,
    TooltipContentProps,
} from 'recharts'
import type { ReactNode } from 'react'

type ValueType = number | string | Array<number | string>
type NameType = number | string

export type ChartTooltipContentConfig = {
    hideLabel?: boolean
    hideIndicator?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nameFormatter?: (value: string, props: any) => ReactNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueFormatter?: (value: number, props: any) => ReactNode
    labelClassName?: string
    customContent?: (
        props: TooltipContentProps<ValueType, NameType>,
    ) => ReactNode
}

export type BaseChartProps = {
    data: Array<Record<string, string | number>>
    xAxisConfig?: XAxisProps
    yAxisConfig?: YAxisProps
    tooltipConfig?: TooltipProps<ValueType, NameType>
    tooltipContentConfig?: ChartTooltipContentConfig
    height?: number
    width?: number
    chartHorizontalSpace?: number
    chartVerticalSpace?: number
    children?: ReactNode | ((props: typeof defaultChartConfig) => ReactNode)
}

import {
    BarChart as RechartBar,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'
import ChartContainer from './ChartContainer'
import ChartTooltipContent from './ChartTooltipContent'
import { defaultChartConfig } from './configs'
import type { BarProps as RechartBarProps, CartesianGridProps } from 'recharts'
import type { BaseChartProps } from './types'

type BarProps = Omit<RechartBarProps, 'ref'>

type BarChartProps = BaseChartProps & {
    barConfig: Array<BarProps>
    layout?: 'horizontal' | 'vertical'
    cartesianGridConfig?: Omit<CartesianGridProps, 'ref'>
    stackOffset?:
        | 'sign'
        | 'expand'
        | 'none'
        | 'wiggle'
        | 'silhouette'
        | 'positive'
}

const BarChart = (props: BarChartProps) => {
    const {
        data,
        barConfig = [],
        height = 300,
        width,
        layout,
        xAxisConfig = {},
        yAxisConfig = {},
        tooltipConfig = {},
        tooltipContentConfig,
        cartesianGridConfig = {},
        stackOffset,
        children,
        chartHorizontalSpace = 20,
        chartVerticalSpace = 10,
    } = props

    return (
        <ChartContainer className="bar-chart" height={height} width={width}>
            <RechartBar
                height={height}
                data={data}
                accessibilityLayer
                margin={{
                    left: chartHorizontalSpace,
                    right: chartHorizontalSpace,
                    top: chartVerticalSpace,
                    bottom: chartVerticalSpace,
                }}
                layout={layout}
                stackOffset={stackOffset}
            >
                <CartesianGrid vertical={false} {...cartesianGridConfig} />
                <XAxis {...defaultChartConfig.XAxis} {...xAxisConfig} />
                <YAxis {...defaultChartConfig.YAxis} {...yAxisConfig} />
                <Tooltip
                    content={
                        <ChartTooltipContent
                            hideLabel={tooltipContentConfig?.hideLabel}
                            hideIndicator={tooltipContentConfig?.hideIndicator}
                            nameFormatter={tooltipContentConfig?.nameFormatter}
                            valueFormatter={
                                tooltipContentConfig?.valueFormatter
                            }
                            labelClassName={
                                tooltipContentConfig?.labelClassName
                            }
                            customContent={tooltipContentConfig?.customContent}
                        />
                    }
                    {...tooltipConfig}
                />
                {barConfig.map(({ fill, ...rest }, index) => (
                    <Bar
                        key={index}
                        fill={
                            fill ||
                            defaultChartConfig.colors[
                                index % defaultChartConfig.colors.length
                            ]
                        }
                        {...(defaultChartConfig.bar as BarProps)}
                        {...rest}
                    />
                ))}
                {typeof children === 'function'
                    ? children(defaultChartConfig)
                    : children}
            </RechartBar>
        </ChartContainer>
    )
}

export default BarChart

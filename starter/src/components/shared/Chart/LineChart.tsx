import {
    LineChart as RechartLine,
    Line,
    XAxis,
    CartesianGrid,
    Tooltip,
    YAxis,
} from 'recharts'
import ChartContainer from './ChartContainer'
import ChartTooltipContent from './ChartTooltipContent'
import { defaultChartConfig } from './configs'
import type {
    LineProps as RechartLineProps,
    CartesianGridProps,
} from 'recharts'
import type { BaseChartProps } from './types'

type LineProps = Omit<RechartLineProps, 'ref'>

type LineChartProps = BaseChartProps & {
    lineConfig: Array<LineProps>
    cartesianGridConfig?: Omit<CartesianGridProps, 'ref'>
}

const LineChart = (props: LineChartProps) => {
    const {
        data,
        lineConfig = [],
        height = 300,
        width,
        xAxisConfig = {},
        yAxisConfig = {},
        tooltipConfig = {},
        tooltipContentConfig,
        cartesianGridConfig = {},
        children,
        chartHorizontalSpace = 20,
        chartVerticalSpace = 10,
    } = props

    return (
        <ChartContainer className="line-chart" height={height} width={width}>
            <RechartLine
                height={height}
                data={data}
                accessibilityLayer
                margin={{
                    left: chartHorizontalSpace,
                    right: chartHorizontalSpace,
                    top: chartVerticalSpace,
                    bottom: chartVerticalSpace,
                }}
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
                {lineConfig.map(({ stroke, ...rest }, index) => (
                    <Line
                        key={index}
                        stroke={
                            stroke ||
                            defaultChartConfig.colors[
                                index % defaultChartConfig.colors.length
                            ]
                        }
                        {...(defaultChartConfig.line as LineProps)}
                        {...rest}
                    />
                ))}
                {typeof children === 'function'
                    ? children(defaultChartConfig)
                    : children}
            </RechartLine>
        </ChartContainer>
    )
}

export default LineChart

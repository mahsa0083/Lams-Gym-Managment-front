import {
    AreaChart as RechartArea,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'
import ChartContainer from './ChartContainer'
import ChartTooltipContent from './ChartTooltipContent'
import { defaultChartConfig } from './configs'
import type {
    AreaProps as RechartAreaProps,
    CartesianGridProps,
} from 'recharts'
import type { BaseChartProps } from './types'

type AreaProps = Omit<RechartAreaProps, 'ref'>

type AreaChartProps = BaseChartProps & {
    areaConfig: Array<AreaProps>
    cartesianGridConfig?: Omit<CartesianGridProps, 'ref'>
}

const AreaChart = (props: AreaChartProps) => {
    const {
        data,
        areaConfig = [],
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
        <ChartContainer className="area-chart" height={height} width={width}>
            <RechartArea
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
                {areaConfig.map(({ stroke, fill, ...rest }, index) => (
                    <Area
                        key={index}
                        stroke={
                            stroke ||
                            defaultChartConfig.colors[
                                index % defaultChartConfig.colors.length
                            ]
                        }
                        fill={
                            fill ||
                            defaultChartConfig.colors[
                                index % defaultChartConfig.colors.length
                            ]
                        }
                        {...(defaultChartConfig.area as AreaProps)}
                        {...rest}
                    />
                ))}
                {typeof children === 'function'
                    ? children(defaultChartConfig)
                    : children}
            </RechartArea>
        </ChartContainer>
    )
}

export default AreaChart

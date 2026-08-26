import { PieChart as RechartPie, Pie, Cell, Tooltip } from 'recharts'
import ChartContainer from './ChartContainer'
import ChartTooltipContent from './ChartTooltipContent'
import { defaultChartConfig } from './configs'
import type { BaseChartProps } from './types'
import type { PieProps as RechartPieProps } from 'recharts'
import type { SVGAttributes, ReactNode } from 'react'

type PieProps = Omit<RechartPieProps, 'ref'>

type PieChartProps = Omit<BaseChartProps, 'xAxisConfig'> & {
    pieConfig: Omit<PieProps, 'data'>
    cellConfig?: Array<SVGAttributes<SVGElement>>
    pieContent?: ReactNode
}

const PieChart = (props: PieChartProps) => {
    const {
        data,
        pieConfig = {},
        cellConfig = [],
        pieContent,
        height = 300,
        width,
        tooltipConfig = {},
        tooltipContentConfig,
        children,
        chartHorizontalSpace = 20,
        chartVerticalSpace = 10,
    } = props

    return (
        <ChartContainer className="pie-chart" height={height} width={width}>
            <RechartPie
                height={height}
                data={data}
                margin={{
                    left: chartHorizontalSpace,
                    right: chartHorizontalSpace,
                    top: chartVerticalSpace,
                    bottom: chartVerticalSpace,
                }}
            >
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
                <Pie data={data} dataKey="" {...pieConfig}>
                    {pieContent}
                    {data.map((_, index) => (
                        <Cell
                            fill={
                                defaultChartConfig.colors[
                                    index % defaultChartConfig.colors.length
                                ]
                            }
                            {...(cellConfig[index] || {})}
                            key={`cell-${index}`}
                        />
                    ))}
                </Pie>
                {typeof children === 'function'
                    ? children(defaultChartConfig)
                    : children}
            </RechartPie>
        </ChartContainer>
    )
}

export default PieChart

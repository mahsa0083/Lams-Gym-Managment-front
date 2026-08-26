import {
    RadarChart as RechartRadar,
    Radar,
    PolarGrid,
    Tooltip,
    PolarAngleAxis,
} from 'recharts'
import ChartContainer from './ChartContainer'
import ChartTooltipContent from './ChartTooltipContent'
import { defaultChartConfig } from './configs'
import type {
    RadarProps as RechartRadarProps,
    PolarAngleAxisProps,
} from 'recharts'
import type { BaseChartProps } from './types'

type RadarProps = Omit<RechartRadarProps, 'ref'>

type RadarChartProps = Omit<BaseChartProps, 'xAxisConfig'> & {
    radarConfig: Array<RadarProps>
    angleAxisConfig?: Omit<PolarAngleAxisProps, 'ref'>
}

const RadarChart = (props: RadarChartProps) => {
    const {
        data,
        radarConfig = [],
        height = 300,
        width,
        tooltipConfig = {},
        tooltipContentConfig,
        angleAxisConfig = {},
        children,
        chartHorizontalSpace = 20,
        chartVerticalSpace = 10,
    } = props

    return (
        <ChartContainer className="radar-chart" height={height} width={width}>
            <RechartRadar
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
                <PolarGrid />
                <PolarAngleAxis {...angleAxisConfig} />
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
                {radarConfig.map(({ fill, ...rest }, index) => (
                    <Radar
                        key={index}
                        fill={
                            fill ||
                            defaultChartConfig.colors[
                                index % defaultChartConfig.colors.length
                            ]
                        }
                        {...(defaultChartConfig.radar as RadarProps)}
                        {...rest}
                    />
                ))}
                {typeof children === 'function'
                    ? children(defaultChartConfig)
                    : children}
            </RechartRadar>
        </ChartContainer>
    )
}

export default RadarChart

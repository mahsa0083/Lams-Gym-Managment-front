import { colors } from '@/constants/colors.constant'
import type { CurveType } from 'recharts/types/shape/Curve'

export const defaultColors = [
    colors.blue.chart,
    colors.purple.chart,
    colors.emerald.chart,
    colors.yellow.chart,
    colors.red.chart,
    colors.orange.chart,
    colors.cyan.chart,
    colors.rose.chart,
    colors.lime.chart,
    colors.gray.chart,
]

export const defaultLineConfig = {
    type: 'natural' as CurveType,
    strokeWidth: 2,
    dot: false,
}

export const defaultAreaConfig = {
    type: 'natural' as CurveType,
    strokeWidth: 2,
}

export const defaultBarConfig = {
    radius: 8,
}

export const defaultPieConfig = {
    cx: '50%',
    cy: '50%',
    labelLine: false,
}

export const defaultRadarConfig = {
    fillOpacity: 0.8,
}

export const defaultXAxisConfig = {
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
}

export const defaultYAxisConfig = {
    domain: ['auto', 'auto'],
    hide: true,
}

export const defaultChartConfig = {
    line: defaultLineConfig,
    area: defaultAreaConfig,
    bar: defaultBarConfig,
    pie: defaultPieConfig,
    radar: defaultRadarConfig,
    XAxis: defaultXAxisConfig,
    YAxis: defaultYAxisConfig,
    colors: defaultColors,
}

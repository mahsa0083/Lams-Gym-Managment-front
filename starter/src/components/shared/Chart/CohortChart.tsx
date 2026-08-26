import { useMemo } from 'react'
import classNames from '@/utils/classNames'
import { defaultChartConfig } from './configs'
import type { ReactNode } from 'react'

// Types for cohort data
export interface CohortDataPoint {
    percentage: number
    value: number
}

export interface CohortEntry {
    size: number
    periods: (CohortDataPoint | null)[]
}

export interface CohortChartData {
    [cohortKey: string]: CohortEntry
}

export interface CohortChartProps {
    data: CohortChartData
    timeUnits?: string[]
    valueFormatter?: (value: number) => string
    onCohortSelect?: (cohortKey: string, cohortData: CohortEntry) => void
    selectedCohort?: string | null
    minValue?: number
    maxValue?: number
    emptyCellContent?: ReactNode
    showLegend?: boolean
    legendTitle?: string
    className?: string
    height?: number
    width?: number
    colors?: string[] // Custom colors for the chart
    children?: ReactNode | ((props: typeof defaultChartConfig) => ReactNode)
    // Text customization props
    cohortHeaderText?: string
    sizeLabelText?: string
    percentageSuffix?: string
    defaultPeriodText?: string
    customPeriodCell?: (period: CohortDataPoint | null) => ReactNode
    customerCohortCell?: (cohort: { key: string; value: string }) => ReactNode
}

const getBackgroundColor = (
    value: number,
    min: number,
    max: number,
    baseColor: string,
): { backgroundColor: string; textColor: string } => {
    const normalizedValue = Math.max(
        0,
        Math.min(1, (value - min) / (max - min)),
    )

    // Convert hex to RGB for opacity manipulation
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calculate opacity based on normalized value
    let opacity = 0.1
    if (normalizedValue <= 0.1) opacity = 0.1
    else if (normalizedValue <= 0.2) opacity = 0.2
    else if (normalizedValue <= 0.3) opacity = 0.3
    else if (normalizedValue <= 0.4) opacity = 0.4
    else if (normalizedValue <= 0.5) opacity = 0.5
    else if (normalizedValue <= 0.6) opacity = 0.6
    else if (normalizedValue <= 0.7) opacity = 0.7
    else if (normalizedValue <= 0.8) opacity = 0.8
    else if (normalizedValue <= 0.9) opacity = 0.9
    else opacity = 1.0

    const backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`

    // Assume a white background for luminance calculation
    const bgR = r * opacity + 255 * (1 - opacity)
    const bgG = g * opacity + 255 * (1 - opacity)
    const bgB = b * opacity + 255 * (1 - opacity)

    // Determine text color based on background brightness
    const luminance = (0.299 * bgR + 0.587 * bgG + 0.114 * bgB) / 255
    const textColor = luminance > 0.5 ? '#000' : '#fff'

    return { backgroundColor, textColor }
}

const CohortChart = ({
    data,
    timeUnits = [],
    valueFormatter = (value: number) => value.toLocaleString(),
    onCohortSelect,
    selectedCohort = null,
    minValue = 0,
    maxValue = 100,
    emptyCellContent,
    showLegend = true,
    legendTitle = 'Retention Rate',
    className,
    height,
    width,
    colors = defaultChartConfig.colors,
    children,
    cohortHeaderText = 'Cohort',
    sizeLabelText = 'Size',
    percentageSuffix = '%',
    defaultPeriodText = 'Period',
    customPeriodCell,
    customerCohortCell,
    ...rest
}: CohortChartProps) => {
    // Generate time units if not provided
    const generatedTimeUnits = useMemo(() => {
        if (timeUnits.length > 0) return timeUnits

        const maxPeriods = Math.max(
            ...Object.values(data).map((cohort) => cohort.periods.length),
        )
        return Array.from(
            { length: maxPeriods },
            (_, i) => `${defaultPeriodText} ${i + 1}`,
        )
    }, [timeUnits, data, defaultPeriodText])

    // Get all unique values for color scaling
    const allValues = useMemo(() => {
        const values: number[] = []
        Object.values(data).forEach((cohort) => {
            cohort.periods.forEach((period) => {
                if (period !== null) {
                    values.push(period.percentage)
                }
            })
        })
        return values
    }, [data])

    const actualMinValue =
        minValue === 0 && allValues.length > 0
            ? Math.min(...allValues)
            : minValue
    const actualMaxValue =
        maxValue === 100 && allValues.length > 0
            ? Math.max(...allValues)
            : maxValue

    const handleCohortClick = (cohortKey: string, cohortData: CohortEntry) => {
        onCohortSelect?.(cohortKey, cohortData)
    }

    const renderLegend = () => {
        if (!showLegend) return null

        const legendSteps = 10
        const stepSize = (actualMaxValue - actualMinValue) / legendSteps

        return (
            <div className="mt-6 flex flex-col items-center">
                <div className="mb-2 font-medium heading-text">
                    {legendTitle}
                </div>
                <div className="flex items-center gap-2">
                    <span>
                        {actualMinValue.toFixed(1)}
                        {percentageSuffix}
                    </span>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: legendSteps + 1 }, (_, i) => {
                            const value = actualMinValue + i * stepSize
                            const { backgroundColor } = getBackgroundColor(
                                value,
                                actualMinValue,
                                actualMaxValue,
                                colors[0],
                            )

                            return (
                                <div
                                    key={i}
                                    className="h-2 w-4 rounded-xs sm:h-4 sm:w-8 sm:rounded-sm"
                                    style={{ backgroundColor }}
                                    title={`${value.toFixed(
                                        1,
                                    )}${percentageSuffix}`}
                                />
                            )
                        })}
                    </div>
                    <span>
                        {actualMaxValue.toFixed(1)}
                        {percentageSuffix}
                    </span>
                </div>
            </div>
        )
    }

    const renderEmptyCell = () => {
        if (emptyCellContent) {
            return (
                <div className="flex h-16 flex-col justify-center rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900/50">
                    {emptyCellContent}
                </div>
            )
        }

        return (
            <div className="flex h-16 flex-col justify-center rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="h-3 w-12 rounded-sm bg-gray-200 dark:bg-gray-700" />
                <div className="mt-1 h-3 w-8 rounded-sm bg-gray-200 dark:bg-gray-700" />
            </div>
        )
    }

    return (
        <div
            className={classNames('cohort-chart w-full', className)}
            style={{ height, width: width || '100%' }}
            {...rest}
        >
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 top-0 z-10 min-w-48 p-3 text-left bg-white dark:bg-gray-800">
                                <div className="flex flex-col">
                                    <span className="font-semibold heading-text">
                                        {cohortHeaderText}
                                    </span>
                                    <span className="text-xs font-normal">
                                        {sizeLabelText}
                                    </span>
                                </div>
                            </th>
                            {generatedTimeUnits.map((unit, index) => (
                                <th
                                    key={index}
                                    className="min-w-20 p-3 text-center font-medium heading-text text-nowrap"
                                >
                                    {unit}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data).map(([cohortKey, cohortData]) => (
                            <tr key={cohortKey} className="group">
                                <td className="sticky left-0 z-10 h-16 p-0 bg-white dark:bg-gray-800">
                                    <button
                                        className={classNames(
                                            'group relative h-full w-full rounded-lg p-3 text-left transition-all hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                                            selectedCohort === cohortKey &&
                                                'bg-gray-100 dark:bg-gray-900',
                                        )}
                                        onClick={() =>
                                            handleCohortClick(
                                                cohortKey,
                                                cohortData,
                                            )
                                        }
                                        type="button"
                                    >
                                        <div className="flex flex-col">
                                            {customerCohortCell ? (
                                                customerCohortCell({
                                                    key: cohortKey,
                                                    value: valueFormatter(
                                                        cohortData.size,
                                                    ),
                                                })
                                            ) : (
                                                <>
                                                    <span className="font-medium heading-text">
                                                        {cohortKey}
                                                    </span>
                                                    <span className="text-xs">
                                                        {valueFormatter(
                                                            cohortData.size,
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </td>
                                {cohortData.periods.map(
                                    (periodData, periodIndex) => {
                                        if (periodData === null) {
                                            return (
                                                <td
                                                    key={periodIndex}
                                                    className={classNames(
                                                        'h-16 min-w-20 p-1',
                                                    )}
                                                >
                                                    {renderEmptyCell()}
                                                </td>
                                            )
                                        }

                                        const { backgroundColor, textColor } =
                                            getBackgroundColor(
                                                periodData.percentage,
                                                actualMinValue,
                                                actualMaxValue,
                                                colors[0],
                                            )

                                        return (
                                            <td
                                                key={periodIndex}
                                                className={classNames(
                                                    'h-16 min-w-20 p-1',
                                                )}
                                            >
                                                <div
                                                    className={classNames(
                                                        'flex h-full flex-col justify-center rounded px-3 py-2 transition-all',
                                                    )}
                                                    style={{
                                                        backgroundColor,
                                                    }}
                                                >
                                                    {customPeriodCell ? (
                                                        customPeriodCell(
                                                            periodData,
                                                        )
                                                    ) : (
                                                        <>
                                                            <span
                                                                className="font-medium"
                                                                style={{
                                                                    color: textColor,
                                                                }}
                                                            >
                                                                {periodData.percentage.toFixed(
                                                                    1,
                                                                )}
                                                                {
                                                                    percentageSuffix
                                                                }
                                                            </span>
                                                            <span
                                                                className="text-xs"
                                                                style={{
                                                                    color: textColor,
                                                                }}
                                                            >
                                                                {
                                                                    periodData.value
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )
                                    },
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {renderLegend()}

            {typeof children === 'function'
                ? children(defaultChartConfig)
                : children}
        </div>
    )
}

export default CohortChart

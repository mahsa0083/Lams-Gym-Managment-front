import { useMemo } from 'react'
import classNames from '@/utils/classNames'
import type { TooltipContentProps } from 'recharts'
import type { ComponentProps } from 'react'
import type { ChartTooltipContentConfig as ChartTooltipContentOwnProps } from './types'
type ValueType = number | string | Array<number | string>
type NameType = number | string

// Recharts injects these at runtime, so we make them optional for the component definition
type RechartsInjectedProps = Partial<TooltipContentProps<ValueType, NameType>>

const ChartTooltipContent = (
    props: RechartsInjectedProps &
        ComponentProps<'div'> &
        ChartTooltipContentOwnProps,
) => {
    const {
        active,
        payload,
        className,
        customContent,
        hideLabel = false,
        hideIndicator = false,
        label,
        labelFormatter,
        labelClassName,
        nameFormatter,
        valueFormatter,
    } = props

    const tooltipLabel = useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null
        }

        const value = label

        if (labelFormatter) {
            return (
                <div
                    className={classNames(
                        'recharts-custom-tooltip-label',
                        labelClassName,
                    )}
                >
                    {labelFormatter(value, payload)}
                </div>
            )
        }

        if (!value) {
            return null
        }

        return (
            <div
                className={classNames(
                    'recharts-custom-tooltip-label',
                    labelClassName,
                )}
            >
                {value}
            </div>
        )
    }, [hideLabel, payload, label, labelFormatter, labelClassName])

    if (!active || !payload?.length) {
        return null
    }

    const nestLabel = payload.length === 1

    return (
        <div className={classNames('recharts-custom-tooltip', className)}>
            {customContent ? (
                customContent(props as TooltipContentProps<ValueType, NameType>)
            ) : (
                <div className="recharts-custom-tooltip-content">
                    {tooltipLabel}
                    <div className="grid gap-1.5 mt-1.5">
                        {payload.map((item) => {
                            return (
                                <div
                                    key={item.dataKey}
                                    className={classNames(
                                        'recharts-custom-tooltip-item',
                                    )}
                                >
                                    <>
                                        {!hideIndicator && (
                                            <div
                                                className="recharts-custom-tooltip-indicator"
                                                style={{
                                                    backgroundColor:
                                                        item.color ||
                                                        item.payload?.fill,
                                                }}
                                            />
                                        )}
                                        <div
                                            className={classNames(
                                                'recharts-custom-tooltip-item-data',
                                                nestLabel
                                                    ? 'items-end'
                                                    : 'items-center',
                                            )}
                                        >
                                            <div className="grid gap-1.5">
                                                <span className="recharts-custom-tooltip-item-value">
                                                    {nameFormatter
                                                        ? nameFormatter(
                                                              item.name,
                                                              item,
                                                          )
                                                        : item.name}
                                                </span>
                                            </div>
                                            {item.value && (
                                                <span className="recharts-custom-tooltip-item-value">
                                                    {valueFormatter
                                                        ? valueFormatter(
                                                              item.value,
                                                              item,
                                                          )
                                                        : item.value.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChartTooltipContent

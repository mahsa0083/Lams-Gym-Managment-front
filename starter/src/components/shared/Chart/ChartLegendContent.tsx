import { Legend as RechartLegend, LegendPayload } from 'recharts'
import classNames from '@/utils/classNames'
import type { ComponentProps, ReactNode } from 'react'

type LegendProps = ComponentProps<typeof RechartLegend>

type ChartLegendContentProps = LegendProps & {
    customContent?: (props: readonly LegendPayload[] | undefined) => ReactNode
}

const ChartLegendContent = (props: ChartLegendContentProps) => {
    const {
        className,
        customContent,
        verticalAlign = 'bottom',
        ...rest
    } = props

    return (
        <RechartLegend
            content={(props) => {
                const { payload } = props
                return (
                    <div
                        className={classNames(
                            'recharts-custom-legend',
                            verticalAlign === 'top' ? 'pb-3' : 'pt-3',
                            className,
                        )}
                    >
                        {customContent
                            ? customContent(payload)
                            : payload &&
                              payload.map((item) => {
                                  return (
                                      <div
                                          key={item.value}
                                          className={classNames(
                                              'recharts-custom-legend-item',
                                          )}
                                      >
                                          <div
                                              className="recharts-custom-legend-indicator"
                                              style={{
                                                  backgroundColor: item.color,
                                              }}
                                          />
                                          <span className="recharts-custom-legend-item-value">
                                              {item.value}
                                          </span>
                                      </div>
                                  )
                              })}
                    </div>
                )
            }}
            verticalAlign={verticalAlign}
            {...rest}
        />
    )
}

export default ChartLegendContent

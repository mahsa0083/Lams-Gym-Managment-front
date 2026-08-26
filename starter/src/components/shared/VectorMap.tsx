import classNames from '@/utils/classNames'
import { useState, useRef, useEffect } from 'react'
import type { ReactNode, SVGProps } from 'react'

type VectorMapLayer = {
    id: string
    name: string
    d: string
}

type LayerProps = SVGProps<SVGPathElement> & {
    onClick?: (layerId: string) => void
    hover?: {
        tooltipContent?: ReactNode | string
    }
}

type VectorMapProps = SVGProps<SVGSVGElement> & {
    children?: ReactNode
    id: string
    name: string
    viewBox: string
    layers: VectorMapLayer[]
    tabIndex?: number
    layerProps?: (layer: VectorMapLayer) => LayerProps
    checkedLayers?: string[]
    currentLayers?: string[]
}

function VectorMap({
    id,
    name,
    layers,
    tabIndex = 0,
    layerProps,
    children,
    ...rest
}: VectorMapProps) {
    const [tooltip, setTooltip] = useState<{
        content: ReactNode | string
        x: number
        y: number
    } | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (tooltip) {
                setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
                )
            }
        }

        if (tooltip) {
            window.addEventListener('mousemove', handleMouseMove)
            return () =>
                window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [tooltip])

    if (!layers || layers.length === 0) {
        console.error(`'layers' prop requires at least one layer.`)
        return null
    }

    const handleMouseEnter = (
        tooltipContent: ReactNode | string | undefined,
        e: React.MouseEvent,
    ) => {
        if (tooltipContent) {
            setTooltip({
                content: tooltipContent,
                x: e.clientX,
                y: e.clientY,
            })
        }
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    return (
        <>
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                key={id}
                aria-label={name}
                {...rest}
            >
                {children}
                {layers.map((layer) => {
                    const computedLayerProps = layerProps
                        ? layerProps(layer)
                        : {}
                    const {
                        className: layerClassName,
                        hover,
                        onClick,
                        ...otherLayerProps
                    } = computedLayerProps

                    return (
                        <path
                            key={layer.id}
                            tabIndex={tabIndex}
                            aria-label={layer.name}
                            d={layer.d}
                            {...otherLayerProps}
                            className={classNames(
                                'outline-none fill-gray-300 dark:fill-gray-600',
                                layerClassName,
                            )}
                            onMouseEnter={(e) =>
                                handleMouseEnter(hover?.tooltipContent, e)
                            }
                            onMouseLeave={handleMouseLeave}
                            onClick={
                                onClick ? () => onClick(layer.id) : undefined
                            }
                            style={{
                                cursor: onClick
                                    ? 'pointer'
                                    : hover?.tooltipContent
                                      ? 'pointer'
                                      : 'default',
                            }}
                        />
                    )
                })}
            </svg>

            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: `${tooltip.x + 12}px`,
                        top: `${tooltip.y + 12}px`,
                    }}
                >
                    <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700 max-w-xs">
                        {tooltip.content}
                    </div>
                </div>
            )}
        </>
    )
}

export default VectorMap

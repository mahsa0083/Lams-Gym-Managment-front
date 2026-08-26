import React from 'react'
import type { IconProps } from './types'

interface IconData {
    tag: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attr: Record<string, any>
    child: IconData[]
}

export const GenIcon = (data: IconData) => (props: IconProps) => {
    const { className, style, size = '1em', ...restProps } = props

    const renderElement = (
        element: IconData,
        key?: string | number,
    ): React.ReactElement => {
        const { tag, attr, child } = element

        // For the root SVG element, apply the props
        if (tag === 'svg') {
            const svgProps = {
                ...attr,
                ...restProps,
                className,
                style,
                width: size,
                height: size,
            }

            return React.createElement(
                tag,
                { ...svgProps, key },
                child.map((c, i) => renderElement(c, i)),
            )
        }

        return React.createElement(
            tag,
            { ...attr, key },
            child.length > 0
                ? child.map((c, i) => renderElement(c, i))
                : undefined,
        )
    }

    return renderElement(data)
}

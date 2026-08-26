import { useState } from 'react'
import { useScrollContext } from './context'
import useResizeObserver from '../hooks/useResizeObserver'
import type { ComponentProps, Ref } from 'react'

type ScrollCornerProps = ComponentProps<'div'> & {
    ref?: Ref<HTMLDivElement>
}

export const Corner = (props: ScrollCornerProps) => {
    const { style, ref, ...rest } = props
    const context = useScrollContext()
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const hasSize = Boolean(width && height)

    useResizeObserver(context.scrollbarX, () => {
        const h = context.scrollbarX?.offsetHeight || 0
        context.onCornerHeightChange(h)
        setHeight(h)
    })

    useResizeObserver(context.scrollbarY, () => {
        const w = context.scrollbarY?.offsetWidth || 0
        context.onCornerWidthChange(w)
        setWidth(w)
    })

    return hasSize ? (
        <div {...rest} ref={ref} style={{ ...style, width, height }} />
    ) : null
}

const ScrollCorner = (props: ScrollCornerProps) => {
    const context = useScrollContext()
    const hasBothScrollbarsVisible = Boolean(
        context.scrollbarX && context.scrollbarY,
    )
    const hasCorner = context.type !== 'scroll' && hasBothScrollbarsVisible
    return hasCorner ? <Corner {...props} /> : null
}

export default ScrollCorner

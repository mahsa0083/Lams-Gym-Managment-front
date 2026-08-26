import { useState } from 'react'
import { useScrollContext } from '../context'
import useResizeObserver from '../../hooks/useResizeObserver'
import useDebouncedCallback from '../../hooks/useDebounceCallback'
import ScrollbarVisible from './ScrollbarVisible'
import type { ScrollbarVisibleProps } from './ScrollbarVisible'

export interface ScrollbarAutoProps extends ScrollbarVisibleProps {
    forceMount?: true
}

const ScrollbarAuto = (props: ScrollbarAutoProps) => {
    const context = useScrollContext()
    const { forceMount, ref, ...scrollbarProps } = props
    const [visible, setVisible] = useState(false)
    const isHorizontal = props.orientation === 'horizontal'

    const handleResize = useDebouncedCallback(() => {
        if (context.viewport) {
            const isOverflowX =
                context.viewport.offsetWidth < context.viewport.scrollWidth
            const isOverflowY =
                context.viewport.offsetHeight < context.viewport.scrollHeight
            setVisible(isHorizontal ? isOverflowX : isOverflowY)
        }
    }, 10)

    useResizeObserver(context.viewport, handleResize)
    useResizeObserver(context.content, handleResize)

    if (forceMount || visible) {
        return (
            <ScrollbarVisible
                data-state={visible ? 'visible' : 'hidden'}
                {...scrollbarProps}
                ref={ref}
            />
        )
    }

    return null
}

export default ScrollbarAuto

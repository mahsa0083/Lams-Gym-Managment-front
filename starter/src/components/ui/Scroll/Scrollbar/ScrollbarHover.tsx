import { useEffect, useState } from 'react'
import { useScrollContext } from '../context'
import ScrollbarAuto from './ScrollbarAuto'
import type { ScrollbarAutoProps } from './ScrollbarAuto'

interface ScrollbarHoverProps extends ScrollbarAutoProps {
    forceMount?: true
}

const ScrollAreaScrollbarHover = (props: ScrollbarHoverProps) => {
    const { forceMount, ref, ...scrollbarProps } = props
    const context = useScrollContext()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const { scrollArea } = context
        let hideTimer = 0
        if (scrollArea) {
            const handlePointerEnter = () => {
                window.clearTimeout(hideTimer)
                setVisible(true)
            }
            const handlePointerLeave = () => {
                hideTimer = window.setTimeout(
                    () => setVisible(false),
                    context.scrollHideDelay,
                )
            }
            scrollArea.addEventListener('pointerenter', handlePointerEnter)
            scrollArea.addEventListener('pointerleave', handlePointerLeave)

            return () => {
                window.clearTimeout(hideTimer)
                scrollArea.removeEventListener(
                    'pointerenter',
                    handlePointerEnter,
                )
                scrollArea.removeEventListener(
                    'pointerleave',
                    handlePointerLeave,
                )
            }
        }

        return undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.scrollArea, context.scrollHideDelay])

    if (forceMount || visible) {
        return (
            <ScrollbarAuto
                data-state={visible ? 'visible' : 'hidden'}
                {...scrollbarProps}
                ref={ref}
            />
        )
    }

    return null
}

export default ScrollAreaScrollbarHover

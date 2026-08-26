import { useRef, useState } from 'react'
import { useConfig } from '../../ConfigProvider'
import { useScrollContext } from '../context'
import { ScrollbarAxisPrivateProps, ScrollbarAxisProps, Sizes } from '../types'
import getScrollPositionFromPointer from '../utils/getScrollPositionFromPointer'
import getThumbRatio from '../utils/getThumbRatio'
import getThumbOffsetFromScroll from '../utils/getThumbOffsetFromScroll'
import ScrollbarX from './ScrollbarX'
import ScrollbarY from './ScrollbarY'

export interface ScrollbarVisibleProps extends Omit<
    ScrollbarAxisProps,
    keyof ScrollbarAxisPrivateProps
> {
    orientation?: 'horizontal' | 'vertical'
}

const ScrollbarVisible = (props: ScrollbarVisibleProps) => {
    const {
        orientation = 'vertical',
        ref: forwardedRef,
        ...scrollbarProps
    } = props
    const { direction } = useConfig()
    const context = useScrollContext()
    const thumbRef = useRef<HTMLDivElement | null>(null)
    const pointerOffsetRef = useRef(0)
    const [sizes, setSizes] = useState<Sizes>({
        content: 0,
        viewport: 0,
        scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
    })

    const thumbRatio = getThumbRatio(sizes.viewport, sizes.content)

    const commonProps: Omit<
        ScrollbarAxisPrivateProps,
        'onThumbPositionChange' | 'onDragScroll' | 'onWheelScroll'
    > = {
        ...scrollbarProps,
        sizes,
        onSizesChange: setSizes,
        hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
        onThumbChange: (thumb) => {
            thumbRef.current = thumb
        },
        onThumbPointerUp: () => {
            pointerOffsetRef.current = 0
        },
        onThumbPointerDown: (pointerPos) => {
            pointerOffsetRef.current = pointerPos
        },
    }

    const getScrollPosition = (pointerPos: number, direction?: 'ltr' | 'rtl') =>
        getScrollPositionFromPointer(
            pointerPos,
            pointerOffsetRef.current,
            sizes,
            direction,
        )

    if (orientation === 'horizontal') {
        return (
            <ScrollbarX
                {...commonProps}
                ref={forwardedRef}
                onThumbPositionChange={() => {
                    if (context.viewport && thumbRef.current) {
                        const scrollPos = context.viewport.scrollLeft
                        const offset = getThumbOffsetFromScroll(
                            scrollPos,
                            sizes,
                            direction,
                        )
                        thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`
                    }
                }}
                onWheelScroll={(scrollPos) => {
                    if (context.viewport) {
                        context.viewport.scrollLeft = scrollPos
                    }
                }}
                onDragScroll={(pointerPos) => {
                    if (context.viewport) {
                        context.viewport.scrollLeft = getScrollPosition(
                            pointerPos,
                            direction,
                        )
                    }
                }}
            />
        )
    }

    if (orientation === 'vertical') {
        return (
            <ScrollbarY
                {...commonProps}
                ref={forwardedRef}
                onThumbPositionChange={() => {
                    if (context.viewport && thumbRef.current) {
                        const scrollPos = context.viewport.scrollTop
                        const offset = getThumbOffsetFromScroll(
                            scrollPos,
                            sizes,
                        )
                        if (sizes.scrollbar.size === 0) {
                            thumbRef.current.style.setProperty(
                                '--scroll-thumb-opacity',
                                '0',
                            )
                        } else {
                            thumbRef.current.style.setProperty(
                                '--scroll-thumb-opacity',
                                '1',
                            )
                        }
                        thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`
                    }
                }}
                onWheelScroll={(scrollPos) => {
                    if (context.viewport) {
                        context.viewport.scrollTop = scrollPos
                    }
                }}
                onDragScroll={(pointerPos) => {
                    if (context.viewport) {
                        context.viewport.scrollTop =
                            getScrollPosition(pointerPos)
                    }
                }}
            />
        )
    }

    return null
}

export default ScrollbarVisible

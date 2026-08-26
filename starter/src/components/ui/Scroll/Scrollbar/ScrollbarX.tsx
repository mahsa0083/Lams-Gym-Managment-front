import { useEffect, useRef, useState } from 'react'
import useMergedRef from '../../hooks/useMergeRef'
import { useScrollContext } from '../context'
import { ScrollbarAxisProps } from '../types'
import getThumbSize from '../utils/getThumbSize'
import isScrollingWithinScrollbarBounds from '../utils/isScrollingWithinScrollbarBounds'
import toInt from '../utils/toInt'
import Scrollbar from './Bar'

interface ScrollbarXProps extends ScrollbarAxisProps {
    ref?: React.Ref<HTMLDivElement>
}

function ScrollbarX({
    ref: forwardedRef,
    sizes,
    onSizesChange,
    onThumbPointerDown,
    onDragScroll,
    onWheelScroll,
    style,
    ...rest
}: ScrollbarXProps) {
    const ctx = useScrollContext()
    const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration>()
    const ref = useRef<HTMLDivElement>(null)
    const composeRefs = useMergedRef(
        forwardedRef ?? null,
        ref,
        ctx.onScrollbarXChange,
    )

    useEffect(() => {
        if (ref.current) {
            setComputedStyle(getComputedStyle(ref.current))
        }
    }, [ref])

    return (
        <Scrollbar
            data-orientation="horizontal"
            {...rest}
            ref={composeRefs}
            sizes={sizes}
            style={{
                ...style,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--scroll-thumb-width' as any]: `${getThumbSize(sizes)}px`,
            }}
            onThumbPointerDown={(pointerPos) =>
                onThumbPointerDown(pointerPos.x)
            }
            onDragScroll={(pointerPos) => onDragScroll(pointerPos.x)}
            onWheelScroll={(event, maxScrollPos) => {
                if (ctx.viewport) {
                    const scrollPos = ctx.viewport.scrollLeft + event.deltaX
                    onWheelScroll(scrollPos)
                    if (
                        isScrollingWithinScrollbarBounds(
                            scrollPos,
                            maxScrollPos,
                        )
                    ) {
                        event.preventDefault()
                    }
                }
            }}
            onResize={() => {
                if (ref.current && ctx.viewport && computedStyle) {
                    onSizesChange({
                        content: ctx.viewport.scrollWidth,
                        viewport: ctx.viewport.offsetWidth,
                        scrollbar: {
                            size: ref.current.clientWidth,
                            paddingStart: toInt(computedStyle.paddingLeft),
                            paddingEnd: toInt(computedStyle.paddingRight),
                        },
                    })
                }
            }}
        />
    )
}

export default ScrollbarX

import { useEffect, useRef, useState } from 'react'
import useMergedRef from '../../hooks/useMergeRef'
import { useScrollContext } from '../context'
import { ScrollbarAxisProps } from '../types'
import getThumbSize from '../utils/getThumbSize'
import isScrollingWithinScrollbarBounds from '../utils/isScrollingWithinScrollbarBounds'
import toInt from '../utils/toInt'
import Scrollbar from './Bar'

interface ScrollbarYProps extends ScrollbarAxisProps {
    ref?: React.Ref<HTMLDivElement>
}

function ScrollbarY({
    ref: forwardedRef,
    sizes,
    onSizesChange,
    onThumbPointerDown,
    onDragScroll,
    onWheelScroll,
    style,
    ...rest
}: ScrollbarYProps) {
    const context = useScrollContext()
    const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration>()
    const ref = useRef<HTMLDivElement>(null)
    const composeRefs = useMergedRef(
        forwardedRef ?? null,
        ref,
        context.onScrollbarYChange,
    )

    useEffect(() => {
        if (ref.current) {
            setComputedStyle(window.getComputedStyle(ref.current))
        }
    }, [])

    return (
        <Scrollbar
            {...rest}
            data-orientation="vertical"
            ref={composeRefs}
            sizes={sizes}
            style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--scroll-thumb-height' as any]: `${getThumbSize(sizes)}px`,
                ...style,
            }}
            onThumbPointerDown={(pointerPos) =>
                onThumbPointerDown(pointerPos.y)
            }
            onDragScroll={(pointerPos) => onDragScroll(pointerPos.y)}
            onWheelScroll={(event, maxScrollPos) => {
                if (context.viewport) {
                    const scrollPos = context.viewport.scrollTop + event.deltaY
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
                if (ref.current && context.viewport && computedStyle) {
                    onSizesChange({
                        content: context.viewport.scrollHeight,
                        viewport: context.viewport.offsetHeight,
                        scrollbar: {
                            size: ref.current.clientHeight,
                            paddingStart: toInt(computedStyle.paddingTop),
                            paddingEnd: toInt(computedStyle.paddingBottom),
                        },
                    })
                }
            }}
        />
    )
}

export default ScrollbarY

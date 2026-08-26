import { useState } from 'react'
import useMergedRef from '../hooks/useMergeRef'
import { ScrollAreaProvider } from './context'
import type { ComponentProps, Ref } from 'react'
import type { ScrollType } from './types'

export interface ScrollRootStylesCtx {
    cornerWidth: number
    cornerHeight: number
}

export interface ScrollRootProps extends ComponentProps<'div'> {
    type?: ScrollType
    scrollbars?: 'horizontal' | 'vertical' | 'both'
    scrollHideDelay?: number
    ref?: Ref<HTMLDivElement>
}

const ScrollRoot = (props: ScrollRootProps) => {
    const {
        type,
        scrollHideDelay,
        scrollbars,
        style,
        ref = null,
        ...rest
    } = props

    const [scrollArea, setScrollArea] = useState<HTMLDivElement | null>(null)
    const [viewport, setViewport] = useState<HTMLDivElement | null>(null)
    const [content, setContent] = useState<HTMLDivElement | null>(null)
    const [scrollbarX, setScrollbarX] = useState<HTMLDivElement | null>(null)
    const [scrollbarY, setScrollbarY] = useState<HTMLDivElement | null>(null)
    const [cornerWidth, setCornerWidth] = useState(0)
    const [cornerHeight, setCornerHeight] = useState(0)
    const [scrollbarXEnabled, setScrollbarXEnabled] = useState(false)
    const [scrollbarYEnabled, setScrollbarYEnabled] = useState(false)
    const rootRef = useMergedRef<HTMLDivElement>(
        (node: HTMLDivElement | null) => setScrollArea(node),
        ref,
    )

    return (
        <ScrollAreaProvider
            value={{
                type: type!,
                scrollHideDelay: scrollHideDelay!,
                scrollArea,
                viewport,
                onViewportChange: setViewport,
                content,
                onContentChange: setContent,
                scrollbarX,
                onScrollbarXChange: setScrollbarX,
                scrollbarXEnabled,
                onScrollbarXEnabledChange: setScrollbarXEnabled,
                scrollbarY,
                onScrollbarYChange: setScrollbarY,
                scrollbarYEnabled,
                onScrollbarYEnabledChange: setScrollbarYEnabled,
                onCornerWidthChange: setCornerWidth,
                onCornerHeightChange: setCornerHeight,
            }}
        >
            <div
                {...rest}
                ref={rootRef}
                style={{
                    ['--scroll-corner-width' as string]:
                        scrollbars !== 'both' ? '0px' : `${cornerWidth}px`,
                    ['--scroll-corner-height' as string]:
                        scrollbars !== 'both' ? '0px' : `${cornerHeight}px`,
                    ...style,
                }}
            />
        </ScrollAreaProvider>
    )
}

export default ScrollRoot

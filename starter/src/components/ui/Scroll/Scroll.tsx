import { useEffect, useRef, useState } from 'react'
import classNames from '../utils/classNames'
import useMergeRef from '../hooks/useMergeRef'
import ScrollCorner from './ScrollCorner'
import ScrollRoot from './ScrollRoot'
import Scrollbar from './Scrollbar'
import ScrollThumb from './ScrollThumb'
import ScrollViewport from './ScrollViewport'
import type { ComponentProps } from 'react'
import type { BaseScrollProps } from './types'

export type ScrollProps = ComponentProps<'div'> & BaseScrollProps

export type ScrollAutosizeProps = ScrollProps

const Scroll = (props: ScrollProps) => {
    const {
        className,
        contentClassName,
        type = 'hover',
        scrollHideDelay = 1000,
        viewportProps,
        viewportRef = null,
        onScrollPositionChange,
        children,
        offsetScrollbars,
        scrollbars = 'both',
        onBottomReached,
        onTopReached,
        scrollbarSize = 4,
        edgeShadow = false,
        ref,
        ...rest
    } = props

    const [scrollbarHovered, setScrollbarHovered] = useState(false)
    const [verticalThumbVisible, setVerticalThumbVisible] = useState(false)
    const [horizontalThumbVisible, setHorizontalThumbVisible] = useState(false)

    const localViewportRef = useRef<HTMLDivElement>(null)
    const combinedViewportRef = useMergeRef(viewportRef, localViewportRef)
    const size =
        typeof scrollbarSize === 'number'
            ? scrollbarSize
            : parseFloat(scrollbarSize)

    useEffect(() => {
        if (!localViewportRef.current) {
            return
        }

        if (offsetScrollbars !== 'present') {
            return
        }

        const element = localViewportRef.current

        const observer = new ResizeObserver(() => {
            const { scrollHeight, clientHeight, scrollWidth, clientWidth } =
                element
            setVerticalThumbVisible(scrollHeight > clientHeight)
            setHorizontalThumbVisible(scrollWidth > clientWidth)
        })

        observer.observe(element)

        return () => observer.disconnect()
    }, [localViewportRef, offsetScrollbars])

    const [showBottomShadow, setShowBottomShadow] = useState(false)
    const [showTopShadow, setShowTopShadow] = useState(false)
    const [showLeftShadow, setShowLeftShadow] = useState(false)
    const [showRightShadow, setShowRightShadow] = useState(false)

    const updateShadow = () => {
        if (edgeShadow) {
            const el = localViewportRef.current
            if (!el) return

            const {
                scrollTop,
                scrollHeight,
                clientHeight,
                scrollLeft,
                scrollWidth,
                clientWidth,
            } = el

            const isScrollableY = scrollHeight > clientHeight
            const isScrollableX = scrollWidth > clientWidth

            const atTop = scrollTop <= 1
            const atBottom = scrollTop + clientHeight >= scrollHeight - 1

            const atLeft = scrollLeft <= 1
            const atRight = scrollLeft + clientWidth >= scrollWidth - 1

            setShowTopShadow(isScrollableY && !atTop)
            setShowBottomShadow(isScrollableY && !atBottom)
            setShowLeftShadow(isScrollableX && !atLeft)
            setShowRightShadow(isScrollableX && !atRight)
        }
    }

    useEffect(() => {
        const el = localViewportRef.current
        if (!el) return

        updateShadow()

        const resizeObserver = new ResizeObserver(updateShadow)
        resizeObserver.observe(el)

        return () => resizeObserver.disconnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ScrollRoot
            type={type === 'never' ? 'always' : type}
            scrollHideDelay={scrollHideDelay}
            ref={ref}
            scrollbars={scrollbars}
            className={classNames('scroll-root', className)}
            {...rest}
        >
            <ScrollViewport
                {...viewportProps}
                contentClassName={contentClassName}
                className={classNames(
                    'scroll-viewport',
                    viewportProps?.className,
                    showTopShadow && 'scroll-shadow-top',
                    showBottomShadow && 'scroll-shadow-bottom',
                    showLeftShadow && 'scroll-shadow-left',
                    showRightShadow && 'scroll-shadow-right',
                )}
                style={viewportProps?.style}
                ref={combinedViewportRef}
                data-offset-scrollbars={
                    offsetScrollbars === true
                        ? 'both'
                        : offsetScrollbars || undefined
                }
                data-scrollbars={scrollbars || undefined}
                data-horizontal-hidden={
                    offsetScrollbars === 'present' && !horizontalThumbVisible
                        ? 'true'
                        : undefined
                }
                data-vertical-hidden={
                    offsetScrollbars === 'present' && !verticalThumbVisible
                        ? 'true'
                        : undefined
                }
                onScroll={(e) => {
                    viewportProps?.onScroll?.(e)
                    onScrollPositionChange?.({
                        x: e.currentTarget.scrollLeft,
                        y: e.currentTarget.scrollTop,
                    })

                    updateShadow()

                    const { scrollTop, scrollHeight, clientHeight } =
                        e.currentTarget
                    if (scrollTop - (scrollHeight - clientHeight) >= 0) {
                        onBottomReached?.()
                    }
                    if (scrollTop === 0) {
                        onTopReached?.()
                    }
                }}
            >
                {children}
            </ScrollViewport>
            {(scrollbars === 'both' || scrollbars === 'horizontal') && (
                <Scrollbar
                    className="scroll-scrollbar"
                    orientation="horizontal"
                    data-hidden={
                        type === 'never' ||
                        (offsetScrollbars === 'present' &&
                            !horizontalThumbVisible)
                            ? true
                            : undefined
                    }
                    forceMount
                    onMouseEnter={() => setScrollbarHovered(true)}
                    onMouseLeave={() => setScrollbarHovered(false)}
                    style={{ height: size }}
                >
                    <ScrollThumb className="thumb" />
                </Scrollbar>
            )}

            {(scrollbars === 'both' || scrollbars === 'vertical') && (
                <Scrollbar
                    className="scroll-scrollbar"
                    orientation="vertical"
                    data-hidden={
                        type === 'never' ||
                        (offsetScrollbars === 'present' &&
                            !verticalThumbVisible)
                            ? true
                            : undefined
                    }
                    forceMount
                    onMouseEnter={() => setScrollbarHovered(true)}
                    onMouseLeave={() => setScrollbarHovered(false)}
                    style={{ width: size }}
                >
                    <ScrollThumb className="thumb" />
                </Scrollbar>
            )}

            <ScrollCorner
                className="corner"
                data-hovered={scrollbarHovered || undefined}
                data-hidden={type === 'never' || undefined}
            />
        </ScrollRoot>
    )
}

export default Scroll

import Scroll from './Scroll'
import type { ComponentProps } from 'react'
import type { BaseScrollProps } from './types'

export type ScrollProps = ComponentProps<'div'> & BaseScrollProps

export type ScrollFlexSizeProps = ScrollProps

const ScrollFlexSize = (props: ScrollFlexSizeProps) => {
    const {
        children,
        scrollbarSize,
        scrollHideDelay,
        type,
        offsetScrollbars,
        viewportRef,
        onScrollPositionChange,
        viewportProps,
        scrollbars,
        onBottomReached,
        onTopReached,
        ref,
        className,
        contentClassName,
        edgeShadow,
        ...rest
    } = props

    return (
        <div {...rest} ref={ref} className="flex overflow-auto">
            <div className="flex flex-col flex-1">
                <Scroll
                    className={className}
                    scrollHideDelay={scrollHideDelay}
                    scrollbarSize={scrollbarSize}
                    type={type}
                    offsetScrollbars={offsetScrollbars}
                    viewportRef={viewportRef}
                    onScrollPositionChange={onScrollPositionChange}
                    viewportProps={viewportProps}
                    scrollbars={scrollbars}
                    onBottomReached={onBottomReached}
                    onTopReached={onTopReached}
                    contentClassName={contentClassName}
                >
                    {children}
                </Scroll>
            </div>
        </div>
    )
}

export default ScrollFlexSize

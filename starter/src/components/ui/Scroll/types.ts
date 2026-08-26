import type { ComponentProps, Ref } from 'react'
export type Sizes = {
    content: number
    viewport: number
    scrollbar: {
        size: number
        paddingStart: number
        paddingEnd: number
    }
}

export interface ScrollbarAxisPrivateProps {
    hasThumb: boolean
    sizes: Sizes
    onSizesChange: (sizes: Sizes) => void
    onThumbChange: (thumb: HTMLDivElement | null) => void
    onThumbPointerDown: (pointerPos: number) => void
    onThumbPointerUp: () => void
    onThumbPositionChange: () => void
    onWheelScroll: (scrollPos: number) => void
    onDragScroll: (pointerPos: number) => void
}

export type BaseScrollProps = {
    scrollbarSize?: number | string
    type?: ScrollType
    scrollHideDelay?: number
    scrollbars?: 'horizontal' | 'vertical' | 'both'
    offsetScrollbars?: boolean | 'horizontal' | 'vertical' | 'present'
    viewportRef?: Ref<HTMLDivElement>
    viewportProps?: ComponentProps<'div'>
    contentClassName?: string
    onScrollPositionChange?: (position: { x: number; y: number }) => void
    onBottomReached?: () => void
    onTopReached?: () => void
    edgeShadow?: boolean
    ref?: Ref<HTMLDivElement>
}

export type ScrollType = 'auto' | 'always' | 'scroll' | 'hover' | 'never'

export type ScrollbarAxisProps = ScrollbarAxisPrivateProps &
    ComponentProps<'div'>

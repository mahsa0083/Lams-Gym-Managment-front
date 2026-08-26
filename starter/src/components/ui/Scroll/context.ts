import { createContext, useContext } from 'react'
import type { ScrollType } from './types'

export interface ScrollAreaContextValue {
    type: ScrollType
    scrollHideDelay: number
    scrollArea: HTMLDivElement | null
    viewport: HTMLDivElement | null
    onViewportChange: (viewport: HTMLDivElement | null) => void
    content: HTMLDivElement | null
    onContentChange: (content: HTMLDivElement) => void
    scrollbarX: HTMLDivElement | null
    onScrollbarXChange: (scrollbar: HTMLDivElement | null) => void
    scrollbarXEnabled: boolean
    onScrollbarXEnabledChange: (rendered: boolean) => void
    scrollbarY: HTMLDivElement | null
    onScrollbarYChange: (scrollbar: HTMLDivElement | null) => void
    scrollbarYEnabled: boolean
    onScrollbarYEnabledChange: (rendered: boolean) => void
    onCornerWidthChange: (width: number) => void
    onCornerHeightChange: (height: number) => void
}

const ScrollAreaContext = createContext<ScrollAreaContextValue>({
    type: 'auto',
    scrollHideDelay: 0,
    scrollArea: null,
    viewport: null,
    onViewportChange: () => {},
    content: null,
    onContentChange: () => {},
    scrollbarX: null,
    onScrollbarXChange: () => {},
    scrollbarXEnabled: false,
    onScrollbarXEnabledChange: () => {},
    scrollbarY: null,
    onScrollbarYChange: () => {},
    scrollbarYEnabled: false,
    onScrollbarYEnabledChange: () => {},
    onCornerWidthChange: () => {},
    onCornerHeightChange: () => {},
})

export const ScrollAreaProvider = ScrollAreaContext.Provider

export const ScrollAreaConsumer = ScrollAreaContext.Consumer

export function useScrollContext() {
    return useContext(ScrollAreaContext)
}

export default ScrollAreaContext

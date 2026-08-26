import { createContext, useContext } from 'react'

export interface ScrollbarContextValue {
    hasThumb: boolean
    scrollbar: HTMLDivElement | null
    onThumbChange: (thumb: HTMLDivElement | null) => void
    onThumbPointerUp: () => void
    onThumbPointerDown: (pointerPos: { x: number; y: number }) => void
    onThumbPositionChange: () => void
}

export const ScrollbarContext = createContext<ScrollbarContextValue>({
    hasThumb: false,
    scrollbar: null,
    onThumbChange: () => {},
    onThumbPointerUp: () => {},
    onThumbPointerDown: () => {},
    onThumbPositionChange: () => {},
})

export const ScrollbarProvider = ScrollbarContext.Provider

export const ScrollbarConsumer = ScrollbarContext.Consumer

export function useScrollbarContext() {
    return useContext(ScrollbarContext)
}

import { useEffect, useRef, useCallback } from 'react'
import {
    getAccessibilityProps,
    createLiveRegion,
    announce,
    manageFocus,
} from '../utils/accessibility'
import type { SingleOption } from '../types'

export interface UseAccessibilityProps {
    isOpen: boolean
    highlightedIndex: number
    selectedItem?: SingleOption<unknown> | null
    selectedItems?: SingleOption<unknown>[]
    isMulti?: boolean
    inputId?: string
    isDisabled?: boolean
    items: SingleOption<unknown>[]
}

export interface UseAccessibilityReturn {
    accessibilityProps: ReturnType<typeof getAccessibilityProps>
    announceToScreenReader: (message: string) => void
    handleMenuOpen: () => void
    handleMenuClose: () => void
    handleOptionSelect: (item: SingleOption<unknown>) => void
    handleOptionDeselect: (item: SingleOption<unknown>) => void
    handleOptionHighlight: (item: SingleOption<unknown>) => void
}

export const useAccessibility = ({
    isOpen,
    highlightedIndex,
    selectedItem,
    selectedItems = [],
    isMulti = false,
    inputId,
    isDisabled = false,
    items,
}: UseAccessibilityProps): UseAccessibilityReturn => {
    const liveRegionRef = useRef<HTMLElement | null>(null)
    const previousFocusRef = useRef<Element | null>(null)
    const previousHighlightedIndexRef = useRef<number>(-1)

    // Create live region for screen reader announcements
    useEffect(() => {
        if (!liveRegionRef.current) {
            liveRegionRef.current = createLiveRegion()
        }

        return () => {
            if (
                liveRegionRef.current &&
                document.body.contains(liveRegionRef.current)
            ) {
                document.body.removeChild(liveRegionRef.current)
            }
        }
    }, [])

    // Get accessibility props
    const accessibilityProps = getAccessibilityProps({
        isOpen,
        highlightedIndex,
        selectedItem,
        selectedItems,
        isMulti,
        inputId,
        isDisabled,
    })

    // Announce to screen reader
    const announceToScreenReader = useCallback((message: string) => {
        if (liveRegionRef.current) {
            announce(message, liveRegionRef.current)
        }
    }, [])

    // Handle menu open
    const handleMenuOpen = useCallback(() => {
        previousFocusRef.current = manageFocus.saveFocus()
        announceToScreenReader(accessibilityProps.announcements.menuOpened)
    }, [announceToScreenReader, accessibilityProps.announcements.menuOpened])

    // Handle menu close
    const handleMenuClose = useCallback(() => {
        announceToScreenReader(accessibilityProps.announcements.menuClosed)

        // Restore focus to the trigger element
        if (previousFocusRef.current) {
            manageFocus.restoreFocus(previousFocusRef.current)
        }
    }, [announceToScreenReader, accessibilityProps.announcements.menuClosed])

    // Handle option selection
    const handleOptionSelect = useCallback(
        (item: SingleOption<unknown>) => {
            announceToScreenReader(
                accessibilityProps.announcements.optionSelected(item),
            )
        },
        [announceToScreenReader, accessibilityProps.announcements],
    )

    // Handle option deselection
    const handleOptionDeselect = useCallback(
        (item: SingleOption<unknown>) => {
            announceToScreenReader(
                accessibilityProps.announcements.optionDeselected(item),
            )
        },
        [announceToScreenReader, accessibilityProps.announcements],
    )

    // Handle option highlight
    const handleOptionHighlight = useCallback(
        (item: SingleOption<unknown>) => {
            // Only announce if the highlighted index actually changed
            if (
                highlightedIndex !== previousHighlightedIndexRef.current &&
                highlightedIndex >= 0
            ) {
                announceToScreenReader(
                    accessibilityProps.announcements.optionHighlighted(item),
                )
                previousHighlightedIndexRef.current = highlightedIndex
            }
        },
        [
            highlightedIndex,
            announceToScreenReader,
            accessibilityProps.announcements,
        ],
    )

    // Announce when highlighted option changes
    useEffect(() => {
        if (
            isOpen &&
            highlightedIndex >= 0 &&
            highlightedIndex < items.length
        ) {
            const highlightedItem = items[highlightedIndex]
            if (
                highlightedItem &&
                highlightedIndex !== previousHighlightedIndexRef.current
            ) {
                handleOptionHighlight(highlightedItem)
            }
        }
    }, [isOpen, highlightedIndex, items, handleOptionHighlight])

    // Announce when no options are available
    useEffect(() => {
        if (isOpen && items.length === 0) {
            announceToScreenReader(accessibilityProps.announcements.noOptions)
        }
    }, [
        isOpen,
        items.length,
        announceToScreenReader,
        accessibilityProps.announcements.noOptions,
    ])

    return {
        accessibilityProps,
        announceToScreenReader,
        handleMenuOpen,
        handleMenuClose,
        handleOptionSelect,
        handleOptionDeselect,
        handleOptionHighlight,
    }
}

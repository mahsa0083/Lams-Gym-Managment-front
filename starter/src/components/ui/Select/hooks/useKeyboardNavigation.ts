import { useCallback, KeyboardEvent } from 'react'
import type { SingleOption } from '../types'

export interface UseKeyboardNavigationProps<T> {
    items: T[]
    isOpen: boolean
    highlightedIndex: number
    setHighlightedIndex: (index: number) => void
    selectItem: (item: T) => void
    closeMenu: () => void
    openMenu: () => void
    toggleMenu: () => void
    isMulti?: boolean
    isDisabled?: boolean
}

export interface UseKeyboardNavigationReturn {
    handleTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
    handleFilterKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
    handleItemKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void
    handleContainerKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
    handleMenuKeyDown: (event: KeyboardEvent<HTMLUListElement>) => void
}

export const useKeyboardNavigation = <T extends SingleOption<unknown>>({
    items,
    isOpen,
    highlightedIndex,
    setHighlightedIndex,
    selectItem,
    closeMenu,
    openMenu,
    isMulti = false,
    isDisabled = false,
}: UseKeyboardNavigationProps<T>): UseKeyboardNavigationReturn => {
    const navigateUp = useCallback(() => {
        if (items.length === 0) return

        if (highlightedIndex <= 0) {
            setHighlightedIndex(items.length - 1)
        } else {
            setHighlightedIndex(highlightedIndex - 1)
        }
    }, [items.length, highlightedIndex, setHighlightedIndex])

    const navigateDown = useCallback(() => {
        if (items.length === 0) return

        if (highlightedIndex >= items.length - 1) {
            setHighlightedIndex(0)
        } else {
            setHighlightedIndex(highlightedIndex + 1)
        }
    }, [items.length, highlightedIndex, setHighlightedIndex])

    const selectHighlightedItem = useCallback(() => {
        if (highlightedIndex >= 0 && highlightedIndex < items.length) {
            selectItem(items[highlightedIndex])
        }
    }, [highlightedIndex, items, selectItem])

    const handleTriggerKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            if (isDisabled) return

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault()
                    if (!isOpen) {
                        openMenu()
                    } else {
                        navigateDown()
                    }
                    break

                case 'ArrowUp':
                    event.preventDefault()
                    if (!isOpen) {
                        openMenu()
                    } else {
                        navigateUp()
                    }
                    break

                case 'Enter':
                case ' ': // Space
                    event.preventDefault()
                    if (!isOpen) {
                        openMenu()
                    } else {
                        selectHighlightedItem()
                    }
                    break

                case 'Escape':
                    if (isOpen) {
                        event.preventDefault()
                        closeMenu()
                    }
                    break

                case 'Tab':
                    if (isOpen) {
                        closeMenu()
                    }
                    break
            }
        },
        [
            isDisabled,
            isOpen,
            openMenu,
            navigateDown,
            navigateUp,
            selectHighlightedItem,
            closeMenu,
        ],
    )

    const handleFilterKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (isDisabled) return

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault()
                    if (items.length > 0) {
                        setHighlightedIndex(0)
                        // Focus should stay on filter input
                    }
                    break

                case 'ArrowUp':
                    event.preventDefault()
                    if (items.length > 0) {
                        setHighlightedIndex(items.length - 1)
                        // Focus should stay on filter input
                    }
                    break

                case 'Enter':
                    event.preventDefault()
                    selectHighlightedItem()
                    break

                case 'Escape':
                    event.preventDefault()
                    closeMenu()
                    break

                case 'Tab':
                    if (isOpen) {
                        closeMenu()
                    }
                    break
            }
        },
        [
            isDisabled,
            items.length,
            setHighlightedIndex,
            selectHighlightedItem,
            closeMenu,
            isOpen,
        ],
    )

    const handleItemKeyDown = useCallback(
        (event: KeyboardEvent<HTMLLIElement>) => {
            if (isDisabled) return

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault()
                    navigateDown()
                    break

                case 'ArrowUp':
                    event.preventDefault()
                    navigateUp()
                    break

                case 'Enter':
                case ' ': // Space
                    event.preventDefault()
                    selectHighlightedItem()
                    break

                case 'Escape':
                    event.preventDefault()
                    closeMenu()
                    break

                case 'Tab':
                    if (isOpen) {
                        closeMenu()
                    }
                    break
            }
        },
        [
            isDisabled,
            navigateDown,
            navigateUp,
            selectHighlightedItem,
            closeMenu,
            isOpen,
        ],
    )

    const handleContainerKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (isDisabled) return

            // Handle backspace for multi-select to remove last selected item
            if (isMulti && event.key === 'Backspace' && !isOpen) {
                // This will be handled by the component itself
                return
            }

            // Handle other container-level keyboard events if needed
            switch (event.key) {
                case 'Escape':
                    if (isOpen) {
                        event.preventDefault()
                        closeMenu()
                    }
                    break
            }
        },
        [isDisabled, isMulti, isOpen, closeMenu],
    )

    const handleMenuKeyDown = useCallback(
        (event: KeyboardEvent<HTMLUListElement>) => {
            if (isDisabled) return

            // Handle menu-specific keyboard events
            switch (event.key) {
                case 'Escape':
                    if (isOpen) {
                        event.preventDefault()
                        closeMenu()
                    }
                    break
                case 'ArrowDown':
                    event.preventDefault()
                    navigateDown()
                    break
                case 'ArrowUp':
                    event.preventDefault()
                    navigateUp()
                    break
                case 'Enter':
                    event.preventDefault()
                    selectHighlightedItem()
                    break
                case 'Home':
                    event.preventDefault()
                    if (items.length > 0) {
                        setHighlightedIndex(0)
                    }
                    break
                case 'End':
                    event.preventDefault()
                    if (items.length > 0) {
                        setHighlightedIndex(items.length - 1)
                    }
                    break
            }
        },
        [
            isDisabled,
            isOpen,
            closeMenu,
            navigateDown,
            navigateUp,
            selectHighlightedItem,
            items.length,
            setHighlightedIndex,
        ],
    )

    return {
        handleTriggerKeyDown,
        handleFilterKeyDown,
        handleItemKeyDown,
        handleContainerKeyDown,
        handleMenuKeyDown,
    }
}

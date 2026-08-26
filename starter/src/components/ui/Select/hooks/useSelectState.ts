import { useState, useCallback } from 'react'
import type { SingleOption } from '../types'

export interface UseSelectStateProps<T> {
    items: T[]
    selectedItem?: T | null
    onSelectedItemChange?: (item: T | null) => void
    isMulti?: boolean
    selectedItems?: T[]
    onSelectedItemsChange?: (items: T[]) => void
    defaultHighlightedIndex?: number
}

export interface UseSelectStateReturn<T> {
    isOpen: boolean
    highlightedIndex: number
    selectedItem: T | null
    selectedItems: T[]
    openMenu: () => void
    closeMenu: () => void
    toggleMenu: () => void
    setHighlightedIndex: (index: number) => void
    selectItem: (item: T) => void
    removeSelectedItem: (item: T) => void
    clearSelection: () => void
    resetHighlightedIndex: () => void
}

export const useSelectState = <T extends SingleOption<unknown>>({
    items,
    selectedItem,
    onSelectedItemChange,
    isMulti = false,
    selectedItems = [],
    onSelectedItemsChange,
    defaultHighlightedIndex = -1,
}: UseSelectStateProps<T>): UseSelectStateReturn<T> => {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(
        defaultHighlightedIndex,
    )

    const openMenu = useCallback(() => {
        setIsOpen(true)
        // Reset highlighted index when opening menu
        if (items.length > 0) {
            setHighlightedIndex(0)
        }
    }, [items.length])

    const closeMenu = useCallback(() => {
        setIsOpen(false)
        setHighlightedIndex(defaultHighlightedIndex)
    }, [defaultHighlightedIndex])

    const toggleMenu = useCallback(() => {
        if (isOpen) {
            closeMenu()
        } else {
            openMenu()
        }
    }, [isOpen, openMenu, closeMenu])

    const resetHighlightedIndex = useCallback(() => {
        setHighlightedIndex(items.length > 0 ? 0 : defaultHighlightedIndex)
    }, [items.length, defaultHighlightedIndex])

    const selectItem = useCallback(
        (item: T) => {
            if (isMulti) {
                const newSelectedItems = [...selectedItems]
                const existingIndex = newSelectedItems.findIndex(
                    (selectedItem) => selectedItem.value === item.value,
                )

                if (existingIndex >= 0) {
                    // Item already selected, remove it
                    newSelectedItems.splice(existingIndex, 1)
                } else {
                    // Add new item
                    newSelectedItems.push(item)
                }

                onSelectedItemsChange?.(newSelectedItems)
            } else {
                onSelectedItemChange?.(item)
                closeMenu()
            }
        },
        [
            isMulti,
            selectedItems,
            onSelectedItemsChange,
            onSelectedItemChange,
            closeMenu,
        ],
    )

    const removeSelectedItem = useCallback(
        (item: T) => {
            if (isMulti) {
                const newSelectedItems = selectedItems.filter(
                    (selectedItem) => selectedItem.value !== item.value,
                )
                onSelectedItemsChange?.(newSelectedItems)
            } else {
                onSelectedItemChange?.(null)
            }
        },
        [isMulti, selectedItems, onSelectedItemsChange, onSelectedItemChange],
    )

    const clearSelection = useCallback(() => {
        if (isMulti) {
            onSelectedItemsChange?.([])
        } else {
            onSelectedItemChange?.(null)
        }
    }, [isMulti, onSelectedItemsChange, onSelectedItemChange])

    const safeSetHighlightedIndex = useCallback(
        (index: number) => {
            const maxIndex = items.length - 1
            const minIndex = 0

            if (items.length === 0) {
                setHighlightedIndex(defaultHighlightedIndex)
                return
            }

            if (index < minIndex) {
                setHighlightedIndex(minIndex)
            } else if (index > maxIndex) {
                setHighlightedIndex(maxIndex)
            } else {
                setHighlightedIndex(index)
            }
        },
        [items.length, defaultHighlightedIndex],
    )

    return {
        isOpen,
        highlightedIndex,
        selectedItem: selectedItem || null,
        selectedItems,
        openMenu,
        closeMenu,
        toggleMenu,
        setHighlightedIndex: safeSetHighlightedIndex,
        selectItem,
        removeSelectedItem,
        clearSelection,
        resetHighlightedIndex,
    }
}

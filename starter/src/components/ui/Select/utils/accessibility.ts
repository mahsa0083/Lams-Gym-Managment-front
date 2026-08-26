import type { SingleOption } from '../types'

export interface AccessibilityProps {
    isOpen: boolean
    highlightedIndex: number
    selectedItem?: SingleOption<unknown> | null
    selectedItems?: SingleOption<unknown>[]
    isMulti?: boolean
    inputId?: string
    isDisabled?: boolean
}

export const getAccessibilityProps = ({
    isOpen,
    highlightedIndex,
    selectedItem,
    selectedItems = [],
    isMulti = false,
    inputId,
    isDisabled = false,
}: AccessibilityProps) => {
    const labelId = inputId || 'select-label'
    const menuId = `${labelId}-menu`
    const activeDescendantId =
        highlightedIndex >= 0
            ? `${labelId}-option-${highlightedIndex}`
            : undefined

    return {
        triggerProps: {
            'aria-haspopup': 'listbox' as const,
            'aria-expanded': isOpen,
            'aria-labelledby': labelId,
            'aria-owns': isOpen ? menuId : undefined,
            'aria-activedescendant': isOpen ? activeDescendantId : undefined,
            role: 'combobox',
            tabIndex: isDisabled ? -1 : 0,
        },
        menuProps: {
            role: 'listbox',
            id: menuId,
            'aria-labelledby': labelId,
            'aria-multiselectable': isMulti,
            'aria-activedescendant': activeDescendantId,
        },
        getOptionProps: (index: number, item: SingleOption<unknown>) => {
            const isSelected = isMulti
                ? selectedItems.some(
                      (selected) => selected.value === item.value,
                  )
                : selectedItem?.value === item.value

            return {
                role: 'option',
                id: `${labelId}-option-${index}`,
                'aria-selected': isSelected,
                'aria-current':
                    highlightedIndex === index ? ('true' as const) : undefined,
                'aria-disabled': item.disabled || false,
                tabIndex: -1,
            }
        },
        filterInputProps: {
            role: 'searchbox',
            'aria-label': 'Filter options',
            'aria-autocomplete': 'list' as const,
            'aria-expanded': isOpen,
            'aria-owns': isOpen ? menuId : undefined,
            'aria-activedescendant': isOpen ? activeDescendantId : undefined,
        },
        getSelectedItemProps: (index: number, item: SingleOption<unknown>) => ({
            role: 'button',
            'aria-label': `Remove ${item.label}`,
            'aria-describedby': `${labelId}-selected-${index}`,
            tabIndex: isDisabled ? -1 : 0,
        }),
        announcements: {
            menuOpened: `Menu opened. ${isMulti ? 'Use arrow keys to navigate options and Enter to select multiple items.' : 'Use arrow keys to navigate and Enter to select.'}`,
            menuClosed: 'Menu closed.',
            optionSelected: (item: SingleOption<unknown>) =>
                `${item.label} selected.`,
            optionDeselected: (item: SingleOption<unknown>) =>
                `${item.label} removed.`,
            optionHighlighted: (item: SingleOption<unknown>) =>
                `${item.label} highlighted.`,
            noOptions: 'No options available.',
            createOption: (value: string) => `Create option "${value}".`,
        },
    }
}

export const createLiveRegion = () => {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'fixed'   
    liveRegion.style.top = '0'
    liveRegion.style.left = '0'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    liveRegion.style.opacity = '0'       
    liveRegion.style.pointerEvents = 'none'
    document.body.appendChild(liveRegion)
    return liveRegion
}

export const announce = (message: string, liveRegion?: HTMLElement) => {
    if (!liveRegion) {
        const tempRegion = createLiveRegion()
        tempRegion.textContent = message
        setTimeout(() => {
            document.body.removeChild(tempRegion)
        }, 1000)
    } else {
        liveRegion.textContent = message
    }
}

export const manageFocus = {
    saveFocus: (): Element | null => {
        return document.activeElement
    },

    restoreFocus: (element: Element | null) => {
        if (
            element &&
            'focus' in element &&
            typeof element.focus === 'function'
        ) {
            ;(element as HTMLElement).focus()
        }
    },

    focusFirst: (container: HTMLElement): boolean => {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )

        if (focusableElements.length > 0) {
            ;(focusableElements[0] as HTMLElement).focus()
            return true
        }
        return false
    },

    focusLast: (container: HTMLElement): boolean => {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )

        if (focusableElements.length > 0) {
            ;(
                focusableElements[focusableElements.length - 1] as HTMLElement
            ).focus()
            return true
        }
        return false
    },
}

export const KEYS = {
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    SPACE: ' ',
    TAB: 'Tab',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    HOME: 'Home',
    END: 'End',
} as const

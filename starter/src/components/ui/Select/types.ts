import type { CommonProps, TypeAttributes } from '../@types/common'
import type {
    ReactNode,
    JSX,
    ComponentProps,
    MouseEvent,
    KeyboardEvent,
} from 'react'
import type { Placement } from '@floating-ui/react'

export type SelectItemInteractionProps = {
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
    onMouseDown?: (event: MouseEvent<HTMLLIElement>) => void
    onMouseMove?: (event: MouseEvent<HTMLLIElement>) => void
    onKeyDown?: (event: KeyboardEvent<HTMLLIElement>) => void
    role?: string
    tabIndex?: number
    'aria-selected'?: boolean
    'aria-current'?:
        | boolean
        | 'page'
        | 'step'
        | 'location'
        | 'date'
        | 'time'
        | 'true'
        | 'false'
    id?: string
}

export type BaseSelectItemProps<T> = {
    hovered?: boolean
    selected?: boolean
    option: Option<T>
    isGroupLabel?: boolean
} & SelectItemInteractionProps

export type SingleOption<T> = {
    label: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
    disabled?: boolean
} & T

export type CustomOption<T> = (props: {
    option: SingleOption<T>
    hovered: boolean
    selected: boolean
    CheckIcon: ReactNode
}) => ReactNode

export type GroupOption<T> = {
    label: string
    options: SingleOption<T>[]
}

export type Option<T = object> = SingleOption<T> | GroupOption<T>

export type Options<ExtraOption = object> =
    | Array<SingleOption<ExtraOption>>
    | Array<GroupOption<ExtraOption>>

// Utility type for selected options in multi-select
export type SelectedOptions<ExtraOption = object> = Array<
    SingleOption<ExtraOption>
>

// State management types for custom implementation
export type SelectState<T> = {
    isOpen: boolean
    highlightedIndex: number
    selectedItem: T | null
    filterValue: string
}

export type MultiSelectState<T> = {
    isOpen: boolean
    highlightedIndex: number
    selectedItems: T[]
    filterValue: string
}

// Action types for state management
export type SelectAction<T> =
    | { type: 'OPEN_MENU' }
    | { type: 'CLOSE_MENU' }
    | { type: 'TOGGLE_MENU' }
    | { type: 'SET_HIGHLIGHTED_INDEX'; index: number }
    | { type: 'SELECT_ITEM'; item: T }
    | { type: 'REMOVE_ITEM'; item: T }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SET_FILTER_VALUE'; value: string }

export type SelectTriggerProps = {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
    onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void
    'aria-haspopup'?: 'listbox'
    'aria-expanded'?: boolean
    'aria-labelledby'?: string
    role?: string
    tabIndex?: number
    type?: 'button'
    disabled?: boolean
}

export type SelectMenuProps = {
    role?: 'listbox'
    'aria-labelledby'?: string
    'aria-multiselectable'?: boolean
    tabIndex?: number
    onKeyDown?: (event: KeyboardEvent<HTMLUListElement>) => void
}

export type FilterFunction<T> = (props: {
    inputValue: string
    options: Options<T>
    selectedItem?: SingleOption<T> | null
}) => Options<T>

export type FilterFunctionMulti<T> = (props: {
    inputValue: string
    options: Options<T>
    selectedItems: SingleOption<T>[]
}) => Options<T>

export interface BaseSelectProps<ExtraOption = object> extends CommonProps {
    customOption?: CustomOption<ExtraOption>
    formatGroupLabel?: (group: GroupOption<ExtraOption>) => ReactNode
    invalid?: boolean
    isCreatable?: boolean
    isDisabled?: boolean
    isSearchable?: boolean
    isLoading?: boolean
    inputId?: string
    noOptionsMessage?:
        | string
        | ((
              OptionElement: ({
                  className,
                  ...rest
              }: ComponentProps<'li'>) => JSX.Element,
          ) => string | ReactNode)
    options: Options<ExtraOption>
    onMenuOpen?: () => void
    onInputChange?: (inputValue: string) => void
    placeholder?: string
    size?: TypeAttributes.ControlSize
    placement?: Placement
    searchInputProps?: Omit<
        ComponentProps<'input'>,
        'onChange' | 'value' | 'onKeyDown' | 'ref'
    >
}

export type { RefObject, CSSProperties } from 'react'

export type {
    UseSelectStateProps,
    UseSelectStateReturn,
    UseKeyboardNavigationProps,
    UseKeyboardNavigationReturn,
    UseClickOutsideProps,
    UseAccessibilityProps,
    UseAccessibilityReturn,
} from './hooks'

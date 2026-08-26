import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import useMergedRef from '../hooks/useMergeRef'
import { useForm, useFormItem } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { useConfig } from '../ConfigProvider'
import SelectItem from './SelectItem'
import SelectMenu from './SelectMenu'
import ListElement from './ListElement'
import FilterInput from './FilterInput'
import { ChevronDown, ChevronUp, Cross } from '../Icons'
import Spinner from '../Spinner'
import { CONTROL_SIZES } from '../utils/constants'
import classNames from '../utils/classNames'
import useSelectFloating from '../hooks/useSelectFloating'
import {
    useSelectState,
    useKeyboardNavigation,
    useClickOutside,
    useAccessibility,
} from './hooks'
import { flattenGroupOptions, useFilteredOptionsMulti } from './utils'
import type {
    BaseSelectProps,
    Option,
    SingleOption,
    GroupOption,
    SelectedOptions,
    FilterFunctionMulti,
} from './types'
import type { CommonProps } from '../@types/common'
import type { ReactNode } from 'react'

export interface SelectMultiProps<ExtraOption = object>
    extends BaseSelectProps<ExtraOption>, CommonProps {
    customLabel?: (selectedItem: SingleOption<ExtraOption>) => ReactNode
    defaultValue?: SelectedOptions<ExtraOption>
    filter?: FilterFunctionMulti<ExtraOption>
    value?: SelectedOptions<ExtraOption>
    onChange?: (value: SelectedOptions<ExtraOption>) => void
    showClearAllButton?: boolean
}

const Multi = <ExtraOption,>(props: SelectMultiProps<ExtraOption>) => {
    const {
        customOption,
        customLabel,
        defaultValue,
        filter,
        id,
        invalid,
        isCreatable,
        isDisabled,
        isSearchable,
        isLoading,
        inputId,
        className,
        noOptionsMessage = 'گزینه‌ای وجود ندارد',
        options = [],
        onChange,
        onInputChange,
        onMenuOpen,
        placeholder,
        size,
        showClearAllButton = true,
        value,
        placement,
        searchInputProps,
        ...rest
    } = props

    const { controlSize } = useConfig()
    const formControlSize = useForm()?.size
    const formItemInvalid = useFormItem()?.invalid
    const inputGroupSize = useInputGroup()?.size

    const selectSize = (size ||
        inputGroupSize ||
        formControlSize ||
        controlSize) as keyof typeof CONTROL_SIZES

    const isSelectInvalid = invalid || formItemInvalid

    const [filterValue, setFilterValue] = useState('')
    const [unControlledSelectedItems, setUnControlledSelectedItems] = useState<
        SelectedOptions<ExtraOption>
    >(defaultValue || [])
    const [isCreating, setIsCreating] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedItems = (() => {
        if (typeof value !== 'undefined') {
            return value
        }
        return unControlledSelectedItems
    })()

    const isSingle = options.some(
        (option: Option<ExtraOption>) => 'value' in option,
    )

    // Use filtered options based on filter value
    const filteredOptions = useFilteredOptionsMulti(
        options,
        filterValue,
        selectedItems,
        filter,
    )

    // Handle creatable options
    const finalOptions = useMemo(() => {
        if (
            isCreatable &&
            filterValue.length > 0 &&
            filteredOptions.length === 0
        ) {
            setIsCreating(true)
            return [
                { label: filterValue, value: filterValue },
            ] as SingleOption<ExtraOption>[]
        }
        if (isCreating && filteredOptions.length > 0) {
            setIsCreating(false)
        }
        return filteredOptions
    }, [filteredOptions, isCreatable, filterValue, isCreating])

    const flattenedOptions = isSingle
        ? finalOptions
        : flattenGroupOptions(finalOptions as Array<GroupOption<ExtraOption>>)

    const handleChange = useCallback(
        (newSelectedItems: SelectedOptions<ExtraOption> = []) => {
            onChange?.(newSelectedItems)
            if (typeof value === 'undefined') {
                setUnControlledSelectedItems(newSelectedItems)
            }
        },
        [onChange, value],
    )

    // Custom multi-select item handler
    const handleMultiSelectItem = useCallback(
        (item: SingleOption<ExtraOption>) => {
            const existingIndex = selectedItems.findIndex(
                (selectedItem) => selectedItem.value === item.value,
            )

            let newSelectedItems: SelectedOptions<ExtraOption>
            if (existingIndex >= 0) {
                // Item already selected, remove it
                newSelectedItems = selectedItems.filter(
                    (_, index) => index !== existingIndex,
                )
            } else {
                // Add new item
                newSelectedItems = [...selectedItems, item]
            }

            handleChange(newSelectedItems)

            if (isCreating && isCreatable) {
                setIsCreating(false)
            }
            setFilterValue('')
        },
        [selectedItems, handleChange, isCreating, isCreatable],
    )

    // Custom state management for multi-select
    const selectState = useSelectState({
        items: flattenedOptions as SingleOption<ExtraOption>[],
        isMulti: true,
        selectedItems: selectedItems,
        onSelectedItemsChange: handleChange,
        defaultHighlightedIndex: 0,
    })

    // Override selectItem to use multi-select logic
    const customSelectItem = useCallback(
        (item: SingleOption<ExtraOption>) => {
            handleMultiSelectItem(item)
            // Keep menu open for multi-select
            if (!selectState.isOpen) {
                selectState.openMenu()
            }
        },
        [handleMultiSelectItem, selectState],
    )

    // Custom keyboard navigation for multi-select
    const keyboardHandlers = useKeyboardNavigation({
        items: flattenedOptions as SingleOption<ExtraOption>[],
        isOpen: selectState.isOpen,
        highlightedIndex: selectState.highlightedIndex,
        setHighlightedIndex: selectState.setHighlightedIndex,
        selectItem: customSelectItem,
        closeMenu: selectState.closeMenu,
        openMenu: selectState.openMenu,
        toggleMenu: selectState.toggleMenu,
        isMulti: true,
        isDisabled,
    })

    // Click outside to close menu
    useClickOutside({
        ref: containerRef,
        onClickOutside: selectState.closeMenu,
        enabled: selectState.isOpen && !isDisabled,
    })

    // Accessibility features for multi-select
    const accessibility = useAccessibility({
        isOpen: selectState.isOpen,
        highlightedIndex: selectState.highlightedIndex,
        selectedItems: selectedItems,
        isMulti: true,
        inputId,
        isDisabled,
        items: flattenedOptions as SingleOption<ExtraOption>[],
    })

    // Remove selected item function
    const removeSelectedItem = useCallback(
        (item: SingleOption<ExtraOption>) => {
            const newSelectedItems = selectedItems.filter(
                (selectedItem) => selectedItem.value !== item.value,
            )
            handleChange(newSelectedItems)
        },
        [selectedItems, handleChange],
    )

    // Handle filter input changes
    const handleFilterChange = useCallback(
        (newFilterValue: string) => {
            setFilterValue(newFilterValue)
            onInputChange?.(newFilterValue)
            // Reset highlighted index when filter changes
            if (flattenedOptions.length > 0) {
                selectState.setHighlightedIndex(0)
            }
        },
        [onInputChange, flattenedOptions.length, selectState],
    )

    useEffect(() => {
        if (onMenuOpen && selectState.isOpen) {
            onMenuOpen()
        }
    }, [selectState.isOpen, onMenuOpen])

    // Clear filter when menu closes
    useEffect(() => {
        if (!selectState.isOpen) {
            setFilterValue('')
            setIsCreating(false)
        }
    }, [selectState.isOpen])

    const { isMounted, mergedStyles, refs } = useSelectFloating({
        isOpen: selectState.isOpen,
        placement,
        offsetValue: 5,
    })

    const inputMergeRef = useMergedRef(refs.setReference, inputRef)

    // Custom item click handler for multi-select
    const handleItemClick = useCallback(
        (item: SingleOption<ExtraOption>) => {
            const wasSelected = selectedItems.some(
                (selected) => selected.value === item.value,
            )
            customSelectItem(item)

            if (wasSelected) {
                accessibility.handleOptionDeselect(item)
            } else {
                accessibility.handleOptionSelect(item)
            }
        },
        [customSelectItem, selectedItems, accessibility],
    )

    // Custom item interaction props for multi-select
    const getItemProps = useCallback(
        (item: SingleOption<ExtraOption>, index: number) => ({
            onClick: () => handleItemClick(item),
            onMouseMove: () => {
                if (selectState.highlightedIndex !== index) {
                    selectState.setHighlightedIndex(index)
                }
            },
            onKeyDown: keyboardHandlers.handleItemKeyDown,
            ...accessibility.accessibilityProps.getOptionProps(index, item),
        }),
        [handleItemClick, selectState, keyboardHandlers, accessibility],
    )

    // Custom trigger button props for multi-select
    const getTriggerProps = useCallback(
        () => ({
            onClick: () => {
                if (selectState.isOpen) {
                    selectState.closeMenu()
                    accessibility.handleMenuClose()
                } else {
                    selectState.openMenu()
                    accessibility.handleMenuOpen()
                }
            },
            onKeyDown: keyboardHandlers.handleTriggerKeyDown,
            type: 'button' as const,
            disabled: isDisabled,
            ...accessibility.accessibilityProps.triggerProps,
        }),
        [selectState, keyboardHandlers, isDisabled, accessibility],
    )

    // Custom menu props for multi-select
    const getMenuProps = useCallback(
        () => ({
            onKeyDown: keyboardHandlers.handleMenuKeyDown,
            ...accessibility.accessibilityProps.menuProps,
        }),
        [keyboardHandlers, accessibility],
    )

    const renderMenuList = () => {
        if (isCreatable && isCreating) {
            const createItem = {
                label: filterValue,
                value: filterValue,
            } as SingleOption<ExtraOption>
            return (
                <li
                    className={classNames(
                        'select-item select-item-create',
                        selectState.highlightedIndex === 0 &&
                        'select-item-hovered',
                    )}
                    {...getItemProps(createItem, 0)}
                >
                    ایجاد {`"${filterValue}"`}
                </li>
            )
        }

        if (finalOptions.length === 0 && !isCreatable) {
            if (typeof noOptionsMessage === 'function') {
                return noOptionsMessage(ListElement)
            }

            return (
                <li className="select-item select-item-message">
                    {noOptionsMessage}
                </li>
            )
        }

        return isSingle
            ? (finalOptions as Array<SingleOption<ExtraOption>>).map(
                (item, index) => (
                    <SelectItem
                        key={item.value}
                        option={item}
                        selected={selectedItems.some(
                            (selected) => selected.value === item.value,
                        )}
                        hovered={selectState.highlightedIndex === index}
                        customOption={customOption}
                        {...getItemProps(item, index)}
                    />
                ),
            )
            : (finalOptions as Array<GroupOption<ExtraOption>>).reduce(
                (
                    results: {
                        sections: ReactNode[]
                        itemIndex: number
                    },
                    section,
                    sectionIndex,
                ) => {
                    results.sections.push(
                        <li className="select-item-group" key={sectionIndex}>
                            <p className="select-item-group-label">
                                {section.label}
                            </p>
                            <ul>
                                {section.options.map(
                                    (option, optionIndex) => {
                                        const resultIndex =
                                            results.itemIndex++
                                        return (
                                            <SelectItem
                                                key={optionIndex}
                                                option={option}
                                                selected={selectedItems.some(
                                                    (selected) =>
                                                        selected.value ===
                                                        option.value,
                                                )}
                                                hovered={
                                                    selectState.highlightedIndex ===
                                                    resultIndex
                                                }
                                                customOption={customOption}
                                                {...getItemProps(
                                                    option,
                                                    resultIndex,
                                                )}
                                            />
                                        )
                                    },
                                )}
                            </ul>
                        </li>,
                    )

                    return results
                },
                { sections: [], itemIndex: 0 },
            ).sections
    }

    return (
        <div
            id={id}
            onClick={() => {
                if (!selectState.isOpen && !isDisabled) {
                    selectState.openMenu()
                    inputRef.current?.focus()
                }
            }}
            className={classNames(
                'select select-multi',
                `select-${selectSize}`,
                isSelectInvalid && 'select-invalid',
                isDisabled && 'select-disabled',
                selectState.isOpen && 'select-menu-open',
                className,
            )}
            ref={(node) => {
                containerRef.current = node
                refs.setReference(node)
            }}
            onKeyDown={keyboardHandlers.handleContainerKeyDown}
            {...rest}
        >
            <div
                className={classNames(
                    'select-control',
                    CONTROL_SIZES[selectSize].minH,
                )}
            >
                <div className="select-display-wrapper">
                    <div
                        className={classNames(
                            'select-tag-wrapper',
                            selectedItems.length > 0 && 'has-value',
                        )}
                    >
                        {selectedItems.map(
                            function renderSelectedItem(
                                selectedItemForRender,
                                index,
                            ) {
                                return (
                                    <span
                                        className={classNames(
                                            'select-tag',
                                            isDisabled && 'select-tag-disabled',
                                        )}
                                        key={`selecte-tag-${index}`}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Backspace' ||
                                                e.key === 'Delete'
                                            ) {
                                                e.preventDefault()
                                                removeSelectedItem(
                                                    selectedItemForRender,
                                                )
                                                accessibility.handleOptionDeselect(
                                                    selectedItemForRender,
                                                )
                                            }
                                        }}
                                        {...accessibility.accessibilityProps.getSelectedItemProps(
                                            index,
                                            selectedItemForRender,
                                        )}
                                        tabIndex={isDisabled ? -1 : 0}
                                    >
                                        {customLabel
                                            ? customLabel(selectedItemForRender)
                                            : selectedItemForRender.label}
                                        {showClearAllButton && (
                                            <button
                                                type="button"
                                                className="selecte-tag-remove"
                                                onClick={(e) => {
                                                    if (isDisabled) {
                                                        return
                                                    }
                                                    e.stopPropagation()
                                                    removeSelectedItem(
                                                        selectedItemForRender,
                                                    )
                                                    accessibility.handleOptionDeselect(
                                                        selectedItemForRender,
                                                    )
                                                }}
                                                disabled={isDisabled}
                                                aria-label={`حذف ${selectedItemForRender.label}`}
                                            >
                                                &#10005;
                                            </button>
                                        )}
                                    </span>
                                )
                            },
                        )}
                        <div className="select-input-wrapper">
                            <input
                                placeholder={
                                    selectedItems.length > 0 ? '' : placeholder
                                }
                                className={classNames(
                                    'select-multi-input',
                                    selectedItems.length > 0 && 'has-value',
                                )}
                                readOnly
                                value=""
                                onClick={() => {
                                    if (!selectState.isOpen && !isDisabled) {
                                        selectState.openMenu()
                                    }
                                }}
                                ref={inputMergeRef}
                                id={inputId}
                                disabled={isDisabled}
                            />
                        </div>
                    </div>
                </div>
                <div className="select-indicator-wrapper">
                    {selectedItems.length > 0 && !isDisabled && (
                        <button
                            onClick={(e) => {
                                if (isDisabled) {
                                    return
                                }
                                e.stopPropagation()
                                handleChange([])
                            }}
                            type="button"
                            className="select-clear-button"
                            disabled={isDisabled}
                        >
                            <Cross height="1.25em" width="1.25em" />
                        </button>
                    )}
                    {isLoading && (
                        <Spinner size={16} className="select-spinner" />
                    )}
                    <button
                        aria-label="select indicator"
                        className="select-indicator"
                        {...getTriggerProps()}
                        type="button"
                    >
                        {selectState.isOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
            </div>
            <SelectMenu
                {...getMenuProps()}
                ref={refs.setFloating}
                style={mergedStyles}
                isOpen={isMounted}
            >
                {isSearchable && (
                    <FilterInput
                        value={filterValue}
                        onChange={handleFilterChange}
                        onKeyDown={keyboardHandlers.handleFilterKeyDown}
                        placeholder="جستجوی گزینه‌ها..."
                        disabled={isDisabled}
                        {...searchInputProps}
                        {...accessibility.accessibilityProps.filterInputProps}
                    />
                )}
                <div className="select-menu-content">{renderMenuList()}</div>
            </SelectMenu>
        </div>
    )
}

export default Multi

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useForm, useFormItem } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { useConfig } from '../ConfigProvider'
import SelectItem from './SelectItem'
import SelectMenu from './SelectMenu'
import ListElement from './ListElement'
import FilterInput from './FilterInput'
import { ChevronDown, ChevronUp } from '../Icons'
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
import { flattenGroupOptions, useFilteredOptions } from './utils'
import type { CommonProps } from '../@types/common'
import type { ReactNode } from 'react'
import type {
    BaseSelectProps,
    Option,
    SingleOption,
    GroupOption,
    FilterFunction,
} from './types'

export interface SelectProps<ExtraOption = object>
    extends BaseSelectProps<ExtraOption>, CommonProps {
    defaultValue?: SingleOption<ExtraOption> | null
    value?: SingleOption<ExtraOption> | null
    onChange?: (value: SingleOption<ExtraOption>) => void
    customInputDisplay?: (
        selectedItem: SingleOption<ExtraOption> | null,
    ) => ReactNode
    filter?: FilterFunction<ExtraOption>
}

const Select = <ExtraOption,>(props: SelectProps<ExtraOption>) => {
    const {
        customOption,
        customInputDisplay,
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
        options: _options = [],
        onChange,
        onInputChange,
        onMenuOpen,
        placeholder,
        size,
        value,
        formatGroupLabel,
        searchInputProps,
        placement,
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

    const [unControlledSelectedItem, setUnControlledSelectedItem] =
        useState<SingleOption<ExtraOption> | null>(defaultValue || null)

    const [filterValue, setFilterValue] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleChange = (
        newSelectedItem: SingleOption<ExtraOption> | null,
    ) => {
        if (newSelectedItem) {
            onChange?.(newSelectedItem)
            if (typeof value === 'undefined') {
                setUnControlledSelectedItem(newSelectedItem)
            }
        }
    }

    const selectedItem = (() => {
        if (typeof value !== 'undefined') {
            return value
        }
        return unControlledSelectedItem
    })()

    const filteredOptions = useFilteredOptions(
        _options,
        filterValue,
        filter,
        selectedItem,
    )

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

    const isSingle = finalOptions.some(
        (option: Option<ExtraOption>) => 'value' in option,
    )

    const flattenedOptions = isSingle
        ? finalOptions
        : flattenGroupOptions(finalOptions as Array<GroupOption<ExtraOption>>)

    const selectState = useSelectState({
        items: flattenedOptions as SingleOption<ExtraOption>[],
        selectedItem: selectedItem,
        onSelectedItemChange: handleChange,
    })

    const keyboardHandlers = useKeyboardNavigation({
        items: flattenedOptions as SingleOption<ExtraOption>[],
        isOpen: selectState.isOpen,
        highlightedIndex: selectState.highlightedIndex,
        setHighlightedIndex: selectState.setHighlightedIndex,
        selectItem: selectState.selectItem,
        closeMenu: selectState.closeMenu,
        openMenu: selectState.openMenu,
        toggleMenu: selectState.toggleMenu,
        isDisabled,
    })

    useClickOutside({
        ref: containerRef,
        onClickOutside: selectState.closeMenu,
        enabled: selectState.isOpen && !isDisabled,
    })

    const accessibility = useAccessibility({
        isOpen: selectState.isOpen,
        highlightedIndex: selectState.highlightedIndex,
        selectedItem: selectedItem,
        isMulti: false,
        inputId,
        isDisabled,
        items: flattenedOptions as SingleOption<ExtraOption>[],
    })

    const { isMounted, mergedStyles, refs } = useSelectFloating({
        isOpen: selectState.isOpen,
        placement,
    })

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

    // Custom item click handler
    const handleItemClick = useCallback(
        (item: SingleOption<ExtraOption>) => {
            selectState.selectItem(item)
            accessibility.handleOptionSelect(item)
        },
        [selectState, accessibility],
    )

    // Custom item interaction props
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
                          key={item.value + index}
                          option={item}
                          selected={
                              selectedItem && 'value' in selectedItem
                                  ? selectedItem.value === item.value
                                  : undefined
                          }
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
                              {formatGroupLabel ? (
                                  formatGroupLabel(section)
                              ) : (
                                  <div className="select-item-group-label">
                                      {section.label}
                                  </div>
                              )}
                              <ul>
                                  {section.options.map(
                                      (option, optionIndex) => {
                                          const resultIndex =
                                              results.itemIndex++
                                          return (
                                              <SelectItem
                                                  key={optionIndex}
                                                  option={option}
                                                  selected={
                                                      selectedItem &&
                                                      'value' in selectedItem
                                                          ? selectedItem.value ===
                                                            option.value
                                                          : undefined
                                                  }
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
            {...rest}
            className={classNames(
                'select',
                `select-${selectSize}`,
                isSelectInvalid && 'select-invalid',
                selectState.isOpen && 'select-menu-open',
                isDisabled && 'select-disabled',
                CONTROL_SIZES[selectSize].h,
                className,
            )}
            ref={(node) => {
                containerRef.current = node
                refs.setReference(node)
            }}
            onKeyDown={keyboardHandlers.handleContainerKeyDown}
        >
            <div className={classNames('select-control')}>
                <button
                    className="select-display-wrapper"
                    {...getTriggerProps()}
                    disabled={isDisabled}
                >
                    <span className="select-display">
                        {selectedItem?.label ? (
                            customInputDisplay ? (
                                customInputDisplay(selectedItem)
                            ) : (
                                <span>{selectedItem.label}</span>
                            )
                        ) : (
                            <span className="select-placeholder">
                                {placeholder}
                            </span>
                        )}
                        <div className="select-indicator-wrapper">
                            {isLoading && (
                                <Spinner size={16} className="select-spinner" />
                            )}
                            <span>
                                {selectState.isOpen ? (
                                    <ChevronUp />
                                ) : (
                                    <ChevronDown />
                                )}
                            </span>
                        </div>
                    </span>
                </button>
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
                <ul className="select-menu-content">{renderMenuList()}</ul>
            </SelectMenu>
        </div>
    )
}

export default Select

import cloneDeep from 'lodash/cloneDeep'
import { useMemo } from 'react'
import type {
    Options,
    SingleOption,
    GroupOption,
    FilterFunction,
    FilterFunctionMulti,
} from '../types'
export * from './accessibility'

export const flattenGroupOptions = <T>(
    options: Array<GroupOption<T>>,
): Array<SingleOption<T>> =>
    options.reduce((prev: SingleOption<T>[], curr: GroupOption<T>) => {
        return [...prev, ...curr.options]
    }, [])

export function defaultOptionsFilterFn<T>(
    inputValue: string,
    options: Options<T> = [],
): Options<T> {
    if (!inputValue || inputValue.trim() === '') {
        return options
    }

    const lowerCasedInputValue = inputValue.toLowerCase().trim()
    const clonedOptions = cloneDeep(options)
    const filteredOptions: Options<T> = []

    for (let i = 0; i < clonedOptions.length; i++) {
        const option = clonedOptions[i]
        if ('options' in option) {
            const matchingChildOptions = option.options.filter(
                (childOption) => {
                    if ('disabled' in childOption && childOption.disabled) {
                        return false
                    }

                    const label = childOption.label.toLowerCase()
                    const value = String(childOption.value).toLowerCase()

                    return (
                        label.includes(lowerCasedInputValue) ||
                        value.includes(lowerCasedInputValue)
                    )
                },
            )

            if (matchingChildOptions.length > 0) {
                option.options = matchingChildOptions as Array<SingleOption<T>>
                ;(filteredOptions as Array<GroupOption<T>>).push(option)
            }
        } else if ('value' in option) {
            if ('disabled' in option && option.disabled) {
                continue
            }

            const label = option.label.toLowerCase()
            const value = String(option.value).toLowerCase()

            if (
                label.includes(lowerCasedInputValue) ||
                value.includes(lowerCasedInputValue)
            ) {
                ;(filteredOptions as Array<SingleOption<T>>).push(option)
            }
        }
    }

    return filteredOptions
}

export function defaultOptionsFilterFnMulti<T>({
    selectedItems,
    inputValue,
    options,
    isSingle,
}: {
    selectedItems: Array<SingleOption<T>>
    inputValue: string
    options: Options<T>
    isSingle: boolean
}): Options<T> {
    const lowerCasedInputValue = inputValue.toLowerCase().trim()
    const hasFilter = inputValue && inputValue.trim() !== ''

    if (isSingle) {
        return (options as Array<SingleOption<T>>).filter((option) => {
            if ('disabled' in option && option.disabled) {
                return false
            }

            const isNotSelected = !selectedItems.some(
                (item) => item.value === option.value,
            )

            if (!hasFilter) {
                return isNotSelected
            }

            const label = option.label.toLowerCase()
            const value = String(option.value).toLowerCase()
            const matchesFilter =
                label.includes(lowerCasedInputValue) ||
                value.includes(lowerCasedInputValue)

            return isNotSelected && matchesFilter
        })
    } else {
        const newOptions = structuredClone(options)
        return (newOptions as Array<GroupOption<T>>).filter((option) => {
            option.options = option.options.filter((childOption) => {
                if ('disabled' in childOption && childOption.disabled) {
                    return false
                }

                const isNotSelected = !selectedItems.some(
                    (item) => item.value === childOption.value,
                )

                if (!hasFilter) {
                    return isNotSelected
                }

                const label = childOption.label.toLowerCase()
                const value = String(childOption.value).toLowerCase()
                const matchesFilter =
                    label.includes(lowerCasedInputValue) ||
                    value.includes(lowerCasedInputValue)

                return isNotSelected && matchesFilter
            })
            return option.options.length > 0
        })
    }
}

export const useFilteredOptions = <T>(
    options: Options<T>,
    filterValue: string,
    customFilter?: FilterFunction<T>,
    selectedItem?: SingleOption<T> | null,
) => {
    return useMemo(() => {
        if (!filterValue || filterValue.trim() === '') {
            return options
        }

        try {
            if (customFilter) {
                return customFilter({
                    inputValue: filterValue,
                    options,
                    selectedItem: selectedItem || null,
                })
            }

            return defaultOptionsFilterFn(filterValue, options)
        } catch (error) {
            console.warn('Select filter error:', error)
            return defaultOptionsFilterFn(filterValue, options)
        }
    }, [options, filterValue, customFilter, selectedItem])
}

export const useFilteredOptionsMulti = <T>(
    options: Options<T>,
    filterValue: string,
    selectedItems: Array<SingleOption<T>>,
    customFilter?: FilterFunctionMulti<T>,
) => {
    return useMemo(() => {
        const isSingle = options.some((opt) => 'value' in opt)

        try {
            if (customFilter) {
                return customFilter({
                    inputValue: filterValue,
                    options,
                    selectedItems,
                })
            }

            return defaultOptionsFilterFnMulti({
                selectedItems,
                inputValue: filterValue,
                options,
                isSingle,
            })
        } catch (error) {
            console.warn('Multi-select filter error:', error)
            return defaultOptionsFilterFnMulti({
                selectedItems,
                inputValue: filterValue,
                options,
                isSingle,
            })
        }
    }, [options, filterValue, selectedItems, customFilter])
}

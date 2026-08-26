import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Cross } from '../Icons'
import Tag from '../Tag'
import Popover from '../Popover'
import classNames from '../utils/classNames'
import { useConfig } from '../ConfigProvider'
import { useForm, useFormItem } from '../Form/context'
import useControllableState from '../hooks/useControllableState'
import { useInputGroup } from '../InputGroup/context'
import { CONTROL_SIZES } from '../utils/constants'
import type { HTMLAttributes } from 'react'
import type { TypeAttributes } from '../@types/common'

export type MultiValueInputProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue'
> & {
    value?: string[]
    defaultValue?: string[]
    onChange?: (tags: string[]) => void
    placeholder?: string
    disabled?: boolean
    maxTags?: number
    validate?: (tag: string) => boolean
    onTagAdd?: (tag: string, allTags: string[]) => void
    onTagRemove?: (tag: string, allTags: string[]) => void
    className?: string
    invalid?: boolean
    size?: TypeAttributes.ControlSize
    readOnly?: boolean
}

const TAG_GAP = 4
const MORE_BUTTON_WIDTH = 70
const MIN_INPUT_WIDTH = 60

const MultiValueInput = ({
    value,
    defaultValue = [],
    onChange,
    placeholder,
    disabled = false,
    maxTags,
    validate,
    onTagAdd,
    onTagRemove,
    className = '',
    invalid,
    size,
    readOnly,
    ...props
}: MultiValueInputProps) => {
    const [tags, setTags] = useControllableState({
        prop: value,
        defaultProp: defaultValue,
        onChange,
    })
    const [inputValue, setInputValue] = useState<string>('')
    const [focusedTagIndex, setFocusedTagIndex] = useState<number>(-1)
    const [visibleCount, setVisibleCount] = useState<number>(Infinity)
    const [containerWidth, setContainerWidth] = useState<number>(0)

    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const tagsContainerRef = useRef<HTMLDivElement>(null)
    const tagRefs = useRef<Map<number, HTMLDivElement>>(new Map())

    const addTag = useCallback(
        (tagValue: string) => {
            const trimmedValue = tagValue.trim()
            if (!trimmedValue || tags?.includes(trimmedValue) || disabled)
                return

            if (maxTags && tags && tags.length >= maxTags) return

            if (validate && !validate(trimmedValue)) return

            const newTags = [...(tags || []), trimmedValue]
            setTags(newTags)
            setInputValue('')
            setFocusedTagIndex(-1)
            onTagAdd?.(trimmedValue, newTags)
        },
        [tags, disabled, maxTags, validate, setTags, onTagAdd],
    )

    const removeTag = useCallback(
        (indexToRemove: number) => {
            if (disabled || !tags) return

            const tagToRemove = tags[indexToRemove]
            const newTags = tags.filter((_, index) => index !== indexToRemove)
            setTags(newTags)
            setFocusedTagIndex(-1)
            inputRef.current?.focus()
            onTagRemove?.(tagToRemove, newTags)
        },
        [disabled, tags, setTags, onTagRemove],
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled) return

            switch (e.key) {
                case 'Enter':
                    e.preventDefault()
                    if (inputValue.trim()) {
                        addTag(inputValue)
                    }
                    break

                case 'Backspace':
                    if (inputValue === '' && tags && tags.length > 0) {
                        if (focusedTagIndex >= 0) {
                            removeTag(focusedTagIndex)
                        } else {
                            setFocusedTagIndex(tags.length - 1)
                        }
                    } else if (focusedTagIndex >= 0) {
                        removeTag(focusedTagIndex)
                    }
                    break

                case 'ArrowLeft':
                    if (
                        inputValue === '' ||
                        (inputValue !== '' &&
                            e.currentTarget.selectionStart === 0)
                    ) {
                        e.preventDefault()
                        const maxVisibleIndex =
                            Math.min(visibleCount, tags?.length || 0) - 1
                        if (focusedTagIndex === -1) {
                            setFocusedTagIndex(maxVisibleIndex)
                        } else if (focusedTagIndex > 0) {
                            setFocusedTagIndex(focusedTagIndex - 1)
                        }
                    }
                    break

                case 'ArrowRight':
                    if (focusedTagIndex >= 0) {
                        e.preventDefault()
                        const maxVisibleIndex =
                            Math.min(visibleCount, tags?.length || 0) - 1
                        if (focusedTagIndex < maxVisibleIndex) {
                            setFocusedTagIndex(focusedTagIndex + 1)
                        } else {
                            setFocusedTagIndex(-1)
                        }
                    }
                    break

                case 'Delete':
                    if (focusedTagIndex >= 0) {
                        e.preventDefault()
                        removeTag(focusedTagIndex)
                    }
                    break

                case 'Escape':
                    setFocusedTagIndex(-1)
                    break
            }
        },
        [
            disabled,
            inputValue,
            tags,
            focusedTagIndex,
            visibleCount,
            addTag,
            removeTag,
        ],
    )

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return
            setInputValue(e.target.value)
            setFocusedTagIndex(-1)
        },
        [disabled],
    )

    const handleContainerClick = useCallback(() => {
        if (!disabled) {
            inputRef.current?.focus()
        }
    }, [disabled])

    const handleTagClick = useCallback((index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setFocusedTagIndex(index)
    }, [])

    const handleTagKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled) return

            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault()
                    removeTag(index)
                    break
                case 'ArrowLeft':
                    e.preventDefault()
                    if (index > 0) {
                        setFocusedTagIndex(index - 1)
                    }
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    if (index < (tags?.length || 0) - 1) {
                        setFocusedTagIndex(index + 1)
                    } else {
                        setFocusedTagIndex(-1)
                        inputRef.current?.focus()
                    }
                    break
                case 'Backspace':
                case 'Delete':
                    e.preventDefault()
                    removeTag(index)
                    break
            }
        },
        [disabled, tags, removeTag],
    )

    const calculateVisibleTags = useCallback(() => {
        if (!tagsContainerRef.current || !tags || tags.length === 0) {
            setVisibleCount(Infinity)
            return
        }

        const containerEl = tagsContainerRef.current
        const availableWidth = containerEl.offsetWidth - MIN_INPUT_WIDTH

        if (availableWidth <= 0) {
            setVisibleCount(1)
            return
        }

        let totalWidth = 0
        let count = 0

        for (let i = 0; i < tags.length; i++) {
            const tagEl = tagRefs.current.get(i)
            if (!tagEl) continue

            const tagWidth = tagEl.offsetWidth + TAG_GAP
            const needsMoreButton = i < tags.length - 1
            const reservedWidth = needsMoreButton ? MORE_BUTTON_WIDTH : 0

            if (totalWidth + tagWidth + reservedWidth <= availableWidth) {
                totalWidth += tagWidth
                count++
            } else {
                break
            }
        }

        setVisibleCount(Math.max(1, count))
    }, [tags])

    useEffect(() => {
        const container = tagsContainerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })

        resizeObserver.observe(container)
        return () => resizeObserver.disconnect()
    }, [])

    useEffect(() => {
        const timer = setTimeout(calculateVisibleTags, 0)
        return () => clearTimeout(timer)
    }, [containerWidth, tags, calculateVisibleTags])

    useEffect(() => {
        if (!disabled) {
            inputRef.current?.focus()
        }
    }, [disabled])

    const { controlSize } = useConfig()
    const formControlSize = useForm()?.size
    const formItemInvalid = useFormItem()?.invalid
    const inputGroupSize = useInputGroup()?.size

    const inputSize = size || inputGroupSize || formControlSize || controlSize

    const inputDefaultClass = 'input px-2'
    const inputSizeClass = `input-${inputSize} ${CONTROL_SIZES[inputSize].h}`
    const inputFocusClass = `input-focus`

    const isInputInvalid = invalid || formItemInvalid
    const inputClass = classNames(
        inputDefaultClass,
        inputSizeClass,
        !isInputInvalid && !readOnly && inputFocusClass,
        disabled && 'input-disabled',
        isInputInvalid && 'input-invalid',
    )

    const isMaxTagsReached = maxTags && tags && tags.length >= maxTags
    const tagCount = tags?.length || 0

    const { visibleTags, hiddenTags, hiddenCount } = useMemo(() => {
        if (!tags) return { visibleTags: [], hiddenTags: [], hiddenCount: 0 }

        const visible = tags.slice(0, visibleCount)
        const hidden = tags.slice(visibleCount)
        return {
            visibleTags: visible,
            hiddenTags: hidden,
            hiddenCount: hidden.length,
        }
    }, [tags, visibleCount])

    const renderTag = (tag: string, index: number, isInPopover = false) => (
        <Tag
            key={`${isInPopover ? 'popover-' : ''}${index}`}
            className="gap-1 dark:bg-gray-100/10 dark:text-gray-100 flex-shrink-0"
            onClick={(e) => {
                if (!disabled && !isInPopover) {
                    handleTagClick(index, e)
                }
            }}
        >
            <span>{tag}</span>
            <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation()
                    removeTag(isInPopover ? visibleCount + index : index)
                }}
                onKeyDown={(e) => !isInPopover && handleTagKeyDown(index, e)}
                className="flex-shrink-0 h-3 w-3 rounded-full inline-flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Remove ${tag} tag`}
                tabIndex={!isInPopover && focusedTagIndex === index ? 0 : -1}
            >
                <Cross className="h-2.5 w-2.5" />
            </button>
        </Tag>
    )

    return (
        <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={classNames('multi-value-input', inputClass, className)}
            role="group"
            aria-label="Multi-value input with tags"
            {...props}
        >
            <div
                ref={tagsContainerRef}
                className="flex flex-nowrap gap-1 items-center w-full min-w-0"
            >
                <div
                    className="absolute opacity-0 pointer-events-none flex gap-1"
                    aria-hidden="true"
                >
                    {tags?.map((tag, index) => (
                        <div
                            key={`measure-${index}`}
                            ref={(el) => {
                                if (el) {
                                    tagRefs.current.set(index, el)
                                } else {
                                    tagRefs.current.delete(index)
                                }
                            }}
                        >
                            <Tag className="gap-1">
                                <span>{tag}</span>
                                <span className="h-3 w-3" />
                            </Tag>
                        </div>
                    ))}
                </div>
                {visibleTags.map((tag, index) => renderTag(tag, index))}
                {hiddenCount > 0 && (
                    <Popover
                        placement="bottom-start"
                        trigger="click"
                        width={250}
                        renderTrigger={
                            <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-primary font-medium whitespace-nowrap hover:underline focus:outline-none flex-shrink-0"
                            >
                                +{hiddenCount} more
                            </button>
                        }
                    >
                        <div className="flex flex-wrap gap-1">
                            {hiddenTags.map((tag, index) =>
                                renderTag(tag, index, true),
                            )}
                        </div>
                    </Popover>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={tagCount === 0 ? placeholder : ''}
                    disabled={(disabled || isMaxTagsReached) as boolean}
                    readOnly={readOnly}
                    className="flex-1 min-w-[60px] w-0 border-none outline-none bg-transparent placeholder:text-gray-400 disabled:cursor-not-allowed"
                    aria-describedby="tag-instructions"
                />
            </div>
        </div>
    )
}

export default MultiValueInput

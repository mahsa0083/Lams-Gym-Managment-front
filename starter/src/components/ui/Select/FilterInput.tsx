import { forwardRef, KeyboardEvent, memo } from 'react'
import classNames from '../utils/classNames'

export interface FilterInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
    className?: string
    disabled?: boolean
    role?: string
    'aria-label'?: string
    'aria-autocomplete'?: 'list' | 'none' | 'inline' | 'both'
    'aria-expanded'?: boolean
    'aria-owns'?: string
    'aria-activedescendant'?: string
}

const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(
    (
        {
            value,
            onChange,
            placeholder = 'جستجو...',
            onKeyDown,
            className,
            disabled,
            role = 'searchbox',
            'aria-label': ariaLabel = 'فیلتر گزینه‌ها',
            'aria-autocomplete': ariaAutocomplete = 'list',
            'aria-expanded': ariaExpanded,
            'aria-owns': ariaOwns,
            'aria-activedescendant': ariaActiveDescendant,
            ...rest
        },
        ref,
    ) => {
        const handleMouseDown = (e: React.MouseEvent) => {
            e.stopPropagation()
        }

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
        }

        return (
            <div
                className="select-filter-wrapper"
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                <input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className={classNames('select-filter-input', className)}
                    disabled={disabled}
                    autoFocus
                    role={role}
                    aria-label={ariaLabel}
                    aria-autocomplete={ariaAutocomplete}
                    aria-expanded={ariaExpanded}
                    aria-owns={ariaOwns}
                    aria-activedescendant={ariaActiveDescendant}
                    onClick={handleClick}
                    {...rest}
                />
            </div>
        )
    },
)

FilterInput.displayName = 'FilterInput'

export default memo(FilterInput)

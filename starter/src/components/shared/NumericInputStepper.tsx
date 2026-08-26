import { useCallback } from 'react'
import Divider from './Divider'

type NumericInputStepperProps = {
    value?: number
    onChange?: (value: number) => void
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    className?: string
}

const NumericInputStepper = ({
    value = 0,
    onChange,
    min = 0,
    max = Infinity,
    step = 1,
    disabled = false,
    className = '',
}: NumericInputStepperProps) => {
    const handleIncrement = useCallback(() => {
        if (disabled) return
        const newValue = Math.min(max, value + step)
        onChange?.(newValue)
    }, [value, step, max, disabled, onChange])

    const handleDecrement = useCallback(() => {
        if (disabled) return
        const newValue = Math.max(min, value - step)
        onChange?.(newValue)
    }, [value, step, min, disabled, onChange])

    return (
        <div
            className={`flex flex-col ${className} ltr:border-l rtl:border-r border-gray-200 dark:border-gray-800`}
        >
            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                className="flex items-center justify-center w-8 text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            >
                ▲
            </button>
            <Divider className="my-0" />
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                className="flex items-center justify-center w-8 text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            >
                ▼
            </button>
        </div>
    )
}

export default NumericInputStepper

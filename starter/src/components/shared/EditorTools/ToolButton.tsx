import classNames from '@/utils/classNames'
import type { ComponentProps, ReactNode } from 'react'

type BaseToolButtonProps = {
    active?: boolean
    title?: string
    className?: string
    disabled?: boolean
    children?: ReactNode
}

type ButtonVariantProps = BaseToolButtonProps &
    ComponentProps<'button'> & {
        variant?: 'button'
    }

type InputVariantProps = BaseToolButtonProps &
    ComponentProps<'input'> & {
        variant: 'input'
    }

export type ToolButtonProps = ButtonVariantProps | InputVariantProps

const ToolButton = (props: ToolButtonProps) => {
    const {
        className,
        disabled,
        active,
        variant = 'button',
        children,
        ...rest
    } = props

    const toolButtonClass = classNames(
        'tool-button text-lg flex items-center p-1.5 rounded-lg',
        active &&
            'bg-gray-200/60 dark:bg-gray-100/10 text-gray-900 dark:text-gray-100',
        !active &&
            !disabled &&
            'hover:bg-gray-100 dark:hover:bg-gray-100/10 hover:text-gray-900 dark:hover:text-gray-100',
        disabled &&
            'opacity-40 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
        className,
    )

    if (variant === 'input') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { children: _, ...inputRest } = rest as ComponentProps<'input'>

        return (
            <label className={toolButtonClass}>
                <input
                    type="button"
                    hidden
                    disabled={disabled}
                    {...inputRest}
                />
                {children}
            </label>
        )
    }

    return (
        <button
            type="button"
            className={toolButtonClass}
            disabled={disabled}
            {...(rest as ComponentProps<'button'>)}
        >
            {children}
        </button>
    )
}

export default ToolButton

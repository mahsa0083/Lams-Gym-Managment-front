import classNames from '../utils/classNames'
import { useConfig } from '../ConfigProvider'
import { useForm } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { CONTROL_SIZES, SIZES } from '../utils/constants'
import { Spinner } from '../Spinner'
import type { TypeAttributes } from '../@types/common'
import type {
    ReactNode,
    MouseEvent,
    ElementType,
    ComponentPropsWithoutRef,
} from 'react'

type ButtonOwnProps<E extends ElementType = 'button'> = {
    asElement?: E
    active?: boolean
    block?: boolean
    className?:
        | string
        | ((state: { active: boolean; unclickable: boolean }) => string)
    clickFeedback?: boolean
    disabled?: boolean
    icon?: string | ReactNode
    loading?: boolean
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    shape?: TypeAttributes.Shape
    size?: TypeAttributes.ControlSize
    variant?: 'solid' | 'subtle' | 'default' | 'ghost' | 'link'
    iconAlignment?: 'start' | 'end'
    ref?: React.Ref<HTMLButtonElement>
}

export type ButtonProps<E extends ElementType = 'button'> = ButtonOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>>

type ButtonColor = {
    bgColor: string
    hoverColor: string
    activeColor: string
    textColor: string
}

const radiusShape: Record<TypeAttributes.Shape, string> = {
    round: 'rounded-lg',
    circle: 'rounded-full',
    none: 'rounded-none',
}

const Button = <E extends ElementType = 'button'>(props: ButtonProps<E>) => {
    const {
        asElement: Component = 'button',
        active = false,
        block = false,
        children,
        className,
        clickFeedback = true,
        disabled,
        icon,
        loading = false,
        ref,
        shape = 'round',
        size,
        variant = 'default',
        iconAlignment = 'start',
        ...rest
    } = props
    const { controlSize, ui } = useConfig()
    const formControlSize = useForm()?.size
    const inputGroupSize = useInputGroup()?.size
    const defaultClass = 'button'
    const sizeIconClass = 'inline-flex items-center justify-center'

    const buttonSize = size || inputGroupSize || formControlSize || controlSize
    const feedback = clickFeedback || !ui?.button?.disableClickFeedback
    const unclickable = disabled || loading

    const getButtonSize = () => {
        let sizeClass = ''
        switch (buttonSize) {
            case SIZES.LG:
                sizeClass = classNames(
                    CONTROL_SIZES.lg.h,
                    radiusShape[shape],
                    icon && !children
                        ? `${CONTROL_SIZES.lg.w} ${sizeIconClass} text-2xl`
                        : 'px-8 text-base',
                )
                break
            case SIZES.SM:
                sizeClass = classNames(
                    CONTROL_SIZES.sm.h,
                    shape === 'round' ? 'rounded-md' : radiusShape[shape],
                    icon && !children
                        ? `${CONTROL_SIZES.sm.w} ${sizeIconClass} text-base`
                        : 'px-3 text-xs',
                )
                break
            default:
                sizeClass = classNames(
                    CONTROL_SIZES.md.h,
                    radiusShape[shape],
                    icon && !children
                        ? `${CONTROL_SIZES.md.w} ${sizeIconClass} text-xl`
                        : 'px-4',
                )
                break
        }
        return sizeClass
    }

    const disabledClass = 'opacity-50 cursor-not-allowed'

    const solidColor = () => {
        const btn = {
            bgColor: active ? `bg-primary-deep` : `bg-primary`,
            textColor: 'text-muted',
            hoverColor: active ? '' : `hover:bg-primary-mild`,
            activeColor: ``,
        }
        return getBtnColor(btn)
    }

    const subtleColor = () => {
        const btn = {
            bgColor: active
                ? `bg-gray-300 dark:bg-gray-500`
                : `bg-gray-100 dark:bg-gray-700`,
            textColor: `text-gray-900 dark:text-gray-100`,
            hoverColor: active
                ? ''
                : `hover:bg-gray-200 hover:text-gray-900 hover:dark:bg-gray-600 hover:dark:text-gray-100 `,
            activeColor: ``,
        }
        return getBtnColor(btn)
    }

    const defaultColor = () => {
        const btn = {
            bgColor: active
                ? `bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600`
                : `bg-white border border-gray-300 dark:bg-gray-100/10 dark:border-gray-600`,
            textColor: `text-gray-900 dark:text-gray-100`,
            hoverColor: active
                ? ''
                : `hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 hover:dark:border-gray-600`,
            activeColor: ``,
        }
        return getBtnColor(btn)
    }

    const linkColor = () => {
        const btn = {
            bgColor: active ? `` : `dark:primary-mild`,
            textColor: `text-gray-900 dark:text-gray-100`,
            hoverColor: active ? '' : `hover:text-primary-mild`,
            activeColor: `dark:active:primary-mild`,
        }
        return getBtnColor(btn)
    }

    const ghostColor = () => {
        const btn = {
            bgColor: active ? `bg-gray-100 dark:bg-gray-500` : ``,
            textColor: `text-gray-900 dark:text-gray-100`,
            hoverColor: active
                ? ''
                : `hover:bg-neutral-100 dark:hover:bg-neutral-600`,
            activeColor: ``,
        }
        return getBtnColor(btn)
    }

    const getBtnColor = ({
        bgColor,
        hoverColor,
        activeColor,
        textColor,
    }: ButtonColor) => {
        return `${bgColor} ${
            unclickable ? disabledClass : hoverColor + ' ' + activeColor
        } ${textColor}`
    }

    const btnColor = () => {
        switch (variant) {
            case 'solid':
                return solidColor()
            case 'subtle':
                return subtleColor()
            case 'default':
                return defaultColor()
            case 'ghost':
                return ghostColor()
            case 'link':
                return linkColor()
            default:
                return defaultColor()
        }
    }

    const classes = classNames(
        defaultClass,
        typeof className !== 'function' ? btnColor() : '',
        getButtonSize(),
        className,
        block ? 'w-full' : '',
        feedback && !unclickable && 'button-press-feedback',
        typeof className === 'function'
            ? className?.({
                  active,
                  unclickable,
              })
            : className,
    )

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        const { onClick } = props
        if (unclickable) {
            e.preventDefault()
            return
        }
        onClick?.(e)
    }

    const renderChildren = () => {
        if (loading && children) {
            return (
                <span className="flex items-center justify-center">
                    <Spinner enableTheme={false} size={18} className="ml-1" />
                    {children}
                </span>
            )
        }

        if (icon && !children && loading) {
            return <Spinner size={18} enableTheme={false} />
        }

        if (icon && !children && !loading) {
            return <>{icon}</>
        }

        if (icon && children && !loading) {
            return (
                <span className="flex gap-1 items-center justify-center">
                    {iconAlignment === 'start' && (
                        <span
                            className={classNames(
                                buttonSize === SIZES.SM ? 'text-sm' : 'text-lg',
                            )}
                        >
                            {icon}
                        </span>
                    )}
                    <span>{children}</span>
                    {iconAlignment === 'end' && (
                        <span
                            className={classNames(
                                buttonSize === SIZES.SM ? 'text-sm' : 'text-lg',
                            )}
                        >
                            {icon}
                        </span>
                    )}
                </span>
            )
        }

        return <>{children}</>
    }

    return (
        <Component
            ref={ref}
            className={classes}
            {...rest}
            onClick={handleClick}
        >
            {renderChildren()}
        </Component>
    )
}

export default Button

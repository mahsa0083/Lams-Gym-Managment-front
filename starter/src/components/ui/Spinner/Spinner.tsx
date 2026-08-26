import classNames from 'classnames'
import type { CommonProps } from '../@types/common'
import type { ElementType, ComponentProps, Ref } from 'react'

export interface SpinnerProps extends CommonProps {
    indicator?: ElementType
    isSpining?: boolean
    size?: string | number
    enableTheme?: boolean
    ref?: Ref<HTMLElement>
}

const DefaultIcon = ({
    height,
    width,
    ...rest
}: ComponentProps<ElementType>) => (
    <svg
        height={height}
        width={width}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        aria-labelledby=":r1:"
        {...rest}
    >
        <circle
            cx="8"
            cy="8"
            r="7"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
        ></circle>
        <path
            d="M15 8a7.002 7.002 0 00-7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
        ></path>
    </svg>
)

const Spinner = (props: SpinnerProps) => {
    const {
        className,
        enableTheme = false,
        indicator: Component = DefaultIcon,
        isSpining = true,
        size = 20,
        style,
        ref,
        ...rest
    } = props

    const spinnerStyle = {
        height: size,
        width: size,
        ...style,
    }

    const spinnerClass = classNames(
        'spinner',
        enableTheme && 'spinner-default-theme',
        isSpining && 'animate-spin',
        className,
    )

    return (
        <Component
            ref={ref}
            style={spinnerStyle}
            className={spinnerClass}
            height={size}
            width={size}
            {...rest}
        />
    )
}

export default Spinner

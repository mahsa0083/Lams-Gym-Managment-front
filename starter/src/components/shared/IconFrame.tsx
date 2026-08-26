import classNames from '@/utils/classNames'
import type { ComponentProps } from 'react'

type IconFrameProps = ComponentProps<'div'> & {
    variant?: 'default' | 'thick' | 'layered'
    size?: number
}

const Layered = ({ size, children, className, ...rest }: IconFrameProps) => {
    return (
        <div
            className={classNames(
                'border border-gray-300 dark:border-gray-600 rounded-lg p-0.5 inline-flex z-[1]',
                className,
            )}
            {...rest}
        >
            <div
                className="flex items-center justify-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg"
                style={{ height: size, width: size }}
            >
                {children}
            </div>
        </div>
    )
}

const Thick = ({ size, children, className, ...rest }: IconFrameProps) => {
    return (
        <div
            className={classNames(
                'flex items-center justify-center border ring ring-gray-200 dark:ring-gray-600 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 z-[1]',
                className,
            )}
            style={{ height: size, width: size }}
            {...rest}
        >
            {children}
        </div>
    )
}

const IconFrame = ({
    variant,
    size = 40,
    children,
    className,
    ...rest
}: IconFrameProps) => {
    if (variant === 'layered') {
        return (
            <Layered size={size} className={className} {...rest}>
                {children}
            </Layered>
        )
    }

    if (variant === 'thick') {
        return (
            <Thick size={size} className={className} {...rest}>
                {children}
            </Thick>
        )
    }

    return (
        <div
            className={classNames(
                'flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 z-[1]',
                className,
            )}
            {...rest}
            style={{ height: size, width: size }}
        >
            {children}
        </div>
    )
}

export default IconFrame

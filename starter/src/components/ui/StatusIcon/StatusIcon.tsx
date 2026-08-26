import classNames from '../utils/classNames'
import { Info, Success, Warning, Danger } from '../Icons'
import type { TypeAttributes, CommonProps } from '../@types/common'
import type { ReactNode, JSX } from 'react'

export interface StatusIconProps extends CommonProps {
    type: TypeAttributes.Status
    custom?: ReactNode | JSX.Element
    iconColor?: string
}

const ICONS: Record<
    TypeAttributes.Status,
    {
        color: string
        icon: JSX.Element
    }
> = {
    success: {
        color: 'text-success',
        icon: <Success />,
    },
    info: {
        color: 'text-info',
        icon: <Info />,
    },
    warning: {
        color: 'text-warning',
        icon: <Warning />,
    },
    danger: {
        color: 'text-error',
        icon: <Danger />,
    },
}

const StatusIcon = (props: StatusIconProps) => {
    const { type = 'info', custom, iconColor, className } = props

    const icon = ICONS[type]

    return (
        <span
            className={classNames(
                'text-xl',
                iconColor || icon.color,
                className,
            )}
        >
            {custom || icon.icon}
        </span>
    )
}

export default StatusIcon

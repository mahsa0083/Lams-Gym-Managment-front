import classNames from '@/utils/classNames'
import Tag from '@/components/ui/Tag'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'
import type { ReactNode, Ref } from 'react'

type GrowShrinkTagProps = {
    value?: number
    showIcon?: boolean
    prefix?: ReactNode | string
    suffix?: ReactNode | string
    className?: string
    ref?: Ref<HTMLDivElement>
}

function growShrinkColor(value: number, type: 'bg' | 'text') {
    if (value > 0) {
        return type === 'bg'
            ? 'bg-success-subtle dark:bg-success-subtle'
            : 'text-success dark:text-success'
    }

    if (value < 0) {
        return type === 'bg'
            ? 'bg-error-subtle dark:bg-error-subtle'
            : 'text-error dark:text-error'
    }

    return ''
}

const GrowShrinkTag = (props: GrowShrinkTagProps) => {
    const { value = 0, className, prefix, suffix, showIcon = true, ref } = props

    return (
        <Tag
            ref={ref}
            className={classNames(
                'gap-0.5 font-semibold border-0',
                growShrinkColor(value, 'text'),
                growShrinkColor(value, 'bg'),
                className,
            )}
        >
            {value !== 0 && (
                <span>
                    {showIcon && (value > 0 ? <HiArrowUp /> : <HiArrowDown />)}
                </span>
            )}
            <span>
                {prefix}
                {value}
                {suffix}
            </span>
        </Tag>
    )
}

export default GrowShrinkTag

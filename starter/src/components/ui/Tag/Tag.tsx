import classNames from '../utils/classNames'
import type { ReactNode, Ref, ComponentProps } from 'react'

export type TagProps = {
    children: ReactNode
    prefix?: boolean | ReactNode
    prefixClass?: string
    ref?: Ref<HTMLDivElement>
    suffix?: boolean | ReactNode
    suffixClass?: string
} & Omit<ComponentProps<'div'>, 'prefix'>

const Tag = (props: TagProps) => {
    const {
        className,
        children,
        prefix,
        ref,
        suffix,
        prefixClass,
        suffixClass,
        ...rest
    } = props

    return (
        <span ref={ref} className={classNames('tag', className)} {...rest}>
            {prefix && typeof prefix === 'boolean' && (
                <span
                    className={classNames('tag-affix tag-prefix', prefixClass)}
                />
            )}
            {typeof prefix === 'object' && prefix}
            {children}
            {suffix && typeof suffix === 'boolean' && (
                <span
                    className={classNames('tag-affix tag-suffix', suffixClass)}
                />
            )}
            {typeof suffix === 'object' && suffix}
        </span>
    )
}

export default Tag

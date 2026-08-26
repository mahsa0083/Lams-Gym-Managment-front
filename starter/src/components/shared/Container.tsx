import classNames from 'classnames'
import { CommonProps } from '@/@types/common'
import type { ElementType, Ref } from 'react'

type ContainerSize = 'sm' | 'md' | 'lg'

interface ContainerProps extends CommonProps {
    asElement?: ElementType
    ref?: Ref<HTMLElement>
    size?: ContainerSize
}

const Container = (props: ContainerProps) => {
    const {
        className,
        children,
        asElement: Component = 'div',
        size = 'lg',
        ref,
        ...rest
    } = props

    const getSizeClass = (size: ContainerSize) => {
        switch (size) {
            case 'sm':
                return 'max-w-[800px]'
            case 'md':
                return 'max-w-[1200px]'
            case 'lg':
            default:
                return ''
        }
    }

    return (
        <Component
            ref={ref}
            className={classNames(
                'container mx-auto',
                getSizeClass(size),
                className,
            )}
            {...rest}
        >
            {children}
        </Component>
    )
}

export default Container

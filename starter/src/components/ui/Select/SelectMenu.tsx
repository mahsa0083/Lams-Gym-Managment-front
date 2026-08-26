import classNames from '@/utils/classNames'
import { forwardRef } from 'react'
import type { ReactNode, CSSProperties, KeyboardEvent } from 'react'

type SelectMenuProps = {
    children: ReactNode
    isOpen: boolean
    style?: CSSProperties
    role?: string
    'aria-labelledby'?: string
    'aria-multiselectable'?: boolean
    id?: string
    'aria-activedescendant'?: string
    onKeyDown?: (event: KeyboardEvent<HTMLUListElement>) => void
}

const SelectMenu = forwardRef<HTMLUListElement, SelectMenuProps>(
    (props, ref) => {
        const { isOpen, children, style, ...rest } = props

        return (
            <ul
                ref={ref}
                className="select-menu-wrapper"
                style={style}
                {...rest}
            >
                {isOpen && (
                    <div className={classNames('select-menu')}>{children}</div>
                )}
            </ul>
        )
    },
)

SelectMenu.displayName = 'SelectMenu'

export default SelectMenu

import classNames from 'classnames'
import { MenuContextProvider } from './context/menuContext'
import type { CommonProps } from '../@types/common'
import type { Ref } from 'react'

export interface MenuProps extends CommonProps {
    defaultActiveKeys?: Array<string>
    defaultExpandedKeys?: Array<string>
    defaultCollapseActiveKeys?: Array<string>
    menuItemHeight?: number
    onSelect?: (eventKey: string, e: MouseEvent) => void
    ref?: Ref<HTMLUListElement>
    sideCollapsed?: boolean
    variant?: 'default' | 'subtle'
}

const Menu = (props: MenuProps) => {
    const {
        children,
        className,
        defaultActiveKeys = [],
        defaultExpandedKeys = [],
        defaultCollapseActiveKeys = [],
        menuItemHeight = 36,
        onSelect,
        ref,
        sideCollapsed = false,
        variant = 'default',
        ...rest
    } = props

    const menuClass = classNames('menu', `menu-${variant}`, className)

    return (
        <ul ref={ref} className={menuClass} {...rest}>
            <MenuContextProvider
                value={{
                    onSelect,
                    menuItemHeight,
                    sideCollapsed,
                    defaultExpandedKeys,
                    defaultActiveKeys,
                    defaultCollapseActiveKeys,
                }}
            >
                {children}
            </MenuContextProvider>
        </ul>
    )
}

export default Menu

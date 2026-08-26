import MenuItemIndicator from './MenuItemIndicator'
import classNames from '../utils/classNames'
import type { CommonProps } from '../@types/common'
import type { ElementType, Ref } from 'react'

export interface MenuItemElementProps extends CommonProps {
    asElement?: ElementType
    id?: string
    disabled?: boolean
    hierarchyIndicator?: boolean
    eventKey?: string
    isActive?: boolean
    menuItemHeight?: string | number
    onSelect?: (eventKey: string, e: MouseEvent) => void
    ref?: Ref<HTMLElement>
}

const MenuItemElement = (props: MenuItemElementProps) => {
    const {
        asElement: Component = 'div',
        children,
        className,
        disabled,
        hierarchyIndicator,
        eventKey,
        isActive,
        menuItemHeight = 36,
        onSelect,
        ref,
        style,
        ...rest
    } = props

    const menuItemActiveClass = `menu-item-active`
    const menuItemHoverClass = `menu-item-hoverable`
    const disabledClass = 'menu-item-disabled'
    const menuItemClass = classNames(
        'menu-item',
        isActive && menuItemActiveClass,
        disabled && disabledClass,
        !disabled && menuItemHoverClass,
        hierarchyIndicator && 'items-center gap-2',
        className,
    )

    const hanldeOnClick = (e: MouseEvent) => {
        if (onSelect) {
            onSelect(eventKey as string, e)
        }
    }

    const indicator = (
        <MenuItemIndicator height={menuItemHeight} isActive={isActive} />
    )

    return (
        <Component
            ref={ref}
            className={menuItemClass}
            style={{ height: `${menuItemHeight}px`, ...style }}
            onClick={hanldeOnClick}
            {...rest}
        >
            {hierarchyIndicator ? (
                <>
                    {indicator}
                    {children}
                </>
            ) : (
                <>{children}</>
            )}
        </Component>
    )
}

export default MenuItemElement

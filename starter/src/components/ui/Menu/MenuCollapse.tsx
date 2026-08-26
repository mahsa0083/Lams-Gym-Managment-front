import { useState, useEffect, useContext } from 'react'
import { CollapseContextProvider } from './context/collapseContext'
import MenuItemIndicator from '../ManuItemElement/MenuItemIndicator'
import classNames from 'classnames'
import { motion } from 'motion/react'
import MenuContext from './context/menuContext'
import { ChevronDown } from '../Icons'
import type { CommonProps } from '../@types/common'
import type { ReactNode, MouseEvent } from 'react'

export interface MenuCollapseProps extends CommonProps {
    active?: boolean
    eventKey?: string
    expanded?: boolean
    hierarchyIndicator?: boolean
    indent?: boolean
    label?: string | ReactNode
    onToggle?: (expanded: boolean, e: MouseEvent<HTMLDivElement>) => void
}

const MenuCollapse = (props: MenuCollapseProps) => {
    const {
        active,
        children,
        className,
        eventKey,
        expanded = false,
        indent = true,
        label = null,
        onToggle,
        hierarchyIndicator,
    } = props

    const [isExpanded, setIsExpanded] = useState(expanded)

    const {
        sideCollapsed,
        defaultExpandedKeys,
        defaultCollapseActiveKeys,
        menuItemHeight,
    } = useContext(MenuContext)

    useEffect(() => {
        if ((defaultExpandedKeys as string[]).includes(eventKey as string)) {
            setIsExpanded(true)
        }
        if (expanded !== isExpanded) {
            setIsExpanded(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded, eventKey, defaultExpandedKeys])

    const toggleCollapse = (e: MouseEvent<HTMLDivElement>) => {
        if (typeof onToggle === 'function') {
            onToggle(!isExpanded, e)
        }
        setIsExpanded(!isExpanded)
    }

    const menuCollapseItemClass = classNames(
        'menu-collapse-item',
        ((defaultCollapseActiveKeys &&
            defaultCollapseActiveKeys.includes(eventKey as string)) ||
            active) &&
            'menu-collapse-item-active',
        className,
    )

    return (
        <li className="menu-collapse">
            <div
                className={menuCollapseItemClass}
                role="presentation"
                onClick={toggleCollapse}
                style={{ height: menuItemHeight }}
            >
                <span className="flex items-center gap-2">
                    {hierarchyIndicator && (
                        <MenuItemIndicator
                            height={menuItemHeight as number}
                            isActive={active}
                        />
                    )}
                    {label}
                </span>
                <motion.span
                    initial={{ transform: 'rotate(0deg)' }}
                    animate={{
                        transform: isExpanded
                            ? 'rotate(-180deg)'
                            : 'rotate(0deg)',
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {sideCollapsed ? null : <ChevronDown />}
                </motion.span>
            </div>
            <CollapseContextProvider value={isExpanded}>
                <motion.ul
                    className={classNames(
                        'menu-collapse-content',
                        indent ? 'menu-collapse-content-indent' : '',
                    )}
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{
                        opacity: isExpanded ? 1 : 0,
                        height: isExpanded ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {children}
                </motion.ul>
            </CollapseContextProvider>
        </li>
    )
}

MenuCollapse.displayName = 'MenuCollapse'

export default MenuCollapse

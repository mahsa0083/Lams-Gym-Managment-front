import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import VerticalMenuIcon from './VerticalMenuIcon'
import type { CommonProps, TranslationFn } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    t: TranslationFn
    indent?: boolean
    hierarchyIndicator?: boolean
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
    renderAsIcon?: boolean
    currentKey?: string
    parentKeys?: string[]
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({
    nav,
    indent,
    hierarchyIndicator,
    children,
    t,
}: DefaultItemProps) => {
    return (
        <MenuCollapse
            key={nav.key}
            label={
                <>
                    <VerticalMenuIcon icon={nav.icon} />
                    <span>{t(nav.translateKey, nav.title)}</span>
                </>
            }
            eventKey={nav.key}
            expanded={false}
            hierarchyIndicator={hierarchyIndicator}
            indent={indent}
        >
            {children}
        </MenuCollapse>
    )
}

const CollapsedItem = ({
    nav,
    direction,
    children,
    t,
    renderAsIcon,
    parentKeys,
}: CollapsedItemProps) => {
    const menuItem = (
        <MenuItem
            key={nav.key}
            isActive={parentKeys?.includes(nav.key)}
            eventKey={nav.key}
            className="mb-2 flex justify-center max-w-10"
        >
            <VerticalMenuIcon icon={nav.icon} />
        </MenuItem>
    )

    const dropdownItem = (
        <div key={nav.key}>{t(nav.translateKey, nav.title)}</div>
    )

    return (
        <Dropdown
            trigger="hover"
            renderTitle={
                renderAsIcon ? (
                    <div className="flex justify-center">{menuItem}</div>
                ) : (
                    dropdownItem
                )
            }
            placement={direction === 'rtl' ? 'left-start' : 'right-start'}
        >
            {children}
        </Dropdown>
    )
}

const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) => {
    return sideCollapsed ? (
        <CollapsedItem {...rest} />
    ) : (
        <DefaultItem {...rest} />
    )
}

export default VerticalCollapsedMenuItem

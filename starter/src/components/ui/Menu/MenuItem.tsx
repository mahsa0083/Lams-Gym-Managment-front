import { MenuContextConsumer } from './context/menuContext'
import { GroupContextConsumer } from './context/groupContext'
import { CollapseContextConsumer } from './context/collapseContext'
import BaseMenuItem from '../ManuItemElement'
import type { MenuItemElementProps as BaseMenuItemProps } from '../ManuItemElement'

export type MenuItemProps = BaseMenuItemProps

const MenuItem = (props: MenuItemProps) => {
    const { eventKey, ...rest } = props

    return (
        <MenuContextConsumer>
            {(context) => (
                <GroupContextConsumer>
                    {() => (
                        <CollapseContextConsumer>
                            {() => (
                                <BaseMenuItem
                                    asElement={'li'}
                                    menuItemHeight={context.menuItemHeight}
                                    isActive={(
                                        context.defaultActiveKeys as string[]
                                    ).includes(eventKey as string)}
                                    eventKey={eventKey}
                                    onSelect={context.onSelect}
                                    {...rest}
                                />
                            )}
                        </CollapseContextConsumer>
                    )}
                </GroupContextConsumer>
            )}
        </MenuContextConsumer>
    )
}

MenuItem.displayName = 'MenuItem'

export default MenuItem

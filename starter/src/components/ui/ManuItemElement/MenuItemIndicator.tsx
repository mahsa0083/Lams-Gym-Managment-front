import classNames from '../utils/classNames'

type MenuItemIndicatorProps = {
    isActive?: boolean
    height: number | string
}

const MenuItemIndicator = ({ isActive, height }: MenuItemIndicatorProps) => {
    return (
        <div
            className={classNames('menu-hierarchy-indicator')}
            style={{ height }}
        >
            <div
                className={classNames(
                    'menu-hierarchy-indicator-line',
                    isActive && 'active',
                )}
            />
        </div>
    )
}

export default MenuItemIndicator

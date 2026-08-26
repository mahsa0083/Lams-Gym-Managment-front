import {
    LiChart,
    LiStore,
    LiUserCircle,
    LiChip,
    LiShield,
    LiElement3,
} from '@/icons'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const CLASS_NAME = 'text-xl'

const navigationIcon: NavigationIcons = {
    home: <LiElement3 className={CLASS_NAME} />,
    singleMenu: <LiShield className={CLASS_NAME} />,
    collapseMenu: <LiChip className={CLASS_NAME} />,
    groupSingleMenu: <LiUserCircle className={CLASS_NAME} />,
    groupCollapseMenu: <LiChart className={CLASS_NAME} />,
    groupMenu: <LiStore className={CLASS_NAME} />,
}

export default navigationIcon

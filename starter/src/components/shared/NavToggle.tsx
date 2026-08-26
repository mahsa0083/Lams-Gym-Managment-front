import { LiSidebarLeft, LiSidebarRight } from '@/icons'
import { LuAlignLeft, LuAlignRight } from 'react-icons/lu'
import type { CommonProps } from '@/@types/common'

export interface NavToggleProps extends CommonProps {
    toggled?: boolean
    iconType?: 'sidebar' | 'alignment'
}

const NavToggle = ({
    toggled,
    className,
    iconType = 'sidebar',
}: NavToggleProps) => {
    const icons =
        iconType === 'alignment'
            ? {
                  left: <LuAlignLeft />,
                  right: <LuAlignRight />,
              }
            : {
                  left: <LiSidebarLeft />,
                  right: <LiSidebarRight />,
              }

    return <div className={className}>{toggled ? icons.right : icons.left}</div>
}

export default NavToggle

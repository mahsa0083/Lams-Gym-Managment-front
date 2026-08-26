import UserProfileDropdown from './UserProfileDropdown'
import { LiChevronUpDown } from '@/icons'
import classNames from '@/utils/classNames'
import useTheme from '@/utils/hooks/useTheme'
import type  { Placement } from '@floating-ui/react'

type SideNavProfileMenuProps = {
    placement?: Placement
    className?: string
}

const SideNavProfileMenu = ({ placement, className }: SideNavProfileMenuProps) => {
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const direction = useTheme((state) => state.direction)

    return (
        <div className={classNames('flex flex-col justify-center border-t border-gray-200 dark:border-gray-800 px-2 py-2', className)}>
            <UserProfileDropdown
                collapsed={sideNavCollapse}
                placement={placement || (direction === 'ltr' ? 'right-end' : 'left-end')}
                customTrigger={({ avatar, userName, email }) => (
                    <div className="cursor-pointer p-2 w-full rounded-lg flex items-center justify-between gap-2 hover:bg-gray-900/5 dark:hover:bg-gray-800 transition-colors duration-150">
                        <div className="flex items-center gap-2 ">
                            {avatar}
                            {!sideNavCollapse && (
                                <div>
                                    {userName}
                                    {email}
                                </div>
                            )}
                        </div>
                        <LiChevronUpDown className="heading-text" />
                    </div>
                )}
            />
        </div>
    )
}

export default SideNavProfileMenu

import LayoutBase from '@/components/template/LayoutBase'
import StackedSideNav from '@/components/template/StackedSideNav'
import ContentFrame from '@/components/template/ContentFrame'
import Header from '@/components/template/Header'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import { LAYOUT_STACKED_SIDE } from '@/constants/theme.constant'
import classNames from '@/utils/classNames'
import useScrollTop from '@/utils/hooks/useScrollTop'

import type { CommonProps } from '@/@types/common'

const StackedSide = ({ children }: CommonProps) => {
    const { isSticky } = useScrollTop()

    return (
        <LayoutBase
            type={LAYOUT_STACKED_SIDE}
            className="app-layout-stacked-side flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                <StackedSideNav />
                <ContentFrame>
                    <Header
                        className={classNames(
                            'dark:bg-gray-900',
                            isSticky && 'shadow-sm rounded-none!',
                        )}
                        headerStart={[{ component: MobileNav }]}
                        headerEnd={[{ component: UserProfileDropdown }]}
                    />
                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </ContentFrame>
            </div>
        </LayoutBase>
    )
}

export default StackedSide

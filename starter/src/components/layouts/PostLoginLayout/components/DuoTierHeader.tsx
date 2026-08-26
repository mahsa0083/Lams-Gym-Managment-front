import LayoutBase from '@/components/template/LayoutBase'
import ContentFrame from '@/components/template/ContentFrame'
import Header from '@/components/template/Header'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import HeaderTenancySelector from '@/components/template/HeaderTenancySelector'
import MobileNav from '@/components/template/MobileNav'
import HorizontalNav from '@/components/template/HorizontalNav'
import StickyRegion from '@/components/shared/StickyRegion'
import {
    LAYOUT_TOP_BAR_CLASSIC,
    HEADER_HEIGHT,
    HEADER_EXTENDED_HEIGHT,
} from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'

const DuoTierHeader = ({ children }: CommonProps) => {
    return (
        <LayoutBase
            type={LAYOUT_TOP_BAR_CLASSIC}
            className="app-layout-top-bar-classic flex flex-auto flex-col min-h-screen"
        >
            <div className="flex flex-auto min-w-0">
                <ContentFrame>
                    <Header
                        className="border-b border-gray-200 dark:border-gray-800"
                        sticky={false}
                        headerStart={[
                            {
                                component: (
                                    <HeaderTenancySelector className="shadow-none" />
                                ),
                            },
                        ]}
                        headerEnd={[{ component: UserProfileDropdown }]}
                        extended={
                            <StickyRegion
                                triggerOffset={HEADER_HEIGHT}
                                className="border-b border-gray-200 dark:border-gray-800 w-full bg-white dark:bg-gray-800"
                                stickyClassName="left-0 right-0"
                            >
                                <div
                                    className="flex items-center justify-between gap-2 w-full"
                                    style={{ height: HEADER_EXTENDED_HEIGHT }}
                                >
                                    <MobileNav />
                                    <HorizontalNav
                                        dropdownLean
                                        className="hidden md:flex"
                                    />
                                </div>
                            </StickyRegion>
                        }
                    />
                    {children}
                </ContentFrame>
            </div>
        </LayoutBase>
    )
}

export default DuoTierHeader

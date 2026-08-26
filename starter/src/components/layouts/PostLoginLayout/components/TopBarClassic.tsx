import LayoutBase from '@/components/template/LayoutBase'
import ContentFrame from '@/components/template/ContentFrame'
import Header from '@/components/template/Header'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import HeaderLogo from '@/components/template/HeaderLogo'
import MobileNav from '@/components/template/MobileNav'
import HorizontalNav from '@/components/template/HorizontalNav'
import { LAYOUT_DUO_TIER_HEADER } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'

const TopBarClassic = ({ children }: CommonProps) => {
    return (
        <LayoutBase
            type={LAYOUT_DUO_TIER_HEADER}
            className="app-layout-duo-header flex flex-auto flex-col min-h-screen"
        >
            <div className="flex flex-auto min-w-0">
                <ContentFrame>
                    <Header
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={[
                            {
                                component: MobileNav,
                            },
                            {
                                component: HeaderLogo,
                            },
                        ]}
                        headerMiddle={
                            <HorizontalNav className="hidden md:flex" />
                        }
                        headerEnd={[{ component: UserProfileDropdown }]}
                    />
                    {children}
                </ContentFrame>
            </div>
        </LayoutBase>
    )
}

export default TopBarClassic

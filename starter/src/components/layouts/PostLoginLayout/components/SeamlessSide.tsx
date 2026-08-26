import { CommonProps } from '@/@types/common'
import LayoutBase from '@/components//template/LayoutBase'
import Header from '@/components/template/Header'
import ContentFrame from '@/components/template/ContentFrame'
import SideNav from '@/components/template/SideNav'
import SideNavTenancySelector from '@/components/template/SideNavTenancySelector'
import MobileNav from '@/components/template/MobileNav'
import SideNavToggle from '@/components/template/SideNavToggle'
import SideNavProfileMenu from '@/components/template/SideNavProfileMenu'
import { LAYOUT_SEAMLESS_SIDE } from '@/constants/theme.constant'
import classNames from '@/utils/classNames'
import useScrollTop from '@/utils/hooks/useScrollTop'

const SeamlessSide = ({ children }: CommonProps) => {
    const { isSticky } = useScrollTop()

    return (
        <LayoutBase
            adaptiveCardActive
            type={LAYOUT_SEAMLESS_SIDE}
            className="app-layout-seamless-side flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                <SideNav
                    menuVariant="default"
                    headerContent={<SideNavTenancySelector />}
                    footerContent={<SideNavProfileMenu />}
                />
                <ContentFrame>
                    <Header
                        className={classNames(
                            'dark:bg-gray-900',
                            isSticky && 'shadow-sm rounded-none!',
                        )}
                        headerStart={[
                            {
                                component: () => (
                                    <MobileNav>
                                        <SideNavProfileMenu 
                                            placement="top-end" 
                                        />
                                    </MobileNav>
                                ),
                            },
                            {
                                component: SideNavToggle,
                            },
                        ]}
                        headerEnd={[]}
                    />
                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </ContentFrame>
            </div>
        </LayoutBase>
    )
}

export default SeamlessSide

'use client'

import classNames from '@/utils/classNames'
import Scroll from '@/components/ui/Scroll'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useTheme from '@/utils/hooks/useTheme'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useNavigation from '@/utils/hooks/useNavigation'
import queryRoute from '@/utils/queryRoute'
import appConfig from '@/configs/app.config'
import { usePathname } from 'next/navigation'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    HEADER_HEIGHT,
} from '@/constants/theme.constant'
import type { ReactNode } from 'react'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    menuVariant?: 'default' | 'subtle'
    headerContent?: ReactNode
    footerContent?: ReactNode
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    background = true,
    className,
    menuVariant,
    headerContent,
    footerContent,
}: SideNavProps) => {
    const pathname = usePathname()
    const route = queryRoute(pathname)
    const { navigationTree } = useNavigation()

    const direction = useTheme((state) => state.direction)
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const currentRouteKey = route?.key || ''
    const { session } = useCurrentSession()

    // 🎯 تعیین نقش جهت اعمال data-role
    const getRole = () => {
        if (pathname.includes('/admin')) return 'ADMIN'
        if (pathname.includes('/trainer') || pathname.includes('/coach')) return 'TRAINER'
        if (pathname.includes('/member')) return 'MEMBER'
        return undefined
    }

    const role = getRole()

    return (
        <div
            data-role={role}
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav hidden lg:flex flex-col transition-all duration-300',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <div
                className="side-nav-header flex flex-col justify-center"
                style={{ height: HEADER_HEIGHT }}
            >
                {headerContent}
            </div>
            <Scroll.FlexSize
                scrollbars="vertical"
                className={classNames('side-nav-content')}
                dir={direction}
            >
                <VerticalMenuContent
                    collapsed={sideNavCollapse}
                    navigationTree={navigationTree}
                    routeKey={currentRouteKey}
                    direction={direction}
                    translationSetup={translationSetup}
                    menuVariant={menuVariant}
                    userAuthority={session?.user?.authority || []}
                />
            </Scroll.FlexSize>
           
        </div>
    )
}

export default SideNav
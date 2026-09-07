'use client'

import { useState, Suspense, lazy } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import NavToggle from '@/components/shared/NavToggle'
import { DIR_RTL } from '@/constants/theme.constant'
import withHeaderItem, { WithHeaderItemProps } from '@/utils/hoc/withHeaderItem'
import appConfig from '@/configs/app.config'
import useTheme from '@/utils/hooks/useTheme'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useNavigation from '@/utils/hooks/useNavigation'
import queryRoute from '@/utils/queryRoute'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent'),
)

type MobileNavToggleProps = {
    toggled?: boolean
}

type MobileNavProps = {
    translationSetup?: boolean
    children?: ReactNode
}

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

const MobileNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: MobileNavProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenDrawer = () => {
        setIsOpen(true)
    }

    const handleDrawerClose = () => {
        setIsOpen(false)
    }

    const pathname = usePathname()
    const route = queryRoute(pathname)
    const currentRouteKey = route?.key || ''
    const direction = useTheme((state) => state.direction)
    const { session } = useCurrentSession()
    const { navigationTree } = useNavigation()

    // 🎯 تشخیص نقش کاربر جهت اعمال data-role و لود رنگ‌های صحیح
    const getRole = () => {
        if (pathname.includes('/admin')) return 'ADMIN'
        if (pathname.includes('/trainer') || pathname.includes('/coach')) return 'TRAINER'
        if (pathname.includes('/member')) return 'MEMBER'
        return undefined
    }

    const role = getRole()

    return (
        <>
            <div className="text-xl block lg:hidden" onClick={handleOpenDrawer}>
                <MobileNavToggle toggled={isOpen} />
            </div>
            <Drawer
                title=""
                isOpen={isOpen}
                header={false} // حذف هدر سفید اضافه
                closable={false}
                bodyClass={classNames('p-0 flex flex-col justify-between')}
                contentClassName="side-nav-bg" // رنگ یک‌دست کل کشو با سایدبار اصلی
                width={280}
                placement={direction === DIR_RTL ? 'right' : 'left'}
                onClose={handleDrawerClose}
            >
                {/* 🎨 ایجاد کانتینر اصلی سایدبار با data-role و فاصله مناسب از بالا (pt-6) */}
                <div 
                    data-role={role} 
                    className="side-nav side-nav-bg side-nav-expand h-full w-full flex flex-col pt-6 px-2"
                >
                    <Suspense fallback={<></>}>
                        {isOpen && (
                            <VerticalMenuContent
                                collapsed={false}
                                navigationTree={navigationTree}
                                routeKey={currentRouteKey}
                                userAuthority={session?.user?.authority || []}
                                direction={direction}
                                translationSetup={translationSetup}
                                onMenuItemClick={handleDrawerClose}
                            />
                        )}
                    </Suspense>
                </div>
            </Drawer>
        </>
    )
}

export default MobileNav
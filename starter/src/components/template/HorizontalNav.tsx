import HorizontalMenuContent from './HorizontalMenuContent'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import appConfig from '@/configs/app.config'
import navigationConfig from '@/configs/navigation.config'
import { usePathname } from 'next/navigation'
import queryRoute from '@/utils/queryRoute'

type HorizontalNavProps = {
    translationSetup?: boolean
    dropdownLean?: boolean
    className?: string
}

const HorizontalNav = ({
    translationSetup = appConfig.activeNavTranslation,
    dropdownLean,
    className,
}: HorizontalNavProps) => {
    const { session } = useCurrentSession()

    const pathname = usePathname()

    const route = queryRoute(pathname)

    const currentRouteKey = route?.key || ''

    return (
        <HorizontalMenuContent
            className={className}
            dropdownLean={dropdownLean}
            navigationTree={navigationConfig}
            routeKey={currentRouteKey}
            userAuthority={session?.user?.authority || []}
            translationSetup={translationSetup}
        />
    )
}

export default HorizontalNav

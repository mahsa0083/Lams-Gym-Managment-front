import classNames from '@/utils/classNames'
import Logo from '@/components/template/Logo'
import appConfig from '@/configs/app.config'
import {
    SIDE_NAV_CONTENT_GUTTER,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import Link from 'next/link'
import useTheme from '@/utils/hooks/useTheme'

const SideNavLogo = () => {
    const defaultMode = useTheme((state) => state.mode)

    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const gutter = sideNavCollapse ? SIDE_NAV_CONTENT_GUTTER : LOGO_X_GUTTER

    return (
        <Link
            href={appConfig.authenticatedEntryPath}
            className="h-full flex flex-col justify-center"
        >
            <Logo
                imgClass="max-h-8"
                mode={defaultMode as 'light' | 'dark'}
                type={sideNavCollapse ? 'streamline' : 'full'}
                style={{
                    paddingLeft: gutter,
                    paddingRight: gutter,
                }}
                className={classNames(sideNavCollapse && 'mx-auto')}
            />
        </Link>
    )
}

export default SideNavLogo

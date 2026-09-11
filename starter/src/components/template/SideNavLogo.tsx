import classNames from '@/utils/classNames'
import appConfig from '@/configs/app.config'
import {
    SIDE_NAV_CONTENT_GUTTER,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import Link from 'next/link'
import useTheme from '@/utils/hooks/useTheme'

const SideNavLogo = () => {
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)
    const gutter = sideNavCollapse ? SIDE_NAV_CONTENT_GUTTER : LOGO_X_GUTTER

    return (
        <Link
            href={appConfig.authenticatedEntryPath}
            className="h-full flex items-center justify-center transition-all duration-300 py-4"
            style={{
                paddingLeft: gutter,
                paddingRight: gutter,
            }}
        >
            {/* چیدمان عمودی: لوگو بالا، نوشته زیرش */}
            <div
                className={classNames(
                    'flex flex-col items-center justify-center mt-10',
                    sideNavCollapse && 'mx-auto'
                )}
            >
                {/* آیکون لوگو - 100 در 100 */}
                <img
                    src="/img/logo/logoside2.png"
                    alt="Fither Logo"
                    className={classNames(
                        'object-contain transition-all duration-300',
                        sideNavCollapse ? 'w-12 h-12' : 'w-[100px] h-[100px]'
                    )}
                />

                {/* نوشته FITHER زیر لوگو (فقط وقتی سایدبار باز است) */}
                {!sideNavCollapse && (
                    <span
                        className="mt-2 text-xl font-bold tracking-widest text-white/90 font-serif select-none"
                        style={{
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: '0.15em',
                        }}
                    >
                        FITHER
                    </span>
                )}
            </div>
        </Link>
    )
}

export default SideNavLogo

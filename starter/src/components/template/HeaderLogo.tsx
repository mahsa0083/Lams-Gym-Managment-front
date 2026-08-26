import Logo from '@/components/template/Logo'
import appConfig from '@/configs/app.config'
import Link from 'next/link'
import useTheme from '@/utils/hooks/useTheme'
import type { Mode } from '@/@types/theme'

const HeaderLogo = ({ mode }: { mode?: Mode }) => {
    const defaultMode = useTheme((state) => state.mode)

    return (
        <Link href={appConfig.authenticatedEntryPath}>
            <Logo
                imgClass="max-h-8"
                mode={(mode || defaultMode) as 'light' | 'dark'}
                className="hidden lg:block"
            />
        </Link>
    )
}

export default HeaderLogo

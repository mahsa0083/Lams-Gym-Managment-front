'use client'

import {
    LAYOUT_INSET_SHELL,
    LAYOUT_STACKED_SIDE,
    LAYOUT_TOP_BAR_CLASSIC,
    LAYOUT_SEAMLESS_SIDE,
    LAYOUT_DUO_TIER_HEADER,
    LAYOUT_BLANK,
} from '@/constants/theme.constant'
import InsetShell from './components/InsetShell'
import StackedSide from './components/StackedSide'
import TopBarClassic from './components/TopBarClassic'
import SeamlessSide from './components/SeamlessSide'
import DuoTierHeader from './components/DuoTierHeader'
import Blank from './components/Blank'
import PageContainer from '@/components/template/PageContainer'
import queryRoute from '@/utils/queryRoute'
import useTheme from '@/utils/hooks/useTheme'
import { usePathname } from 'next/navigation'
import type { CommonProps } from '@/@types/common'
import type { LayoutType } from '@/@types/theme'

interface LayoutProps extends CommonProps {
    layoutType: LayoutType
}

type PostLoginLayoutProps = CommonProps

const Layout = ({ children, layoutType }: LayoutProps) => {
    switch (layoutType) {
        case LAYOUT_INSET_SHELL:
            return <InsetShell>{children}</InsetShell>
        case LAYOUT_STACKED_SIDE:
            return <StackedSide>{children}</StackedSide>
        case LAYOUT_TOP_BAR_CLASSIC:
            return <TopBarClassic>{children}</TopBarClassic>
        case LAYOUT_SEAMLESS_SIDE:
            return <SeamlessSide>{children}</SeamlessSide>
        case LAYOUT_DUO_TIER_HEADER:
            return <DuoTierHeader>{children}</DuoTierHeader>
        case LAYOUT_BLANK:
            return <Blank>{children}</Blank>
        default:
            return <>{children}</>
    }
}

const PostLoginLayout = ({ children }: PostLoginLayoutProps) => {
    const layoutType = useTheme((state) => state.layout.type)

    const pathname = usePathname()

    const route = queryRoute(pathname)

    return (
        <Layout
            layoutType={route?.meta?.layout ? route?.meta?.layout : layoutType}
        >
            <PageContainer {...route?.meta}>{children}</PageContainer>
        </Layout>
    )
}

export default PostLoginLayout

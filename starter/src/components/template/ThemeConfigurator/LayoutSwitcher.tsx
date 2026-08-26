import Segment from '@/components/ui/Segment'
import useTheme from '@/utils/hooks/useTheme'
import {
    LAYOUT_INSET_SHELL,
    LAYOUT_STACKED_SIDE,
    LAYOUT_TOP_BAR_CLASSIC,
    LAYOUT_SEAMLESS_SIDE,
    LAYOUT_DUO_TIER_HEADER,
    LAYOUT_BLANK,
} from '@/constants/theme.constant'
import InsetShellSvg from '@/components/svg/layouts/InsetShellSvg'
import StackedSideSvg from '@/components/svg/layouts/StackedSideSvg'
import SeamLessSideSvg from '@/components/svg/layouts/SeamLessSideSvg'
import TopBarClassicSvg from '@/components/svg/layouts/TopBarClassicSvg'
import DuoTierHeaderSvg from '@/components/svg/layouts/DuoTierHeaderSvg'
import BlankSvg from '@/components/svg/layouts/BlankSvg'
import classNames from '@/utils/classNames'
import { FaCheck } from 'react-icons/fa'
import type { LayoutType } from '@/@types/theme'

const layouts = [
    {
        value: LAYOUT_INSET_SHELL,
        label: 'Inset shell',
        svg: InsetShellSvg,
    },
    {
        value: LAYOUT_SEAMLESS_SIDE,
        label: 'Seamless side',
        svg: SeamLessSideSvg,
    },
    {
        value: LAYOUT_STACKED_SIDE,
        label: 'Stacked',
        svg: StackedSideSvg,
    },
    {
        value: LAYOUT_TOP_BAR_CLASSIC,
        label: 'Top bar',
        svg: TopBarClassicSvg,
    },
    {
        value: LAYOUT_DUO_TIER_HEADER,
        label: 'Duo tier header',
        svg: DuoTierHeaderSvg,
    },
    {
        value: LAYOUT_BLANK,
        label: 'Blank',
        svg: BlankSvg,
    },
]

const LayoutSwitcher = ({ wrapperClass }: { wrapperClass?: string }) => {
    const themeLayout = useTheme((state) => state.layout)
    const setLayout = useTheme((state) => state.setLayout)

    return (
        <Segment
            className="bg-transparent dark:bg-transparent p-0"
            onChange={(val) => setLayout(val as LayoutType)}
            value={themeLayout.type}
        >
            <div
                className={classNames(
                    'grid grid-cols-3 gap-4 w-full',
                    wrapperClass,
                )}
            >
                {layouts.map((layout) => (
                    <Segment.Item key={layout.value} value={layout.value}>
                        {({ onSegmentItemClick }) => {
                            const active = themeLayout.type === layout.value
                            const Svg = layout.svg
                            return (
                                <div className="max-w-[200px]">
                                    <button
                                        className={classNames(
                                            'border-2 rounded-xl overflow-hidden',
                                            active
                                                ? 'border-primary dark:border-primary'
                                                : 'border-gray-200 dark:border-gray-700',
                                        )}
                                        onClick={onSegmentItemClick}
                                    >
                                        <Svg />
                                    </button>
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <div
                                            className={classNames(
                                                'border rounded-full flex items-center justify-center min-h-4 min-w-4',
                                                active
                                                    ? 'border-primary bg-primary'
                                                    : 'border-gray-200 dark:border-gray-700',
                                            )}
                                        >
                                            {active && (
                                                <FaCheck className="text-white text-[8px]" />
                                            )}
                                        </div>
                                        <span className="heading-text text-xs">
                                            {layout.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        }}
                    </Segment.Item>
                ))}
            </div>
        </Segment>
    )
}

export default LayoutSwitcher

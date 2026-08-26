import Scroll from '@/components/ui/Scroll'
import classNames from '@/utils/classNames'
import { HEADER_HEIGHT, DIR_LTR, DIR_RTL } from '@/constants/theme.constant'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import { LiArrowLeft, LiArrowRight } from '@/icons'
import type { NavigationTree } from '@/@types/navigation'
import type { Direction } from '@/@types/theme'

type StackedSideNavSecondaryProps = {
    className?: string
    title: string
    menu?: NavigationTree[]
    routeKey: string
    onCollapse: () => void
    direction?: Direction
    translationSetup?: boolean
    userAuthority: string[]
}

const StackedSideNavSecondary = (props: StackedSideNavSecondaryProps) => {
    const {
        className,
        title,
        menu,
        routeKey,
        onCollapse,
        direction,
        translationSetup,
        userAuthority,
        ...rest
    } = props

    const handleCollpase = () => {
        onCollapse()
    }

    return (
        <div className={classNames('h-full', className)} {...rest}>
            <div
                className={`flex items-center justify-between gap-4 px-4`}
                style={{ height: HEADER_HEIGHT }}
            >
                <h5 className="font-bold">{title}</h5>
                <button
                    type="button"
                    className="close-button"
                    onClick={handleCollpase}
                >
                    {direction === DIR_LTR && <LiArrowLeft />}
                    {direction === DIR_RTL && <LiArrowRight />}
                </button>
            </div>
            <Scroll className="h-[calc(100%-64px)]">
                <VerticalMenuContent
                    routeKey={routeKey}
                    navigationTree={menu}
                    translationSetup={translationSetup}
                    userAuthority={userAuthority}
                />
            </Scroll>
        </div>
    )
}

export default StackedSideNavSecondary

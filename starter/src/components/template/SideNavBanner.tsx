import { useState } from 'react'
import Button from '@/components/ui/Button'
import IconFrame from '@/components/shared/IconFrame'
import classNames from '@/utils/classNames'
import useTheme from '@/utils/hooks/useTheme'
import { LiZap, LiCross } from '@/icons'

const ACTION_URL = ''

type SideNavBannerProps = {
    className?: string
}

const SideNavBanner = ({ className }: SideNavBannerProps) => {

    const [bannerClosed, setBannerClosed] = useState(false)

    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const displayBanner = !sideNavCollapse && !bannerClosed

    return (
        <>
            {displayBanner
                ? (
                    <div
                        className={classNames(
                            'relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 p-0.5',
                            className,
                        )}
                    >
                        <div
                            className="absolute pointer-events-none w-[200%] h-[200%] -top-1/2 -left-1/2 animate-[beam-spin_4s_linear_infinite] bg-[conic-gradient(transparent_0%,transparent_65%,#ad46ffee_73%,#f6339acc_82%,#2b7fff_90%,#ffffff_94%,transparent_97%)] dark:bg-[conic-gradient(transparent_0%,transparent_65%,#ad46ffee_73%,#f6339acc_82%,#2b7fff_90%,#1dbcf9_94%,transparent_97%)]"
                        />
                        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between mb-2">
                                    <IconFrame variant="thick" size={42}>
                                        <LiZap className="text-lg heading-text" />
                                    </IconFrame>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        icon={<LiCross />}
                                        type="button"
                                        onClick={() => setBannerClosed(true)}
                                    />
                                </div>
                                <div>
                                    <h6 className="heading-text font-bold mb-1">This is trial version</h6>
                                    <p className="font-medium">Upgrade to pro for more amazing features</p>
                                </div>
                                <Button
                                    asElement="a"
                                    href={ACTION_URL}
                                    target="_blank"
                                    className="text-center"
                                    variant="solid"
                                    size="sm"
                                    rel="noopener noreferrer"
                                >
                                    Upgrade Now
                                </Button>
                            </div>
                        </div>
                    </div>
                )
                :
                null
            }
        </>

        
    )
}

export default SideNavBanner
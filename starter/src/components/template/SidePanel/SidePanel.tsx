'use client'

import { useState } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import SidePanelContent, { SidePanelContentProps } from './SidePanelContent'
import { LiSetting2 } from '@/icons'
import useResponsive from '@/utils/hooks/useResponsive'
import useTheme from '@/utils/hooks/useTheme'
import type { CommonProps } from '@/@types/common'

type SidePanelProps = SidePanelContentProps & CommonProps

const SidePanel = (props: SidePanelProps) => {
    const { className, ...rest } = props

    const [panelExpand, setPanelExpand] = useState(false)

    const direction = useTheme((state) => state.direction)

    const { larger } = useResponsive()

    const openPanel = () => {
        setPanelExpand(true)
    }

    const closePanel = () => {
        setPanelExpand(false)

        if (document) {
            const bodyClassList = document.body.classList
            if (bodyClassList.contains('drawer-lock-scroll')) {
                bodyClassList.remove('drawer-lock-scroll', 'drawer-open')
            }
        }
    }

    return (
        <>
            <div
                className={classNames('text-xl', className)}
                onClick={openPanel}
                {...rest}
            >
                <LiSetting2 />
            </div>
            <Drawer
                title="Theme Config"
                isOpen={panelExpand}
                placement={direction === 'rtl' ? 'left' : 'right'}
                onClose={closePanel}
                width={larger.sm ? 420 : 330}
            >
                <SidePanelContent callBackClose={closePanel} />
            </Drawer>
        </>
    )
}

export default SidePanel

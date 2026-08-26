import { useState, useEffect, useRef } from 'react'
import classNames from '@/utils/classNames'
import type { CommonProps } from '@/@types/common'

export interface StickyRegionProps extends CommonProps {
    offsetTop?: number
    triggerOffset?: number
    shadow?: boolean
    stickyClassName?: string
    zIndex?: number
    transitionDuration?: number
    onStickyChange?: (isSticky: boolean) => void
}

const StickyRegion = (props: StickyRegionProps) => {
    const {
        children,
        className,
        offsetTop = 0,
        triggerOffset,
        shadow = true,
        stickyClassName,
        zIndex = 40,
        transitionDuration = 300,
        onStickyChange,
    } = props

    const ref = useRef<HTMLDivElement>(null)
    const [isSticky, setIsSticky] = useState(false)
    const [elementHeight, setElementHeight] = useState(0)
    const naturalOffsetRef = useRef(0)
    const isStickyRef = useRef(false)

    // Measure element once on mount
    useEffect(() => {
        if (ref.current) {
            setElementHeight(ref.current.offsetHeight)
            if (triggerOffset === undefined) {
                naturalOffsetRef.current = ref.current.offsetTop
            }
        }
    }, [triggerOffset])

    useEffect(() => {
        const handleScroll = () => {
            const threshold = triggerOffset ?? naturalOffsetRef.current
            const shouldStick = window.scrollY >= threshold

            if (isStickyRef.current !== shouldStick) {
                isStickyRef.current = shouldStick
                setIsSticky(shouldStick)
                onStickyChange?.(shouldStick)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [triggerOffset, onStickyChange])

    return (
        <>
            <div
                ref={ref}
                className={classNames(
                    isSticky
                        ? classNames(
                              'fixed',
                              shadow && 'shadow-xs',
                              stickyClassName,
                          )
                        : 'relative',
                    className,
                )}
                style={{
                    top: isSticky ? offsetTop : undefined,
                    zIndex: isSticky ? zIndex : undefined,
                    transition: `box-shadow ${transitionDuration}ms ease-in-out`,
                }}
            >
                {children}
            </div>
            {isSticky && <div style={{ height: elementHeight }} />}
        </>
    )
}

export default StickyRegion

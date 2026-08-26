import { useRef, useEffect } from 'react'
import type { SyntheticEvent } from 'react'
import { Scroll } from '@/components/ui/Scroll'

type HorizontalScrollProps = {
    scroll: number
    svgWidth: number
    taskListWidth: number
    rtl: boolean
    onScroll: (event: SyntheticEvent<HTMLDivElement>) => void
}

const HorizontalScroll = ({
    scroll,
    svgWidth,
    taskListWidth,
    rtl,
    onScroll,
}: HorizontalScrollProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = rtl ? -scroll : scroll
        }
    }, [scroll, rtl])

    return (
        <div
            dir={rtl ? 'rtl' : 'ltr'}
            style={{
                margin: rtl
                    ? `0px ${taskListWidth}px -13px 0px`
                    : `0px 0px -13px ${taskListWidth}px`,
            }}
            className="max-w-full h-3 -translate-y-4.5 px-2"
        >
            <Scroll
                scrollbars="horizontal"
                type="always"
                scrollbarSize={8}
                viewportRef={scrollRef}
                viewportProps={{
                    onScroll: onScroll,
                    className: 'h-full',
                }}
                className="h-full"
            >
                <div style={{ width: svgWidth }} className="h-px" />
            </Scroll>
        </div>
    )
}

export default HorizontalScroll

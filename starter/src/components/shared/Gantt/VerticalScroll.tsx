import { useRef, useEffect } from 'react'
import type { SyntheticEvent } from 'react'
import { Scroll } from '@/components/ui/Scroll'

type VerticalScrollProps = {
    scroll: number
    ganttHeight: number
    ganttFullHeight: number
    headerHeight: number
    rtl: boolean
    onScroll: (event: SyntheticEvent<HTMLDivElement>) => void
}

const VerticalScroll = ({
    scroll,
    ganttHeight,
    ganttFullHeight,
    headerHeight,
    rtl,
    onScroll,
}: VerticalScrollProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scroll
        }
    }, [scroll])

    return (
        <div
            style={{
                height: ganttHeight,
                marginTop: headerHeight,
                marginLeft: rtl ? '' : '-1rem',
            }}
            className="w-3"
        >
            <Scroll
                scrollbars="vertical"
                type="always"
                scrollbarSize={8}
                viewportRef={scrollRef}
                viewportProps={{
                    onScroll: onScroll,
                    className: 'h-full',
                }}
                className="h-full"
            >
                <div style={{ height: ganttFullHeight, width: 1 }} />
            </Scroll>
        </div>
    )
}

export default VerticalScroll

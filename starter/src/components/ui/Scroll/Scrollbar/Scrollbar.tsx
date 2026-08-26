import { useEffect } from 'react'
import { useScrollContext } from '../context'
import ScrollbarAuto from './ScrollbarAuto'
import ScrollbarHover from './ScrollbarHover'
import ScrollbarScroll from './ScrollbarScroll'
import ScrollbarVisible from './ScrollbarVisible'
import { ScrollbarVisibleProps } from './ScrollbarVisible'

interface ScrollbarProps extends ScrollbarVisibleProps {
    forceMount?: true
}

const Scrollbar = (props: ScrollbarProps) => {
    const { forceMount, ref, ...scrollbarProps } = props
    const context = useScrollContext()
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context
    const isHorizontal = props.orientation === 'horizontal'

    useEffect(() => {
        if (isHorizontal) {
            onScrollbarXEnabledChange(true)
        } else {
            onScrollbarYEnabledChange(true)
        }
        return () => {
            if (isHorizontal) {
                onScrollbarXEnabledChange(false)
            } else {
                onScrollbarYEnabledChange(false)
            }
        }
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange])

    return context.type === 'hover' ? (
        <ScrollbarHover {...scrollbarProps} ref={ref} forceMount={forceMount} />
    ) : context.type === 'scroll' ? (
        <ScrollbarScroll
            {...scrollbarProps}
            ref={ref}
            forceMount={forceMount}
        />
    ) : context.type === 'auto' ? (
        <ScrollbarAuto {...scrollbarProps} ref={ref} forceMount={forceMount} />
    ) : context.type === 'always' ? (
        <ScrollbarVisible {...scrollbarProps} ref={ref} />
    ) : null
}

export default Scrollbar

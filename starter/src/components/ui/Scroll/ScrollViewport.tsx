import useMergedRef from '../hooks/useMergeRef'
import classNames from '../utils/classNames'
import { useScrollContext } from './context'
import { ComponentProps, Ref } from 'react'

export type ScrollViewportProps = ComponentProps<'div'> & {
    ref?: Ref<HTMLDivElement>
    contentClassName?: string
}

const ScrollViewport = ({
    children,
    style,
    ref = null,
    contentClassName,
    ...rest
}: ScrollViewportProps) => {
    const context = useScrollContext()
    const rootRef = useMergedRef(ref, context.onViewportChange)

    return (
        <div
            {...rest}
            ref={rootRef}
            style={{
                overflowX: context.scrollbarXEnabled ? 'scroll' : 'hidden',
                overflowY: context.scrollbarYEnabled ? 'scroll' : 'hidden',
                ...style,
            }}
        >
            <div
                className={classNames(
                    'scroll-viewport-content',
                    contentClassName,
                )}
                ref={context.onContentChange}
            >
                {children}
            </div>
        </div>
    )
}

export default ScrollViewport

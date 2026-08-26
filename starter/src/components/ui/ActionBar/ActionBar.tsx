import {
    DialogContext as ActionBarContext,
    useDialogContext,
    useDialog,
} from '../hooks/useDialog'
import useWindowSize from '../hooks/useWindowSize'
import classNames from '../utils/classNames'
import {
    useMergeRefs,
    FloatingPortal,
    FloatingFocusManager,
    useTransitionStyles,
} from '@floating-ui/react'
import type { CommonProps } from '../@types/common'
import { CSSProperties, Ref } from 'react'

export interface ActionBarProps extends CommonProps {
    contentClassName?: string
    open?: boolean
    shouldCloseOnEsc?: boolean
    onOpenChange?: (open: boolean) => void
    width?: number
    ref?: Ref<HTMLDivElement>
}

const ActionBarContent = (props: ActionBarProps) => {
    const {
        contentClassName,
        children,
        width = 480,
        ref: propRef,
        className,
        ...rest
    } = props
    const currentSize = useWindowSize()
    const { context: floatingContext, ...context } = useDialogContext()
    const ref = useMergeRefs([context.refs.setFloating, propRef])

    const contentStyle: CSSProperties = {}

    if (width !== undefined) {
        contentStyle.width = width

        if (
            typeof currentSize.width !== 'undefined' &&
            currentSize.width <= width
        ) {
            contentStyle.width = 'auto'
        }
    }

    const floatingTransition = useTransitionStyles(floatingContext, {
        duration: { open: 200, close: 150 },
        initial: {
            opacity: 0,
            transform: 'translateY(10px) scale(0.95)',
        },
        close: {
            opacity: 0,
            transform: 'translateY(10px) scale(0.95)',
        },
    })

    return (
        <FloatingPortal>
            {floatingTransition.isMounted && (
                <>
                    <div
                        className={classNames('action-bar', className)}
                        style={{ ...contentStyle }}
                    >
                        <FloatingFocusManager context={floatingContext}>
                            <div
                                className={classNames(
                                    'action-bar-content',
                                    contentClassName,
                                )}
                                style={{
                                    ...floatingTransition.styles,
                                }}
                                ref={ref}
                                aria-labelledby={context.labelId}
                                aria-describedby={context.descriptionId}
                                {...context.getFloatingProps(rest)}
                            >
                                {children}
                            </div>
                        </FloatingFocusManager>
                    </div>
                </>
            )}
        </FloatingPortal>
    )
}

const ActionBar = ({
    open,
    onOpenChange,
    shouldCloseOnEsc = false,
    ...props
}: ActionBarProps) => {
    const dialog = useDialog({
        open,
        onOpenChange,
        shouldCloseOnEsc: shouldCloseOnEsc,
    })
    return (
        <ActionBarContext.Provider value={dialog}>
            <ActionBarContent {...props} />
        </ActionBarContext.Provider>
    )
}

export default ActionBar

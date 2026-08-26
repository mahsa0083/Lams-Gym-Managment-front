import CloseButton from '../CloseButton'
import { DialogContext, useDialogContext, useDialog } from '../hooks/useDialog'
import useWindowSize from '../hooks/useWindowSize'
import classNames from '../utils/classNames'
import {
    useMergeRefs,
    FloatingPortal,
    FloatingFocusManager,
    FloatingOverlay,
    useTransitionStyles,
} from '@floating-ui/react'
import type { CommonProps } from '../@types/common'
import { CSSProperties, Ref } from 'react'

export interface DialogProps extends CommonProps {
    closable?: boolean
    height?: string | number
    isOpen?: boolean
    lockScroll?: boolean
    onClose?: (close: boolean) => void
    onOpen?: (open: boolean) => void
    overlayClassName?: string
    shouldCloseOnOverlayClick?: boolean
    shouldCloseOnEsc?: boolean
    width?: number
    ref?: Ref<HTMLDivElement>
}

const DialogContent = (props: DialogProps) => {
    const {
        closable = true,
        height,
        children,
        width = 520,
        lockScroll = false,
        ref: propRef,
        onClose,
        overlayClassName,
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

    const backdropTransition = useTransitionStyles(floatingContext, {
        duration: { open: 150, close: 150 },
    })

    const floatingTransition = useTransitionStyles(floatingContext, {
        duration: { open: 200, close: 150 },
        initial: {
            opacity: 0,
            transform: 'scale(0.9)',
        },
        close: {
            opacity: 0,
            transform: 'scale(0.9)',
        },
    })

    const renderCloseButton = (
        <CloseButton
            absolute
            className="ltr:right-4 rtl:left-4 top-4 hover:bg-gray-100 hover:dark:bg-gray-700 rounded-lg"
            onClick={() => onClose?.(context.open as boolean)}
        />
    )

    return (
        <FloatingPortal>
            {backdropTransition.isMounted && (
                <>
                    <FloatingOverlay
                        className={classNames(
                            'dialog-overlay',
                            overlayClassName,
                        )}
                        lockScroll={lockScroll}
                        style={backdropTransition.styles}
                    />
                    <div className="dialog-content-wrapper">
                        <FloatingFocusManager context={floatingContext}>
                            <div
                                className={classNames(
                                    'dialog-content',
                                    className,
                                )}
                                style={{
                                    height: height || 'auto',
                                    maxHeight: 'calc(100dvh - 4rem)',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    ...contentStyle,
                                    ...floatingTransition.styles,
                                }}
                                ref={ref}
                                aria-labelledby={context.labelId}
                                aria-describedby={context.descriptionId}
                                {...context.getFloatingProps(rest)}
                            >
                                {children}
                                {closable && renderCloseButton}
                            </div>
                        </FloatingFocusManager>
                    </div>
                </>
            )}
        </FloatingPortal>
    )
}

const Dialog = ({
    isOpen,
    shouldCloseOnOverlayClick = true,
    shouldCloseOnEsc = true,
    ...props
}: DialogProps) => {
    const dialog = useDialog({
        open: isOpen,
        onOpenChange: (open: boolean) => {
            if (open) {
                props.onOpen?.(open)
            } else {
                props.onClose?.(open)
            }
        },
        shouldCloseOnOverlayClick: shouldCloseOnOverlayClick,
        shouldCloseOnEsc: shouldCloseOnEsc,
    })
    return (
        <DialogContext.Provider value={dialog}>
            <DialogContent {...props} />
        </DialogContext.Provider>
    )
}

export default Dialog

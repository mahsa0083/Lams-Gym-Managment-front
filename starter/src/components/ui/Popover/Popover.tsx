import { cloneElement, isValidElement } from 'react'
import Button from '../Button'
import classNames from '../utils/classNames'
import {
    usePopover,
    PopoverContext,
    usePopoverContext,
} from '../hooks/usePopover'
import {
    useMergeRefs,
    FloatingFocusManager,
    FloatingPortal,
    useTransitionStyles,
} from '@floating-ui/react'
import transition from '../utils/transitions'
import type { CommonProps } from '../@types/common'
import type { ReactNode, Ref } from 'react'

export type Placement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end'

interface PopoverOptions {
    placement?: Placement
    modal?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: 'click' | 'hover'
    width?: number | string
}

interface PopoverTriggerProps {
    children: ReactNode
    renderTrigger?: ReactNode
    ref?: Ref<HTMLElement>
}

interface PopoverContentProps extends CommonProps {
    ref?: Ref<HTMLDivElement>
    renderTrigger?: ReactNode
    title?: string | ReactNode
    width?: number | string
}

export interface PopoverProps extends PopoverOptions, PopoverContentProps {}

export const PopoverTrigger = ({
    children,
    renderTrigger,
    ref: propRef,
    ...props
}: PopoverTriggerProps) => {
    const context = usePopoverContext()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childrenRef = (renderTrigger as any)?.ref
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

    if (renderTrigger && isValidElement(renderTrigger)) {
        const childProps = renderTrigger.props as object
        return cloneElement(
            renderTrigger,
            context.getReferenceProps({
                ref,
                ...props,
                ...childProps,
            }),
        )
    }

    return (
        <Button
            ref={ref as Ref<HTMLButtonElement>}
            data-state={context.open ? 'open' : 'closed'}
            className="button bg-white border border-gray-300 dark:bg-gray-100/10 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 hover:dark:border-gray-600 rounded-lg px-4"
            {...context.getReferenceProps(props)}
        >
            {children}
        </Button>
    )
}

const PopoverContent = (props: PopoverContentProps) => {
    const {
        ref: propRef,
        renderTrigger,
        children,
        title,
        id,
        className,
        style,
        width,
        ...rest
    } = props

    const { context: floatingContext, ...context } = usePopoverContext()
    const ref = useMergeRefs([context.refs.setFloating, propRef])

    const floatingTransition = useTransitionStyles(floatingContext, {
        duration: { open: 200, close: 200 },
        ...transition(floatingContext.placement),
    })

    return (
        <>
            <PopoverTrigger renderTrigger={renderTrigger} {...rest}>
                {title}
            </PopoverTrigger>
            {floatingTransition.isMounted && (
                <FloatingPortal>
                    <FloatingFocusManager
                        context={floatingContext}
                        modal={context.modal}
                    >
                        <div
                            className="popover-wrapper"
                            ref={ref}
                            style={{ ...floatingContext.floatingStyles }}
                            aria-labelledby={context.labelId}
                            aria-describedby={context.descriptionId}
                            {...context.getFloatingProps(rest)}
                        >
                            <div
                                id={id}
                                style={{ ...floatingTransition.styles }}
                                className="popover"
                            >
                                <div
                                    className={classNames(
                                        'popover-content',
                                        className,
                                    )}
                                    style={{ ...style, width }}
                                >
                                    {children}
                                </div>
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </>
    )
}

const Popover = (props: PopoverProps) => {
    const {
        children,
        modal = false,
        renderTrigger,
        trigger,
        title,
        id,
        className,
        style,
        width = 300,
        ...rest
    } = props

    const popover = usePopover({ modal, trigger, ...rest })

    const contentProps = {
        id,
        className,
        style,
        width,
    }

    return (
        <PopoverContext.Provider value={popover}>
            <PopoverContent
                renderTrigger={renderTrigger}
                title={title}
                {...contentProps}
            >
                {children}
            </PopoverContent>
        </PopoverContext.Provider>
    )
}

export default Popover

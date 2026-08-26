/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    useState,
    useImperativeHandle,
    useRef,
    useCallback,
    cloneElement,
    createRef,
} from 'react'
import classNames from 'classnames'
import chainedFunction from '../utils/chainedFunction'
import { motion, useIsPresent } from 'motion/react'
import { getPlacementTransition } from './transition'
import { PLACEMENT } from '../utils/constants'
import { createRoot } from 'react-dom/client'
import type { NotificationPlacement } from '../@types/placement'
import type { MotionTransition } from './transition'
import type { DetailedReactHTMLElement, ReactNode, Ref } from 'react'

type NodeProps = DetailedReactHTMLElement<any, HTMLDivElement>

type Message = {
    key: string
    visible: boolean
    node: NodeProps
}

const useMessages = (msgKey: string) => {
    const [messages, setMessages] = useState<Message[]>([])

    const getKey = useCallback(
        (key: string) => {
            if (typeof key === 'undefined' && messages.length) {
                key = messages[messages.length - 1].key
            }
            return key
        },
        [messages],
    )

    const push = useCallback(
        (message: NodeProps) => {
            const key =
                msgKey || '_' + Math.random().toString(36).substring(2, 12)
            setMessages([...messages, { key, visible: true, node: message }])
            return key
        },
        [messages, msgKey],
    )

    const removeAll = useCallback(() => {
        setMessages(messages.map((msg) => ({ ...msg, visible: false })))
        setTimeout(() => {
            setMessages([])
        }, 150)
    }, [messages])

    const remove = useCallback(
        (key: string) => {
            setMessages(
                messages.map((elm) => {
                    if (elm.key === getKey(key)) {
                        elm.visible = false
                    }
                    return elm
                }),
            )

            setTimeout(() => {
                setMessages(messages.filter((msg) => msg.visible))
            }, 100)
        },
        [messages, getKey],
    )

    return { messages, push, removeAll, remove }
}

export interface ToastProps {
    transitionType?: 'scale' | 'fade'
    placement?: NotificationPlacement | 'top-full' | 'bottom-full'
    offsetX?: string | number
    offsetY?: string | number
    block?: boolean
}

export interface ToastWrapperInstance {
    root: HTMLElement | null
    push: (message: NodeProps) => string
    remove: (key: string) => void
    removeAll: () => void
}

export interface ToastWrapperProps extends ToastProps {
    messageKey: string
    callback: (ref: HTMLDivElement | null) => void
    ref: Ref<ToastWrapperInstance>
    wrapper?: HTMLElement | (() => HTMLElement)
}

const ToastItem = (props: {
    item: Message
    placementTransition: MotionTransition
    ref: Ref<ToastWrapperInstance>
    toastProps: {
        wrapper?: HTMLElement | (() => HTMLElement)
        triggerByToast: boolean
    }
    remove: (key: string) => void
}) => {
    const isPresent = useIsPresent()
    const { item, placementTransition, ref, toastProps, remove } = props

    return (
        <motion.div
            key={item.key}
            className={'toast-wrapper'}
            style={{
                position: isPresent ? 'static' : 'absolute',
            }}
            initial={placementTransition.variants.initial}
            variants={placementTransition.variants}
            animate={item.visible ? 'animate' : 'exit'}
            transition={{ type: 'spring', stiffness: 900, damping: 40 }}
        >
            {cloneElement(
                item.node as DetailedReactHTMLElement<any, HTMLElement>,
                {
                    ...toastProps,
                    ref,
                    onClose: chainedFunction(item.node?.props?.onClose, () =>
                        remove(item.key),
                    ),
                    className: classNames(item.node?.props?.className),
                },
            )}
        </motion.div>
    )
}

const ToastWrapper = (props: ToastWrapperProps) => {
    const rootRef = useRef<HTMLDivElement | null>(null)

    const {
        transitionType = 'scale',
        placement = PLACEMENT.TOP_END as NotificationPlacement,
        offsetX = 30,
        offsetY = 30,
        messageKey,
        block = false,
        ref,
        callback,
        ...rest
    } = props

    const { push, removeAll, remove, messages } = useMessages(messageKey)

    useImperativeHandle(ref, () => {
        return { root: rootRef.current, push, removeAll, remove }
    })

    const placementTransition = getPlacementTransition({
        offsetX,
        offsetY,
        placement: placement as NotificationPlacement,
        transitionType,
        withHeight: messages.length > 1,
    })

    const toastProps = {
        triggerByToast: true,
        ...rest,
    }

    return (
        <div
            style={placementTransition.default}
            {...rest}
            ref={(thisRef) => {
                rootRef.current = thisRef
                callback?.(thisRef)
            }}
            className={classNames('toast', block && 'w-full')}
        >
            {messages.map((item) => {
                return (
                    <ToastItem
                        key={item.key}
                        item={item}
                        placementTransition={placementTransition}
                        ref={ref}
                        toastProps={toastProps}
                        remove={remove}
                    />
                )
            })}
        </div>
    )
}

ToastWrapper.getInstance = (props: ToastWrapperProps) => {
    const { wrapper, ...rest } = props
    const wrapperRef = createRef<ToastWrapperInstance>()
    const wrapperElement =
        (typeof wrapper === 'function' ? wrapper() : wrapper) || document.body

    return new Promise((resolve) => {
        const renderCallback = () => {
            resolve([wrapperRef, unmount])
        }

        function renderElement(element: ReactNode) {
            const mountElement = document.createElement('div')

            mountElement.setAttribute('id', `toast-wrapper-${props.placement}`)

            wrapperElement.appendChild(mountElement)

            const root = createRoot(mountElement)

            root.render(element)
            ;(wrapperElement as any).__root = root

            return root
        }

        const { unmount } = renderElement(
            <ToastWrapper
                {...rest}
                ref={wrapperRef}
                callback={renderCallback}
            />,
        )
    })
}

export default ToastWrapper

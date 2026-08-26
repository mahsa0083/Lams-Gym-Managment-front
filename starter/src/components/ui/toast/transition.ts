import { NotificationPlacement } from '../@types/placement'

type GetPlacementTransitionParams = {
    offsetX: string | number
    offsetY: string | number
    placement: NotificationPlacement
    transitionType: 'scale' | 'fade'
    withHeight?: boolean
}

type Motion = {
    opacity: number
    transform?: string
}

type MotionProps = {
    initial: Motion
    animate: Motion
    exit: Motion
}

type MotionDefault = {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
    transform?: string
}

export type MotionTransition = {
    default: MotionDefault
    variants: MotionProps
}

export const getPlacementTransition = ({
    offsetX,
    offsetY,
    placement,
    transitionType,
    withHeight = true,
}: GetPlacementTransitionParams) => {
    if (transitionType === 'fade') {
        return fadeTransition(offsetX, offsetY, withHeight)[placement]
    }

    return scaleTransition(offsetX, offsetY, withHeight)[placement]
}

const getScaleMotionProps = (withHeight: boolean) => {
    return {
        initial: {
            opacity: 0,
            transform: 'scale(0.75)',
        },
        animate: {
            transform: 'scale(1)',
            opacity: 1,
        },
        exit: {
            opacity: 0,
            transform: 'scale(0.75)',
            ...(withHeight ? { height: 0 } : {}),
        },
    }
}

const getFadeMotionProps = (withHeight: boolean) => {
    return {
        initial: {
            opacity: 0,
        },
        animate: {
            opacity: 1,
        },
        exit: {
            opacity: 0,
            ...(withHeight ? { height: 0 } : {}),
        },
    }
}

const scaleTransition = (
    offsetX: number | string,
    offsetY: number | string,
    withHeight: boolean,
): Record<NotificationPlacement, MotionTransition> => {
    return {
        'top-end': {
            default: {
                top: offsetY,
                right: offsetX,
            },
            variants: {
                ...getScaleMotionProps(withHeight),
            },
        },
        'top-start': {
            default: {
                top: offsetY,
                left: offsetX,
            },
            variants: {
                ...getScaleMotionProps(withHeight),
            },
        },
        'top-center': {
            default: {
                top: offsetY,
                left: '50%',
                transform: 'translateX(-50%)',
            },
            variants: {
                ...getScaleMotionProps(withHeight),
            },
        },
        'bottom-end': {
            default: {
                bottom: offsetY,
                right: offsetX,
            },
            variants: {
                ...getScaleMotionProps(withHeight),
            },
        },
        'bottom-start': {
            default: {
                bottom: offsetY,
                left: offsetX,
            },
            variants: {
                ...getScaleMotionProps(withHeight),
            },
        },
        'bottom-center': {
            default: {
                bottom: offsetY,
                left: '50%',
                transform: 'translateX(-50%)',
            },
            variants: {
                ...getScaleMotionProps(withHeight),
            },
        },
    }
}

const fadeTransition = (
    offsetX: number | string,
    offsetY: number | string,
    withHeight: boolean,
): Record<NotificationPlacement, MotionTransition> => {
    return {
        'top-end': {
            default: {
                top: offsetY,
                right: offsetX,
            },
            variants: {
                ...getFadeMotionProps(withHeight),
            },
        },
        'top-start': {
            default: {
                top: offsetY,
                left: offsetX,
            },
            variants: {
                ...getFadeMotionProps(withHeight),
            },
        },
        'top-center': {
            default: {
                top: offsetY,
                left: '50%',
                transform: 'translateX(-50%)',
            },
            variants: {
                ...getFadeMotionProps(withHeight),
            },
        },
        'bottom-end': {
            default: {
                bottom: offsetY,
                right: offsetX,
            },
            variants: {
                ...getFadeMotionProps(withHeight),
            },
        },
        'bottom-start': {
            default: {
                bottom: offsetY,
                left: offsetX,
            },
            variants: {
                ...getFadeMotionProps(withHeight),
            },
        },
        'bottom-center': {
            default: {
                bottom: offsetY,
                left: '50%',
                transform: 'translateX(-50%)',
            },
            variants: {
                ...getFadeMotionProps(withHeight),
            },
        },
    }
}

type Placement =
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

type Variants = 'dropScale' | 'drop'

export const getDropScalingTransition = (placement: Placement) => {
    const transformTop = { transform: 'translateY(5%) scale(0.95)', opacity: 0 }
    const transformBottom = { transform: ' scale(0.95)', opacity: 0 }
    const transformLeft = {
        transform: 'translateX(5%) scale(0.95)',
        opacity: 0,
    }
    const transformRight = {
        transform: 'translateX(-5%) scale(0.95)',
        opacity: 0,
    }

    if (placement === 'top') {
        return {
            initial: { ...transformTop, transformOrigin: 'bottom center' },
            close: { ...transformTop, transformOrigin: 'bottom center' },
        }
    }

    if (placement === 'top-start') {
        return {
            initial: { ...transformTop, transformOrigin: 'bottom left' },
            close: { ...transformTop, transformOrigin: 'bottom left' },
        }
    }

    if (placement === 'top-end') {
        return {
            initial: { ...transformTop, transformOrigin: 'bottom right' },
            close: { ...transformTop, transformOrigin: 'bottom right' },
        }
    }

    if (placement === 'bottom') {
        return {
            initial: { ...transformBottom, transformOrigin: 'top center' },
            close: { ...transformBottom, transformOrigin: 'top center' },
        }
    }

    if (placement === 'bottom-start') {
        return {
            initial: { ...transformBottom, transformOrigin: 'top left' },
            close: { ...transformBottom, transformOrigin: 'top left' },
        }
    }

    if (placement === 'bottom-end') {
        return {
            initial: { ...transformBottom, transformOrigin: 'top right' },
            close: { ...transformBottom, transformOrigin: 'top right' },
        }
    }

    if (placement === 'right') {
        return {
            initial: { ...transformRight, transformOrigin: 'center left' },
            close: { ...transformRight, transformOrigin: 'center left' },
        }
    }

    if (placement === 'right-start') {
        return {
            initial: { ...transformRight, transformOrigin: 'top left' },
            close: { ...transformRight, transformOrigin: 'top left' },
        }
    }

    if (placement === 'right-end') {
        return {
            initial: { ...transformRight, transformOrigin: 'bottom left' },
            close: { ...transformRight, transformOrigin: 'bottom left' },
        }
    }

    if (placement === 'left') {
        return {
            initial: { ...transformLeft, transformOrigin: 'center right' },
            close: { ...transformLeft, transformOrigin: 'center right' },
        }
    }

    if (placement === 'left-start') {
        return {
            initial: { ...transformLeft, transformOrigin: 'top right' },
            close: { ...transformLeft, transformOrigin: 'top right' },
        }
    }

    if (placement === 'left-end') {
        return {
            initial: { ...transformLeft, transformOrigin: 'bottom right' },
            close: { ...transformLeft, transformOrigin: 'bottom right' },
        }
    }
    return {}
}

export const getDropTransition = (placement: Placement) => {
    const transformTop = { transform: 'translateY(5%)', opacity: 0 }
    const transformBottom = { transform: 'translateY(-5%)', opacity: 0 }
    const transformLeft = { transform: 'translateX(5%)', opacity: 0 }
    const transformRight = { transform: 'translateX(-5%)', opacity: 0 }

    if (placement === 'top') {
        return {
            initial: { ...transformTop },
            close: { ...transformTop },
        }
    }

    if (placement === 'top-start') {
        return {
            initial: { ...transformTop },
            close: { ...transformTop },
        }
    }

    if (placement === 'top-end') {
        return {
            initial: { ...transformTop },
            close: { ...transformTop },
        }
    }

    if (placement === 'bottom') {
        return {
            initial: { ...transformBottom },
            close: { ...transformBottom },
        }
    }

    if (placement === 'bottom-start') {
        return {
            initial: { ...transformBottom },
            close: { ...transformBottom },
        }
    }

    if (placement === 'bottom-end') {
        return {
            initial: { ...transformBottom },
            close: { ...transformBottom },
        }
    }

    if (placement === 'right') {
        return {
            initial: { ...transformRight },
            close: { ...transformRight },
        }
    }

    if (placement === 'right-start') {
        return {
            initial: { ...transformRight },
            close: { ...transformRight },
        }
    }

    if (placement === 'right-end') {
        return {
            initial: { ...transformRight },
            close: { ...transformRight },
        }
    }

    if (placement === 'left') {
        return {
            initial: { ...transformLeft },
            close: { ...transformLeft },
        }
    }

    if (placement === 'left-start') {
        return {
            initial: { ...transformLeft },
            close: { ...transformLeft },
        }
    }

    if (placement === 'left-end') {
        return {
            initial: { ...transformLeft },
            close: { ...transformLeft },
        }
    }

    return {}
}

const transition = (placement: Placement, variant: Variants = 'dropScale') => {
    switch (variant) {
        case 'dropScale':
            return getDropScalingTransition(placement)
        case 'drop':
            return getDropTransition(placement)
        default:
            return {}
    }
}

export default transition

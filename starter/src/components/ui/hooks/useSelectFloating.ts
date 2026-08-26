import transition from '../utils/transitions'
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useTransitionStyles,
    Placement,
} from '@floating-ui/react'

const useSelectFloating = ({
    isOpen,
    offsetValue = 0,
    placement,
}: {
    isOpen: boolean
    offsetValue?: number
    placement?: Placement
}) => {
    const { floatingStyles, refs, y, context } = useFloating({
        open: isOpen,
        middleware: [offset(offsetValue), flip(), shift()],
        whileElementsMounted: autoUpdate,
        placement: placement,
    })

    const { isMounted, styles: transitionStyles } = useTransitionStyles(
        context,
        {
            duration: { open: 200, close: 200 },
            ...transition(context.placement, 'drop'),
        },
    )

    const mergedStyles = {
        position: floatingStyles.position,
        top: y ?? 0,
        left: 0,
        ...transitionStyles,
    }

    return {
        floatingStyles,
        transitionStyles,
        mergedStyles,
        isMounted,
        refs,
    }
}

export default useSelectFloating

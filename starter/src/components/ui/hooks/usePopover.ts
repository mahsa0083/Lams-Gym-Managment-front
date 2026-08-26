import { useState, useMemo, createContext, useContext } from 'react'
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    safePolygon,
    useClick,
    useDismiss,
    useRole,
    useHover,
    useInteractions,
    Placement,
} from '@floating-ui/react'
import type { Dispatch, SetStateAction } from 'react'
interface PopoverOptions {
    placement?: Placement
    modal?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: 'click' | 'hover'
}

export function usePopover({
    placement = 'bottom',
    modal,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    trigger = 'click',
}: PopoverOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const [labelId, setLabelId] = useState<string | undefined>()
    const [descriptionId, setDescriptionId] = useState<string | undefined>()

    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = setControlledOpen ?? setUncontrolledOpen

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                crossAxis: placement.includes('-'),
                fallbackAxisSideDirection: 'end',
                padding: 5,
            }),
            shift({ padding: 5 }),
        ],
    })

    const context = data.context

    const click = useClick(context, {
        enabled: controlledOpen == null || !!setControlledOpen,
    })
    const hover = useHover(context, {
        enabled: trigger === 'hover',
        delay: { open: 75 },
        handleClose: safePolygon({ blockPointerEvents: true }),
    })
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const interactions = useInteractions([
        ...(trigger === 'click' ? [click] : [hover]),
        dismiss,
        role,
    ])

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            modal,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [
            open,
            setOpen,
            interactions,
            data,
            modal,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        ],
    )
}

type ContextType =
    | (ReturnType<typeof usePopover> & {
          setLabelId: Dispatch<SetStateAction<string | undefined>>
          setDescriptionId: Dispatch<SetStateAction<string | undefined>>
      })
    | null

export const PopoverContext = createContext<ContextType>(null)

export const usePopoverContext = () => {
    const context = useContext(PopoverContext)

    if (context == null) {
        throw new Error('Popover components must be wrapped in <Popover />')
    }

    return context
}

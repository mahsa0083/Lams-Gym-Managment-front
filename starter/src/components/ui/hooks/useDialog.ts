import { useState, useMemo, useContext, createContext } from 'react'
import {
    useFloating,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
} from '@floating-ui/react'
import type { Dispatch, SetStateAction } from 'react'

export interface DialogOptions {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    shouldCloseOnOverlayClick?: boolean
    shouldCloseOnEsc?: boolean
}

export function useDialog({
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    shouldCloseOnOverlayClick = true,
    shouldCloseOnEsc = true,
}: DialogOptions = {}) {
    const [labelId, setLabelId] = useState<string | undefined>()
    const [descriptionId, setDescriptionId] = useState<string | undefined>()

    const open = controlledOpen
    const setOpen = setControlledOpen

    const data = useFloating({
        open,
        onOpenChange: setOpen,
    })

    const context = data.context

    const click = useClick(context, {
        enabled: controlledOpen == null,
    })

    const dismiss = useDismiss(context, {
        outsidePressEvent: 'click',
        outsidePress: shouldCloseOnOverlayClick,
        escapeKey: shouldCloseOnEsc,
    })

    const role = useRole(context)

    const interactions = useInteractions([click, dismiss, role])

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId],
    )
}

type ContextType =
    | (ReturnType<typeof useDialog> & {
          setLabelId: Dispatch<SetStateAction<string | undefined>>
          setDescriptionId: Dispatch<SetStateAction<string | undefined>>
      })
    | null

export const DialogContext = createContext<ContextType>(null)

export const useDialogContext = () => {
    const context = useContext(DialogContext)

    if (context == null) {
        throw new Error('Dialog components must be wrapped in <Dialog />')
    }

    return context
}

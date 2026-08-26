import { useCallback } from 'react'

import useControllableState from '../hooks/useControllableState'
import CollapsibleContext from './context'
import type { CommonProps } from '../@types/common'

export interface CollapsibleProps extends CommonProps {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

const Collapsible = ({
    children,
    open,
    defaultOpen = false,
    className = '',
    onOpenChange,
}: CollapsibleProps) => {
    const [isOpen, setIsOpen] = useControllableState<boolean>({
        prop: open,
        defaultProp: defaultOpen,
        onChange: onOpenChange,
    })

    const toggle = useCallback(() => {
        setIsOpen((prevOpen) => !prevOpen)
    }, [setIsOpen])

    return (
        <CollapsibleContext.Provider value={{ isOpen: !!isOpen, toggle }}>
            <div className={className}>{children}</div>
        </CollapsibleContext.Provider>
    )
}

export default Collapsible

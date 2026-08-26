import { DropdownContextProvider } from './context/dropdownContext'
import DropdownTrigger from './DropdownTrigger'
import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react'
import type {
    DropdownTriggerProps,
    DropdownTriggerRef,
} from './DropdownTrigger'
import type { HTMLProps, Ref, SyntheticEvent } from 'react'

export type DropdownRef = DropdownTriggerRef
export interface DropdownProps extends DropdownTriggerProps {
    eventKey?: string
    id?: string
    ref?: Ref<DropdownRef>
    onSelect?: (eventKey: string, e: SyntheticEvent) => void
}

const Dropdown = ({
    activeKey,
    onSelect,
    ref,
    ...props
}: DropdownProps & HTMLProps<HTMLElement>) => {
    const parentId = useFloatingParentNodeId()

    if (parentId === null) {
        return (
            <DropdownContextProvider value={{ activeKey, onSelect }}>
                <FloatingTree>
                    <DropdownTrigger {...props} ref={ref} />
                </FloatingTree>
            </DropdownContextProvider>
        )
    }

    return <DropdownTrigger {...props} ref={ref} />
}

export default Dropdown

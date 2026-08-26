import { DropdownContextProvider } from './context/dropdownContext'
import DropdownContextArea from './DropdownContextArea'
import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react'
import type {
    DropdownContextAreaProps,
    DropdownContextAreaRef,
} from './DropdownContextArea'
import type { HTMLProps, Ref } from 'react'

export type DropdownContextMenuRef = DropdownContextAreaRef
export interface DropdownContextMenuProps extends DropdownContextAreaProps {
    eventKey?: string
    id?: string
    ref?: Ref<DropdownContextMenuRef>
}

const DropdownContextMenu = ({
    activeKey,
    ref,
    ...props
}: DropdownContextAreaProps & HTMLProps<HTMLElement>) => {
    const parentId = useFloatingParentNodeId()

    if (parentId === null) {
        return (
            <DropdownContextProvider value={{ activeKey }}>
                <FloatingTree>
                    <DropdownContextArea {...props} ref={ref} />
                </FloatingTree>
            </DropdownContextProvider>
        )
    }

    return <DropdownContextArea {...props} ref={ref} />
}

export default DropdownContextMenu

import DropdownMenu from './DropdownTrigger'
import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react'
import type {
    DropdownTriggerProps,
    DropdownTriggerRef,
} from './DropdownTrigger'
import type { HTMLProps, Ref } from 'react'

export interface DropdownSubProps extends Omit<
    DropdownTriggerProps,
    'trigger' | 'disabled' | 'activeKey'
> {
    eventKey?: string
    id?: string
    ref?: Ref<HTMLElement | DropdownTriggerRef>
}

const DropdownSub = ({
    ref,
    ...props
}: DropdownSubProps & HTMLProps<HTMLElement>) => {
    const parentId = useFloatingParentNodeId()

    if (parentId === null) {
        return (
            <FloatingTree>
                <DropdownMenu {...props} ref={ref} />
            </FloatingTree>
        )
    }

    return <DropdownMenu {...props} ref={ref} />
}

export default DropdownSub

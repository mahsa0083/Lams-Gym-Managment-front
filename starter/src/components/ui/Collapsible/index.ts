import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import _Collapsible, { CollapsibleProps } from './Collapsible'
import Content from './Content'
import Trigger from './Trigger'

export type { CollapsibleProps } from './Collapsible'
export type { CollapsibleContentProps } from './Content'
export type { CollapsibleTriggerProps } from './Trigger'

type CompoundedComponent = ForwardRefExoticComponent<
    CollapsibleProps & RefAttributes<HTMLSpanElement>
> & {
    Content: typeof Content
    Trigger: typeof Trigger
}

const Collapsible = _Collapsible as CompoundedComponent

Collapsible.Content = Content
Collapsible.Trigger = Trigger

export { Collapsible }

export default Collapsible

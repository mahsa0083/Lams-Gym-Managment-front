import type { ForwardRefExoticComponent } from 'react'
import _Scroll, { ScrollProps } from './Scroll'
import ScrollFlexSize from './ScrollFlexSize'

export type { ScrollProps } from './Scroll'
export type { ScrollFlexSizeProps } from './ScrollFlexSize'

type CompoundedComponent = ForwardRefExoticComponent<ScrollProps> & {
    FlexSize: typeof ScrollFlexSize
}

const Scroll = _Scroll as CompoundedComponent

Scroll.FlexSize = ScrollFlexSize

export { Scroll }

export default Scroll

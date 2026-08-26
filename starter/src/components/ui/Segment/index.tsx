import type { RefAttributes } from 'react'
import _Segment, { SegmentProps } from './Segment'
import SegmentItem from './SegmentItem'

export type { SegmentProps } from './Segment'
export type { SegmentItemProps } from './SegmentItem'

type CompoundedComponent = (<T extends 'single' | 'multiple' = 'single'>(
    props: SegmentProps<T> & RefAttributes<HTMLSpanElement>,
) => React.ReactElement) & {
    Item: typeof SegmentItem
}

const Segment = _Segment as CompoundedComponent

Segment.Item = SegmentItem

export { Segment }

export default Segment

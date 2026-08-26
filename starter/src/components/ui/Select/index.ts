// index.ts
import type { RefAttributes } from 'react'
import _Select, { SelectProps } from './Select'
import Multi from './Multi'

export type { SelectProps } from './Select'

type CompoundedComponent = (<T = object>(
    props: SelectProps<T> & RefAttributes<HTMLSpanElement>,
) => React.ReactElement) & {
    Multi: typeof Multi
}

const Select = _Select as unknown as CompoundedComponent

Select.Multi = Multi

export { Select }
export default Select

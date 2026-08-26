import { createContext, useContext } from 'react'
import type { TypeAttributes } from '../@types/common'

export type SegmentValue<T extends 'single' | 'multiple'> = T extends 'multiple'
    ? string[]
    : string

export type SegmentSelectionType = 'single' | 'multiple'

export type SegmentContextProps<T extends 'single' | 'multiple' = 'single'> = {
    value?: SegmentValue<T>
    onActive?: (itemValue: SegmentValue<T>) => void
    onDeactivate?: (itemValue: SegmentValue<T>) => void
    selectionType?: SegmentSelectionType
    size?: TypeAttributes.ControlSize
}

const SegmentContext = createContext<SegmentContextProps>({})

export const SegmentContextProvider = SegmentContext.Provider

export const SegmentContextConsumer = SegmentContext.Consumer

export function useSegment() {
    return useContext(SegmentContext)
}

export default SegmentContext

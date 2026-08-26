import { createContext } from 'react'
import type { SyntheticEvent } from 'react'
export type DropdownContextProps = {
    activeKey?: string
    onSelect?: (eventKey: string, e: SyntheticEvent) => void
}

const DropdownContext = createContext<DropdownContextProps>({})

export const DropdownContextProvider = DropdownContext.Provider

export default DropdownContext

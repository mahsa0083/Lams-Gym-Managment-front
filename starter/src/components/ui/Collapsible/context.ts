import { createContext, useContext } from 'react'

type CollapsibleContextProps = {
    isOpen: boolean
    toggle: () => void
}

const CollapsibleContext = createContext<CollapsibleContextProps>({
    isOpen: false,
    toggle: () => {},
})

export const useCollapsible = () => {
    return useContext(CollapsibleContext)
}

export default CollapsibleContext

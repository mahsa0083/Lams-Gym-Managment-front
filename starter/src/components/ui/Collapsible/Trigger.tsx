import { motion } from 'motion/react'
import { useCollapsible } from './context'
import { ChevronDown } from '../Icons'
import type { ReactNode } from 'react'

export interface CollapsibleTriggerProps {
    children:
        | ((props: { isOpen: boolean; toggle: () => void }) => ReactNode)
        | ReactNode
    className?: string
}

const Trigger = (props: CollapsibleTriggerProps) => {
    const { isOpen, toggle } = useCollapsible()

    const { children, className } = props

    if (typeof children === 'function') {
        return <>{children({ isOpen, toggle })}</>
    }

    return (
        <button
            className={`flex items-center justify-between w-full p-4 font-medium text-left focus:outline-none ${className}`}
            onClick={toggle}
            aria-expanded={isOpen}
            type="button"
        >
            <span>{children}</span>
            <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
            >
                <ChevronDown />
            </motion.span>
        </button>
    )
}

export default Trigger

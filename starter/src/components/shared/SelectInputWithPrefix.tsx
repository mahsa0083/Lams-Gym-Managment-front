import type { ReactNode } from 'react'

type SelectInputWithPrefixProps = {
    label: string | ReactNode
    prefix?: string | ReactNode
    displayClass?: string
    showPrefix?: boolean
}

const SelectInputWithPrefix = (props: SelectInputWithPrefixProps) => {
    const { prefix, label, showPrefix = true } = props

    return (
        <div className="flex items-center flex-1 gap-2 h-full relative">
            {showPrefix && (
                <span className="h-full flex items-center justify-center z-0">
                    {prefix}
                </span>
            )}
            {label}
        </div>
    )
}

export default SelectInputWithPrefix

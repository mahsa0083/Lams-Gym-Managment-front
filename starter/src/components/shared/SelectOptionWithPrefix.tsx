import type { ReactNode } from 'react'

type SelectOptionWithPrefixProps = {
    prefix?: string | ReactNode
    label: string | ReactNode
    selected?: boolean
    checkIcon?: ReactNode
}

const SelectOptionWithPrefix = ({
    prefix,
    selected,
    label,
    checkIcon,
}: SelectOptionWithPrefixProps) => {
    return (
        <>
            <div className="flex items-center gap-2">
                {prefix}
                {label}
            </div>
            {selected ? checkIcon : null}
        </>
    )
}

export default SelectOptionWithPrefix

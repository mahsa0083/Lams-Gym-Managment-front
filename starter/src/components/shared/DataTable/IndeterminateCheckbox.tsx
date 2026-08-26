import { useRef, useEffect } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import type { ChangeEvent } from 'react'

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
    onChange: (event: CheckBoxChangeEvent) => void
    indeterminate: boolean
    onRowSelect?: (event: CheckBoxChangeEvent) => void
    onAllRowSelect?: (event: CheckBoxChangeEvent) => void
}

const IndeterminateCheckbox = (props: IndeterminateCheckboxProps) => {
    const { indeterminate, onChange, onRowSelect, onAllRowSelect, ...rest } =
        props

    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref.current) {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, indeterminate])

    const handleChange = (e: CheckBoxChangeEvent) => {
        onChange(e)
        onRowSelect?.(e)
        onAllRowSelect?.(e)
    }

    return (
        <Checkbox
            ref={ref}
            className="mb-0"
            onChange={(_, e) => handleChange(e)}
            {...rest}
        />
    )
}

export default IndeterminateCheckbox

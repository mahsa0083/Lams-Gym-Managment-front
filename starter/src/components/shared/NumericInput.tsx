import { NumericFormat, NumericFormatProps } from 'react-number-format'
import Input from '@/components/ui/Input'
import type { ReactNode, ComponentType } from 'react'
import type { InputProps } from '@/components/ui'

interface InputAffix {
    inputSuffix?: string | ReactNode
    inputPrefix?: string | ReactNode
}

type NumberInputProps = Omit<InputProps, 'prefix' | 'suffix'> & InputAffix

type NumberFormatInputProps = Omit<NumericFormatProps, 'form' | 'size'> &
    InputAffix &
    Pick<InputProps, 'size'>

type NumericInputProps = NumberInputProps & NumberFormatInputProps & {}

const NumberInput = ({
    inputSuffix,
    inputPrefix,
    ...props
}: NumberInputProps) => {
    return (
        <Input
            {...props}
            value={props.value}
            suffix={inputSuffix}
            prefix={inputPrefix}
        />
    )
}

const NumberFormatInput = ({
    onValueChange,
    size,
    ...rest
}: NumberFormatInputProps) => {
    return (
        <NumericFormat
            customInput={NumberInput as ComponentType}
            onValueChange={onValueChange}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            size={size as any}
            {...rest}
        />
    )
}

const NumericInput = ({
    inputSuffix,
    inputPrefix,
    onValueChange,
    size,
    ...rest
}: NumericInputProps) => {
    return (
        <NumberFormatInput
            inputPrefix={inputPrefix}
            inputSuffix={inputSuffix}
            onValueChange={onValueChange}
            size={size}
            {...rest}
        />
    )
}

export default NumericInput

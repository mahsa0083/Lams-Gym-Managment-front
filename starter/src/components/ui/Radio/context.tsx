import { createContext } from 'react'
import type { ChangeEvent } from 'react'

export type RadioValue = string

type RadioGroupContextProps = {
    vertical?: boolean
    name?: string
    value?: RadioValue
    radioClass?: string
    disabled?: boolean
    onChange?: (nextValue: RadioValue, e: ChangeEvent<HTMLInputElement>) => void
}

const RadioGroupContext = createContext<RadioGroupContextProps>({})

export const RadioGroupContextProvider = RadioGroupContext.Provider

export default RadioGroupContext

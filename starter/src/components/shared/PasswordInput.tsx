import { useState } from 'react'
import { Input, InputProps } from '@/components/ui/Input'
import { LiEye, LiEyeSlash } from '@/icons'
import type { MouseEvent, Ref } from 'react'

interface PasswordInputProps extends InputProps {
    onVisibleChange?: (visible: boolean) => void
    ref?: Ref<HTMLInputElement>
}

const PasswordInput = (props: PasswordInputProps) => {
    const { onVisibleChange, ref, ...rest } = props

    const [pwInputType, setPwInputType] = useState('password')

    const onPasswordVisibleClick = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault()
        const nextValue = pwInputType === 'password' ? 'text' : 'password'
        setPwInputType(nextValue)
        onVisibleChange?.(nextValue === 'text')
    }

    return (
        <Input
            {...rest}
            ref={ref}
            type={pwInputType}
            suffix={
                <button
                    className="cursor-pointer select-none text-lg"
                    type="button"
                    onClick={onPasswordVisibleClick}
                >
                    {pwInputType === 'password' ? (
                        <LiEye className="heading-text" />
                    ) : (
                        <LiEyeSlash className="heading-text" />
                    )}
                </button>
            }
        />
    )
}

export default PasswordInput

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'

type ForgotPasswordFormSchema = {
    email: string
}

export type OnForgotPasswordPayload = {
    values: ForgotPasswordFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
    setEmailSent: (sent: boolean) => void
}

export type OnForgotPassword = (payload: OnForgotPasswordPayload) => void

interface ForgotPasswordFormProps extends CommonProps {
    emailSent: boolean
    setEmailSent?: (sent: boolean) => void
    setMessage?: (message: string) => void
    onForgotPassword?: OnForgotPassword
}

const validationSchema = z.object({
    email: z.string().email().min(5),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const {
        className,
        setMessage,
        setEmailSent,
        onForgotPassword,
        emailSent,
        children,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ForgotPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues:{
            email: '',
        }
    })

    const onSubmit = async (values: ForgotPasswordFormSchema) => {
        if (onForgotPassword) {
            onForgotPassword({
                values,
                setSubmitting,
                setMessage: setMessage!,
                setEmailSent: setEmailSent!,
            })
        }
    }

    return (
        <div className={className}>
            {!emailSent ? (
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="ایمیل"
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder="ایمیل"
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'در حال ارسال...' : 'ارسال'}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ForgotPasswordForm

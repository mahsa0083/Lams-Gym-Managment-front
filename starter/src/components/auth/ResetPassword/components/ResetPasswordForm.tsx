import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'

type ResetPasswordFormSchema = {
    newPassword: string
    confirmPassword: string
}

export type OnResetPasswordPayload = {
    values: ResetPasswordFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
    setResetComplete: (complete: boolean) => void
}

export type OnResetPassword = (payload: OnResetPasswordPayload) => void

interface ResetPasswordFormProps extends CommonProps {
    resetComplete: boolean
    setResetComplete?: (complete: boolean) => void
    setMessage?: (message: string) => void
    onResetPassword?: OnResetPassword
}

const validationSchema = z
    .object({
        newPassword: z.string().min(1, 'لطفاً رمز عبور خود را وارد کنید'),
        confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'رمز عبور شما مطابقت ندارد',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const {
        className,
        setMessage,
        setResetComplete,
        onResetPassword,
        resetComplete,
        children,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues:{
            confirmPassword: '',
            newPassword: ''
        }
    })

    const onSubmit = async (values: ResetPasswordFormSchema) => {
        if (onResetPassword) {
            onResetPassword({
                values,
                setSubmitting,
                setMessage: setMessage!,
                setResetComplete: setResetComplete!,
            })
        }
    }

    return (
        <div className={className}>
            {!resetComplete ? (
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="رمز عبور"
                        invalid={Boolean(errors.newPassword)}
                        errorMessage={errors.newPassword?.message}
                    >
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="••••••••••••"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="تکرار رمز عبور"
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="تکرار رمز عبور"
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

export default ResetPasswordForm

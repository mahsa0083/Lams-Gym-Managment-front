import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OtpInput from '@/components/shared/OtpInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'

type OtpVerificationFormSchema = {
    otp: string
}

export type OnOtpVerificationPayload = {
    values: OtpVerificationFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
    setOtpVerified: (message: string) => void
}

export type OnOtpVerification = (payload: OnOtpVerificationPayload) => void

interface OtpVerificationFormProps extends CommonProps {
    setOtpVerified?: (message: string) => void
    setMessage?: (message: string) => void
    onOtpVerification?: OnOtpVerification
}

const OTP_LENGTH = 6

const validationSchema = z.object({
    otp: z.string().min(OTP_LENGTH, { message: 'لطفاً یک OTP معتبر وارد کنید' }),
})

const OtpVerificationForm = (props: OtpVerificationFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { className, setMessage, setOtpVerified, onOtpVerification } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<OtpVerificationFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values: OtpVerificationFormSchema) => {
        if (onOtpVerification) {
            onOtpVerification({
                values,
                setSubmitting,
                setMessage: setMessage!,
                setOtpVerified: setOtpVerified!,
            })
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    invalid={Boolean(errors.otp)}
                    errorMessage={errors.otp?.message}
                >
                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <OtpInput
                                placeholder=""
                                inputClass="h-[58px]"
                                length={OTP_LENGTH}
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
                    {isSubmitting ? 'در حال تأیید...' : 'تأیید OTP'}
                </Button>
            </Form>
        </div>
    )
}

export default OtpVerificationForm

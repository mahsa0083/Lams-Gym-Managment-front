import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ForgotPasswordForm from './components/ForgotPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useRouter } from 'next/navigation'
import type { OnForgotPassword } from './components/ForgotPasswordForm'

type ForgotPasswordBaseProps = {
    signInUrl?: string
    onForgotPassword?: OnForgotPassword
}

const ForgotPasswordBase = ({
    signInUrl = '/sign-in',
    onForgotPassword,
}: ForgotPasswordBaseProps) => {
    const [emailSent, setEmailSent] = useState(false)
    const [message, setMessage] = useTimeOutMessage()

    const router = useRouter()

    const handleContinue = () => {
        router.push(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {emailSent ? (
                    <>
                        <h3 className="mb-2">ایمیل خود را بررسی کنید</h3>
                        <p className="font-semibold heading-text">
                            ما یک لینک بازیابی رمز عبور به ایمیل شما ارسال کرده‌ایم
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-2">فراموشی رمز عبور</h3>
                        <p className="heading-text">
                            لطفاً ایمیل خود را وارد کنید تا کد تأیید دریافت کنید
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ForgotPasswordForm
                emailSent={emailSent}
                setEmailSent={setEmailSent}
                setMessage={setMessage}
                onForgotPassword={onForgotPassword}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    ادامه
                </Button>
            </ForgotPasswordForm>
            <div className="mt-4 text-center">
                <span>بازگشت به </span>
                <ActionLink
                    href={signInUrl}
                    className="heading-text font-medium"
                    themeColor={false}
                >
                    ورود
                </ActionLink>
            </div>
        </div>
    )
}

export default ForgotPasswordBase

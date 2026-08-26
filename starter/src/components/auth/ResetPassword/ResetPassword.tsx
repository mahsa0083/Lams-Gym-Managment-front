import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ResetPasswordForm from './components/ResetPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useRouter } from 'next/navigation'
import type { OnResetPassword } from './components/ResetPasswordForm'

type ResetPasswordBaseProps = {
    signInUrl?: string
    onResetPassword?: OnResetPassword
}

const ResetPasswordBase = ({
    signInUrl = '/sign-in',
    onResetPassword,
}: ResetPasswordBaseProps) => {
    const [resetComplete, setResetComplete] = useState(false)
    const [message, setMessage] = useTimeOutMessage()

    const router = useRouter()

    const handleContinue = () => {
        router.push(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {resetComplete ? (
                    <>
                        <h3 className="mb-1">بازنشانی انجام شد</h3>
                        <p className="font-semibold heading-text">
                            رمز عبور شما با موفقیت بازنشانی شد
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-1">تنظیم رمز عبور جدید</h3>
                        <p className="heading-text">
                            رمز عبور جدید باید متفاوت از رمز عبور قبلی باشد
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ResetPasswordForm
                resetComplete={resetComplete}
                setResetComplete={setResetComplete}
                setMessage={setMessage}
                onResetPassword={onResetPassword}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    ادامه
                </Button>
            </ResetPasswordForm>
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

export default ResetPasswordBase

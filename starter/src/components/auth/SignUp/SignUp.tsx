import Alert from '@/components/ui/Alert'
import SignUpForm from './components/SignUpForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import type { OnSignUp } from './components/SignUpForm'

type SignUpBaseProps = {
    signInUrl?: string
    onSignUp?: OnSignUp
}

const SignUpBase = ({ signInUrl = '/sign-in', onSignUp }: SignUpBaseProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">ثبت نام</h3>
                <p className="heading-text">
                    بیایید شروع کنیم با دوره آزمایشی رایگان شما
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignUpForm onSignUp={onSignUp} setMessage={setMessage} />
            <div>
                <div className="mt-6 text-center">
                    <span>قبلاً حساب کاربری دارید؟ </span>
                    <ActionLink
                        href={signInUrl}
                        className="heading-text font-medium"
                        themeColor={false}
                    >
                        ورود
                    </ActionLink>
                </div>
            </div>
        </>
   
    )
}

export default SignUpBase

'use client'

import ForgotPassword from '@/components/auth/ForgotPassword'
import type { OnForgotPasswordPayload } from '@/components/auth/ForgotPassword'

const ForgotPasswordClient = () => {
    const handleForgotPassword = ({
        setSubmitting,
        setEmailSent,
    }: OnForgotPasswordPayload) => {
        setSubmitting(false)
        setEmailSent(true)
    }

    return (
        <ForgotPassword
            onForgotPassword={handleForgotPassword}
            signInUrl="/sign-in"
        />
    )
}

export default ForgotPasswordClient

'use client'

import ResetPassword from '@/components/auth/ResetPassword'
import type { OnResetPasswordPayload } from '@/components/auth/ResetPassword'

const ResetPasswordClient = () => {
    const handleResetPassword = ({
        setSubmitting,
        setResetComplete,
    }: OnResetPasswordPayload) => {
        setSubmitting(false)
        setResetComplete(true)
    }

    return (
        <ResetPassword
            onResetPassword={handleResetPassword}
            signInUrl="/sign-in"
        />
    )
}

export default ResetPasswordClient

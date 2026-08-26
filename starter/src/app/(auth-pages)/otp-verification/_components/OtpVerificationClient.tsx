'use client'

import OtpVerification from '@/components/auth/OtpVerification'
import type { OnOtpVerificationPayload } from '@/components/auth/OtpVerification'

const OtpVerificationClient = () => {
    const handleOtpVerification = ({
        setSubmitting,
        setOtpVerified,
    }: OnOtpVerificationPayload) => {
        setSubmitting(false)
        setOtpVerified('OTP verified successfully')
    }

    return <OtpVerification onOtpVerification={handleOtpVerification} />
}

export default OtpVerificationClient

'use client'

import SignUp from '@/components/auth/SignUp'
import type { OnSignUpPayload } from '@/components/auth/SignUp'

const SignUpClient = () => {
    const handleSignUp = ({ setSubmitting }: OnSignUpPayload) => {
        setSubmitting(false)
    }

    return <SignUp onSignUp={handleSignUp} signInUrl="/sign-in" />
}

export default SignUpClient

'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import type { SignInCredential } from '@/@types/auth'

export const onSignInWithCredentials = async (
    { email, password, nationalId, otpCode }: any,
    callbackUrl?: string,
) => {
    try {
        await signIn('credentials', {
            email,
            password,
            nationalId,
            otpCode,
            redirectTo: callbackUrl || '/', // بعد از ورود، مستقیم به / می‌رود و میدل‌ور بدون پرش به پنل نقش ردایرکت می‌کند
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch ((error as any).type) {
                case 'CredentialsSignin':
                    return { error: 'اطلاعات ورود یا کد OTP اشتباه است.' }
                default:
                    return { error: 'خطایی در سیستم رخ داد.' }
            }
        }
        throw error
    }
}
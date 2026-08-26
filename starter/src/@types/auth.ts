// export type SignInCredential = {
//     email: string
//     password: string
// }

// export type SignInResponse = {
//     token: string
//     user: {
//         userId: string
//         userName: string
//         authority: string[]
//         avatar: string
//         email: string
//     }
// }

// export type SignUpResponse = {
//     status: string
//     message: string
// }

// export type SignUpCredential = {
//     userName: string
//     email: string
//     password: string
// }

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    newPassword: string
    confirmPassword: string
    token?: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

// export type AuthResult = Promise<{
//     status: AuthRequestStatus
//     message: string
// }>


export type RegisterCredential = {
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
     birthDate:  Date // فرمت: YYYY-MM-DD
}

export type RegisterResponse = {
    message: string
}

/**
 * پاسخ ثبت‌نام
 * فعلاً تا زمانی که Response دقیق API را ببینیم،
 * status و message را اختیاری قرار می‌دهیم.
 */
export type SignUpResponse = {
    status?: string
    message?: string
}

/**
 * مرحله اول ورود:
 * ارسال کد ملی برای دریافت OTP
 */
export type SendOtpCredential = {
    nationalCode: string
}

/**
 * پاسخ ارسال OTP
 */
export type SendOtpResponse = {
    status?: string
    message?: string
}

/**
 * مرحله دوم ورود:
 * ارسال کد ملی و کد OTP
 */
export type SignInCredential = {
    nationalCode: string
    code: string
}

/**
 * پاسخ موفق API لاگین
 */
export type SignInResponse = {
    accessToken: string
    refreshToken: string
    expiresAt: string
}




export type User = {
   userId?: string | null
    avatar?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
    firstName?: string | null
    lastName?: string | null
    phoneNumber?: string | null
    nationalCode?: string | null
}

export type Token = {
    accessToken: string
    refreshToken?: string
    expiresAt?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}

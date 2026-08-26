'use server'
import { signInUserData } from '@/mock/data/authData'
import sleep from '@/utils/sleep'

import type { SignInCredential } from '@/@types/auth'

// داده‌های ماک تست
const MOCK_USERS: Record<string, { id: string; userName: string; email: string; avatar: string; authority: string[] }> = {
    '1234567890': {
        id: '1',
        userName: 'مدیر سیستم',
        email: 'admin@gym.com',
        avatar: '/img/avatars/thumb-1.jpg',
        authority: ['ADMIN'],
    },
    '9876543210': {
        id: '2',
        userName: 'علی مربی',
        email: 'trainer@gym.com',
        avatar: '/img/avatars/thumb-2.jpg',
        authority: ['TRAINER'],
    },
    '1111111111': {
        id: '3',
        userName: 'رضا عضوی',
        email: 'member@gym.com',
        avatar: '/img/avatars/thumb-3.jpg',
        authority: ['MEMBER'],
    },
}

export default async function validateCredential(credentials: SignInCredential) {
    const { nationalId, otpCode } = credentials as any

    // بررسی کد OTP ماک (مثلاً 123456)
    if (otpCode !== '123456') {
        return null
    }

    // بررسی وجود کد ملی در داده‌های ماک
    const user = MOCK_USERS[nationalId]

    if (user) {
        return user
    }

    // اگر کد ملی جدید بود، به عنوان MEMBER ثبت ورود انجام می‌شود
    return {
        id: Date.now().toString(),
        userName: 'کاربر جدید',
        email: 'user@gym.com',
        avatar: '/img/avatars/thumb-1.jpg',
        authority: ['MEMBER'],
    }
}


// const validateCredential = async (values: SignInCredential) => {
//     const { email, password } = values

//     await sleep(80)

//     const user = signInUserData.find(
//         (user) => user.email === email && user.password === password,
//     )

//     return user
// }

// export default validateCredential

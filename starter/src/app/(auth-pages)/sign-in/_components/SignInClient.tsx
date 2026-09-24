'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import axios from 'axios'
import { apiRegister, apiSendOtp } from '@/services/client/AuthService'
import DatePicker from '@/components/ui/DatePicker'

export default function AuthPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

    // استیت‌های ورود (Login)
    const [loginStep, setLoginStep] = useState<1 | 2>(1)
    const [nationalId, setNationalId] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loading, setLoading] = useState(false)

    // استیت‌های دیالوگ اختصاصی (مدیریت باز/بسته بودن و متن پیام)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogTitle, setDialogTitle] = useState('')
    const [dialogMessage, setDialogMessage] = useState('')

    // استیت‌های ثبت‌نام (Register)
    const [registerForm, setRegisterForm] = useState({
        firstName: '',
        lastName: '',
        nationalId: '',
        phoneNumber: '',
        birthDate: null as Date | null,
    })
    const [registerSuccess, setRegisterSuccess] = useState('')

    // تابع کمکی برای نمایش دیالوگ سفارشی
    const showCustomDialog = (title: string, message: string) => {
        setDialogTitle(title)
        setDialogMessage(message)
        setDialogOpen(true)
    }

    // مرحله ۱: ارسال کد ملی و درخواست کد OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')

        const normalizedNationalCode = nationalId.trim()

        if (!/^\d{10}$/.test(normalizedNationalCode)) {
            showCustomDialog(
                'خطا در اطلاعات',
                'کد ملی باید دقیقاً ۱۰ رقم انگلیسی باشد.',
            )
            return
        }

        setLoading(true)

        try {
            await apiSendOtp({
                nationalCode: normalizedNationalCode,
            })

            setLoginStep(2)

            showCustomDialog('ارسال موفق', 'کد تأیید برای شما ارسال شد.')
        } catch (error) {
            console.error('Send OTP error:', error)

            let message = 'ارسال کد تأیید ناموفق بود. دوباره تلاش کنید.'

            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as {
                    message?: string
                    title?: string
                    detail?: string
                    errors?: Record<string, string[]>
                }

                // اگر بک‌اند پیام ساده‌ای برگرداند
                if (responseData?.message) {
                    message = responseData.message
                }
                // پیام استاندارد ProblemDetails در ASP.NET Core
                else if (responseData?.detail) {
                    message = responseData.detail
                }
                // خطاهای اعتبارسنجی ASP.NET Core
                else if (responseData?.errors) {
                    message = Object.values(responseData.errors)
                        .flat()
                        .join('\n')
                }
               
            }

            showCustomDialog('خطا در ارسال کد', message)
        } finally {
            setLoading(false)
        }
    }

    // مرحله ۲: تأیید کد OTP و ورود به سیستم با NextAuth JWT
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')
        setLoading(true)

        try {
            const res = await signIn('credentials', {
                nationalCode: nationalId.trim(),
                code: otpCode.trim(),
                redirect: false,
            })
            console.log('OTP sign-in result:', res)
            if (res?.error) {
                showCustomDialog(
                    'خطای ورود',
                    'کد وارد شده یا اطلاعات کاربری نامعتبر است.',
                )
                setLoading(false)
                return
            }

            router.refresh()
            router.push('/')
        } catch (error) {
            showCustomDialog(
                'خطای سرور',
                'خطایی در برقراری ارتباط با سرور رخ داد.',
            )
            setLoading(false)
        }
    }
const formatGregorianDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

    // ثبت‌نام اعضا
    const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const { firstName, lastName, nationalId, phoneNumber, birthDate } =
        registerForm

    const normalizedNationalCode = nationalId.trim()
    const normalizedPhoneNumber = phoneNumber.trim()

    if (
        !firstName.trim() ||
        !lastName.trim() ||
        !/^\d{10}$/.test(normalizedNationalCode) ||
        !/^09\d{9}$/.test(normalizedPhoneNumber) ||
        !birthDate
    ) {
        showCustomDialog(
            'فرم ناقص یا نامعتبر',
            'نام، نام خانوادگی، کد ملی ۱۰ رقمی، شماره همراه معتبر و تاریخ تولد را وارد کنید.',
        )
        return
    }

    setLoading(true)

    try {
        await apiRegister({
            firstName,
            lastName,
            nationalCode: normalizedNationalCode,
            phoneNumber: normalizedPhoneNumber,
            birthDate,
        })

        setRegisterSuccess(
            'ثبت‌نام شما با موفقیت انجام شد! اکنون می‌توانید وارد شوید.',
        )

        // کد ملی واردشده به فرم ورود منتقل می‌شود
        setNationalId(normalizedNationalCode)

        showCustomDialog('موفقیت', 'ثبت‌نام شما با موفقیت انجام شد!')

        setTimeout(() => {
            setActiveTab('login')
            setLoginStep(1)
            setRegisterSuccess('')
        }, 1500)
    } catch (error) {
        console.error('Register error:', error)

        let message = 'ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.'

        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data as {
                message?: string
                detail?: string
                errors?: Record<string, string[]>
            }

            if (responseData?.message) {
                message = responseData.message
            } else if (responseData?.detail) {
                message = responseData.detail
            } else if (responseData?.errors) {
                message = Object.values(responseData.errors).flat().join('\n')
            }
        }

        showCustomDialog('خطا در ثبت‌نام', message)
    } finally {
        setLoading(false)
    }
}


    return (
        // پس‌زمینه یکدست برای کل صفحه، بدون اسکرول و کاملاً وسط‌چین
        <div className="fixed inset-0 w-screen h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-0 m-0 overflow-hidden dir-rtl">
            {/* کادر اصلی فرم با ارتفاع و عرض ثابت تا با تغییر تب‌ها سایزش جابجا نشود */}
            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 flex flex-col justify-between rounded-3xl shadow-xl">
                <div>
                    {/* هدر معرفی گروه فناوری لمسه */}
                    <div className="flex flex-col items-center justify-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                        {/* جایگزین لوگو یا آیکن دلخواه */}
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-600/30 mb-2">
                            ل
                        </div>
                        <h1 className="text-base font-extrabold text-gray-900 dark:text-white">
                        گروه فناوری لمس
                        </h1>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          سامانه مدیریت یکپارچه اعضا باشگاه
                        </p>
                    </div>
                </div>

                {/* تب‌ها */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-2">
                    <button
                        onClick={() => {
                            setActiveTab('login')
                            setLoginError('')
                        }}
                        className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${activeTab === 'login'
                                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        ورود
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('register')
                            setLoginError('')
                        }}
                        className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${activeTab === 'register'
                                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        ثبت‌نام اعضا
                    </button>
                </div>

                {/* محتوای متغیر (ورود / ثبت‌نام) که فضای وسط را پر می‌کند */}
                <div className="flex-1 flex flex-col justify-center py-2">
                    {activeTab === 'login' ? (
                        <div>
                            <div className="mb-6 text-center">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {loginStep === 1
                                        ? 'ورود با کد ملی'
                                        : 'تأیید کد ورود'}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {loginStep === 1
                                        ? 'کد ملی خود را وارد کنید'
                                        : `کد پیامک شده به شماره همراه مربوط به کد ملی ${nationalId} را وارد کنید`}
                                </p>
                            </div>

                            {loginError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                                    {loginError}
                                </div>
                            )}

                            {loginStep === 1 && (
                                <form
                                    onSubmit={handleRequestOtp}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            کد ملی
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
                                            value={nationalId}
                                            onChange={(e) =>
                                                setNationalId(e.target.value)
                                            }
                                            className="w-full px-4 py-2.5 text-center text-base tracking-widest rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {loading
                                            ? 'در حال ارسال...'
                                            : 'ارسال کد تأیید'}
                                    </button>
                                </form>
                            )}

                            {loginStep === 2 && (
                                <form
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            کد یک‌بار مصرف (OTP)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder=""
                                            value={otpCode}
                                            onChange={(e) =>
                                                setOtpCode(e.target.value)
                                            }
                                            className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-mono rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {loading
                                            ? 'در حال بررسی...'
                                            : 'تأیید و ورود'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLoginStep(1)
                                            setOtpCode('')
                                        }}
                                        className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                    >
                                        تغییر کد ملی
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 text-center">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    عضویت جدید در باشگاه
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    اطلاعات خود را جهت ثبت‌نام وارد کنید
                                </p>
                            </div>

                            {registerSuccess && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium text-center">
                                    {registerSuccess}
                                </div>
                            )}

                            <form
                                onSubmit={handleRegister}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            نام
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="نام"
                                            value={registerForm.firstName}
                                            onChange={(e) =>
                                                setRegisterForm({
                                                    ...registerForm,
                                                    firstName: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            نام خانوادگی
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="نام خانوادگی"
                                            value={registerForm.lastName}
                                            onChange={(e) =>
                                                setRegisterForm({
                                                    ...registerForm,
                                                    lastName: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        کد ملی
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        placeholder="۱۰ رقم بدون خط تیره"
                                        value={registerForm.nationalId}
                                        onChange={(e) =>
                                            setRegisterForm({
                                                ...registerForm,
                                                nationalId: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        تاریخ تولد
                                    </label>

                                    <DatePicker
                                        value={registerForm.birthDate}
                                        onChange={(date) =>
                                            setRegisterForm({
                                                ...registerForm,
                                                birthDate: date,
                                            })
                                        }
                                        locale="fa"
                                        inputtable={false}
                                        clearable
                                        placeholder="تاریخ تولد را انتخاب کنید"
                                        className="w-full"
                                    />

                                </div>


                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        شماره همراه
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={11}
                                        placeholder="۰۹۱۲..."
                                        value={registerForm.phoneNumber}
                                        onChange={(e) =>
                                            setRegisterForm({
                                                ...registerForm,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading
                                        ? 'در حال ثبت اطلاعات...'
                                        : 'ثبت نام و دریافت حساب'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* فوتر کوچک داخل کارت */}
                <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    سامانه مدیریت یکپارچه
                </div>
            </div>

            {/* دیالوگ (Modal) سفارشی با دکمه آبی رنگ متناسب با درخواست شما */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6  shadow-2xl border border-gray-100 dark:border-gray-700 text-center animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {dialogTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            {dialogMessage}
                        </p>
                        <button
                            onClick={() => setDialogOpen(false)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
                        >
                            متوجه شدم
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

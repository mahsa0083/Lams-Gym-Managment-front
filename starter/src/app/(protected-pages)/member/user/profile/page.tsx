'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Select from '@/components/ui/Select'
import ApiService from '@/services/client/ApiService'
import { getJwtUser } from '@/utils/auth'
import { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import {
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from 'react-icons/hi'

// غیرفعال کردن SSR برای دیت‌پیکر انتخاب تاریخ تولد
const DatePicker = dynamic(() => import('react-multi-date-picker'), {
    ssr: false,
})

export interface OptionType {
    value: number
    label: string
}

const genderOptions: OptionType[] = [
    { value: 0, label: 'مرد' },
    { value: 1, label: 'زن' },
]

export interface UserProfileDto {
    id: number
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
    gender: number
    birthDate: string
    joinDate?: string
}

export interface UpdateUserProfileDto {
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
    gender: number
    birthDate: string
}

// تابع کمکی برای پاکسازی و حذف بخش ساعت از تاریخ
const formatOnlyDate = (dateString?: string): string => {
    if (!dateString) return '1375/06/15'

    const cleanDate = dateString.split('T')[0]

    return cleanDate.replace(/-/g, '/')
}

export default function UserProfilePage() {
    const { data: session, status } = useSession()

    const [userData, setUserData] = useState<UserProfileDto | null>(null)

    const [formData, setFormData] =
        useState<UpdateUserProfileDto>({
            firstName: '',
            lastName: '',
            phoneNumber: '',
            nationalCode: '',
            gender: 0,
            birthDate: '1375/06/15',
        })

    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)

    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // دریافت اطلاعات پروفایل
    useEffect(() => {
        if (status === 'loading') return

        if (status !== 'authenticated') {
            setLoading(false)
            return
        }

        const accessToken = (session as any)?.accessToken

        if (!accessToken) {
            setLoading(false)

            setMessage({
                type: 'error',
                text: 'توکن دسترسی در Session پیدا نشد.',
            })

            return
        }

        let cancelled = false

        const fetchUserProfile = async () => {
            try {
                setLoading(true)
                setMessage(null)

                // گرفتن اطلاعات کاربر از JWT
                const jwtUser = getJwtUser(accessToken)

                if (!jwtUser.id) {
                    throw new Error(
                        'شناسه کاربر در JWT پیدا نشد.',
                    )
                }

                if (jwtUser.role === null) {
                    throw new Error(
                        'Role کاربر در JWT پیدا نشد.',
                    )
                }

                console.log('User ID:', jwtUser.id)
                console.log('User Role:', jwtUser.role)

                // ارسال ID و Role به API
                const response =
                    await ApiService.get<UserProfileDto>(
                        `/members/${jwtUser.id}?role=${jwtUser.role}`,
                    )

                if (cancelled) return

                if (!response) {
                    throw new Error(
                        'اطلاعات پروفایل دریافت نشد.',
                    )
                }

                setUserData(response)

                setFormData({
                    firstName: response.firstName ?? '',
                    lastName: response.lastName ?? '',
                    phoneNumber: response.phoneNumber ?? '',
                    nationalCode: response.nationalCode ?? '',
                    gender: response.gender ?? 0,
                    birthDate: formatOnlyDate(
                        response.birthDate,
                    ),
                })
            } catch (error) {
                if (cancelled) return

                console.error(
                    'Error fetching user profile:',
                    error,
                )

                setMessage({
                    type: 'error',
                    text:
                        error instanceof Error
                            ? error.message
                            : 'خطا در دریافت اطلاعات پروفایل.',
                })
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchUserProfile()

        return () => {
            cancelled = true
        }
    }, [status, (session as any)?.accessToken])

    // تغییر مقادیر Input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (message) {
            setMessage(null)
        }
    }

    // تغییر جنسیت
    const handleGenderChange = (
        selectedOption: OptionType | null,
    ) => {
        if (selectedOption) {
            setFormData((prev) => ({
                ...prev,
                gender: selectedOption.value,
            }))

            if (message) {
                setMessage(null)
            }
        }
    }

    // تغییر تاریخ تولد
    const handleDateChange = (
        date: DateObject | null,
    ) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                birthDate: date.format('YYYY/MM/DD'),
            }))

            if (message) {
                setMessage(null)
            }
        }
    }

    // ذخیره اطلاعات
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()

        if (!userData) return

        try {
            setSaving(true)
            setMessage(null)

            await ApiService.put(
                `/members/${userData.id}`,
                formData,
            )

            setUserData((prev) => {
                if (!prev) return null

                return {
                    ...prev,
                    ...formData,
                }
            })

            setMessage({
                type: 'success',
                text: 'اطلاعات پروفایل با موفقیت ویرایش شد.',
            })
        } catch (error) {
            console.error(
                'Error updating user profile:',
                error,
            )

            setMessage({
                type: 'error',
                text:
                    'خطا در ذخیره‌سازی اطلاعات. لطفاً دوباره تلاش کنید.',
            })
        } finally {
            setSaving(false)
        }
    }

    const currentGenderOption =
        genderOptions.find(
            (opt) => opt.value === formData.gender,
        ) ?? null

    // Loading
    if (loading || status === 'loading') {
        return (
            <div className="p-12 text-center text-gray-800 flex min-h-[500px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#E63946]" />

                    <p className="text-sm text-gray-500">
                        در حال دریافت اطلاعات پروفایل...
                    </p>
                </div>
            </div>
        )
    }

    // کاربر لاگین نیست
    if (status !== 'authenticated') {
        return (
            <div className="p-12 text-center text-gray-800 flex min-h-[500px] items-center justify-center dir-rtl">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-center shadow-sm">
                    <p className="font-medium text-rose-600">
                        برای مشاهده پروفایل ابتدا وارد حساب کاربری شوید.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-gray-50/50 min-h-screen text-gray-900 dir-rtl max-w-5xl mx-auto">

            {/* هدر صفحه */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">

                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0 shadow-2xs text-[#E63946]">
                        <HiOutlineUser className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>

                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <span>پروفایل کاربری</span>
                        </h1>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            مدیریت و ویرایش اطلاعات حساب کاربری و مشخصات شخصی
                        </p>
                    </div>

                </div>
            </div>

            {/* پیام وضعیت */}
            {message && (
                <div
                    className={`flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xs ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                >
                    {message.type === 'success' ? (
                        <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
                    ) : (
                        <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
                    )}

                    <span className="text-sm font-semibold">
                        {message.text}
                    </span>
                </div>
            )}

            {/* فرم اطلاعات پروفایل */}
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >

                    <div className="border-b border-gray-100 pb-5">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                            اطلاعات شخصی
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            لطفاً مشخصات خود را طبق مدارک شناسایی معتبر وارد کنید.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

                        {/* نام */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                                نام
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={saving}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                            />
                        </div>

                        {/* نام خانوادگی */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                                نام خانوادگی
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={saving}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                            />
                        </div>

                        {/* شماره تلفن */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                                شماره همراه
                            </label>

                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                disabled={saving}
                                dir="ltr"
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 text-right focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                            />
                        </div>

                        {/* کد ملی */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                                کد ملی
                            </label>

                            <input
                                type="text"
                                name="nationalCode"
                                value={formData.nationalCode}
                                onChange={handleChange}
                                required
                                maxLength={10}
                                disabled={saving}
                                dir="ltr"
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 text-right focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                            />
                        </div>

                        {/* جنسیت */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                                جنسیت
                            </label>

                            <Select<OptionType>
                                options={genderOptions}
                                value={currentGenderOption}
                                onChange={handleGenderChange}
                                placeholder="انتخاب جنسیت"
                            />
                        </div>

                        {/* تاریخ تولد */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2.5">
                                تاریخ تولد
                            </label>

                            <div className="relative">

                                <DatePicker
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    value={formData.birthDate}
                                    onChange={handleDateChange}
                                    format="YYYY/MM/DD"
                                    inputClass="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                                    containerStyle={{
                                        width: '100%',
                                    }}
                                />

                                <HiOutlineCalendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none z-10" />

                            </div>
                        </div>

                        {/* تاریخ عضویت */}
                        {userData?.joinDate && (
                            <div className="md:col-span-2">

                                <label className="block text-xs sm:text-sm font-bold text-gray-500 mb-2.5">
                                    تاریخ عضویت در سیستم
                                </label>

                                <input
                                    type="text"
                                    value={formatOnlyDate(
                                        userData.joinDate,
                                    )}
                                    disabled
                                    className="w-full bg-gray-100/60 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-500 cursor-not-allowed select-none"
                                />

                            </div>
                        )}

                    </div>

                    {/* دکمه ذخیره */}
                    <div className="flex justify-end pt-6 border-t border-gray-100">

                        <button
                            type="submit"
                            disabled={saving || !userData}
                            className="bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                    <span>
                                        در حال ذخیره...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <HiOutlineCheckCircle className="w-5 h-5" />

                                    <span>
                                        ذخیره تغییرات
                                    </span>
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    )
}
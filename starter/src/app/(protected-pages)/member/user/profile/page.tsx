'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Select from '@/components/ui/Select'
import ApiService from '@/services/client/ApiService'
import { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import {
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineIdentification,
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

const NAME_IDENTIFIER_CLAIM =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

function parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
        if (!token || typeof token !== 'string') return null
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const payloadPart = parts[1]
        if (!payloadPart) return null

        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
        const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
        const binaryString = atob(paddedBase64)
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
        const decoded = new TextDecoder().decode(bytes)

        return JSON.parse(decoded) as Record<string, unknown>
    } catch (error) {
        console.error('Failed to parse JWT payload:', error)
        return null
    }
}

// تابع کمکی برای پاکسازی و حذف بخش ساعت از تاریخ (تبدیل به فرمت YYYY/MM/DD)
const formatOnlyDate = (dateString?: string): string => {
    if (!dateString) return '1375/06/15'
    // اگر تاریخ شامل حرف T یا ساعت باشد (مثل فرمت ISO)، بخش زمان را جدا می‌کنیم
    const cleanDate = dateString.split('T')[0]
    return cleanDate.replace(/-/g, '/')
}

export default function UserProfilePage() {
    const { data: session, status } = useSession()

    const [userData, setUserData] = useState<UserProfileDto | null>(null)
    const [formData, setFormData] = useState<UpdateUserProfileDto>({
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

                const payload = parseJwtPayload(accessToken)
                if (!payload) throw new Error('امکان Decode کردن JWT وجود ندارد.')

                const userIdValue = payload[NAME_IDENTIFIER_CLAIM]
                if (userIdValue === undefined || userIdValue === null) {
                    throw new Error('شناسه کاربر در JWT پیدا نشد.')
                }

                const userId = Number(userIdValue)
                if (!Number.isInteger(userId) || userId <= 0) {
                    throw new Error('شناسه کاربر در JWT معتبر نیست.')
                }

                const response = await ApiService.get<UserProfileDto>(
                    `/members/${userId}`,
                )

                if (cancelled) return
                if (!response) throw new Error('اطلاعات پروفایل دریافت نشد.')

                setUserData(response)
                setFormData({
                    firstName: response.firstName ?? '',
                    lastName: response.lastName ?? '',
                    phoneNumber: response.phoneNumber ?? '',
                    nationalCode: response.nationalCode ?? '',
                    gender: response.gender ?? 0,
                    birthDate: formatOnlyDate(response.birthDate),
                })
            } catch (error) {
                if (cancelled) return
                console.error('Error fetching user profile:', error)
                setMessage({
                    type: 'error',
                    text: error instanceof Error ? error.message : 'خطا در دریافت اطلاعات پروفایل.',
                })
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchUserProfile()

        return () => {
            cancelled = true
        }
    }, [status, (session as any)?.accessToken])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (message) setMessage(null)
    }

    const handleGenderChange = (selectedOption: OptionType | null) => {
        if (selectedOption) {
            setFormData((prev) => ({ ...prev, gender: selectedOption.value }))
        }
    }

    const handleDateChange = (date: DateObject | null) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                birthDate: date.format('YYYY/MM/DD'),
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!userData) return

        try {
            setSaving(true)
            setMessage(null)

            await ApiService.put(`/members/${userData.id}`, formData)

            setUserData((prev) => {
                if (!prev) return null
                return { ...prev, ...formData }
            })

            setMessage({
                type: 'success',
                text: 'اطلاعات پروفایل با موفقیت ویرایش شد.',
            })
        } catch (error) {
            console.error('Error updating user profile:', error)
            setMessage({
                type: 'error',
                text: 'خطا در ذخیره‌سازی اطلاعات. لطفاً دوباره تلاش کنید.',
            })
        } finally {
            setSaving(false)
        }
    }

    const currentGenderOption = genderOptions.find(
        (opt) => opt.value === formData.gender,
    )

    if (loading || status === 'loading') {
        return (
            <div className="p-12 text-center text-[#1D3557] flex min-h-[500px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#E63946]" />
                    <p className="text-sm text-[#457B9D]">در حال دریافت اطلاعات پروفایل...</p>
                </div>
            </div>
        )
    }

    if (status !== 'authenticated') {
        return (
            <div className="p-12 text-center text-[#1D3557] flex min-h-[500px] items-center justify-center dir-rtl">
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
                    <p className="font-medium text-red-600">
                        برای مشاهده پروفایل ابتدا وارد حساب کاربری شوید.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl max-w-4xl mx-auto">
            {/* هدر صفحه */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#457B9D] shrink-0 shadow-sm">
                    <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                        alt="تصویر کاربر"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
                        <HiOutlineUser className="w-6 h-6 text-[#457B9D]" />
                        <span>پروفایل کاربری</span>
                    </h1>
                    <p className="text-sm text-[#457B9D] mt-1">
                        مدیریت و ویرایش اطلاعات حساب کاربری
                    </p>
                </div>
            </div>

            {/* پیام وضعیت */}
            {message && (
                <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
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
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {/* فرم اطلاعات پروفایل */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#A8DADC] shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b border-[#A8DADC]/60 pb-4">
                        <h2 className="text-lg font-bold text-[#1D3557]">اطلاعات شخصی</h2>
                        <p className="text-xs text-[#457B9D] mt-1">
                            لطفاً مشخصات خود را طبق مدارک شناسایی وارد کنید.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* نام */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">نام</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={saving}
                                className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D]"
                            />
                        </div>

                        {/* نام خانوادگی */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">نام خانوادگی</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={saving}
                                className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D]"
                            />
                        </div>

                        {/* شماره تلفن */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">شماره همراه</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                disabled={saving}
                                dir="ltr"
                                className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-4 py-2.5 text-sm text-[#1D3557] text-right focus:outline-none focus:border-[#457B9D]"
                            />
                        </div>

                        {/* کد ملی */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">کد ملی</label>
                            <input
                                type="text"
                                name="nationalCode"
                                value={formData.nationalCode}
                                onChange={handleChange}
                                required
                                maxLength={10}
                                disabled={saving}
                                dir="ltr"
                                className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-4 py-2.5 text-sm text-[#1D3557] text-right focus:outline-none focus:border-[#457B9D]"
                            />
                        </div>

                        {/* جنسیت */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">جنسیت</label>
                            <Select<OptionType>
                                options={genderOptions}
                                value={currentGenderOption}
                                onChange={handleGenderChange}
                                placeholder="انتخاب جنسیت"
                            />
                        </div>

                        {/* تاریخ تولد (بدون ساعت) */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">تاریخ تولد</label>
                            <div className="relative">
                                <DatePicker
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    value={formData.birthDate}
                                    onChange={handleDateChange}
                                    format="YYYY/MM/DD"
                                    inputClass="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D]"
                                    containerStyle={{ width: '100%' }}
                                />
                                <HiOutlineCalendar className="absolute left-3 top-3 w-5 h-5 text-[#457B9D] pointer-events-none z-10" />
                            </div>
                        </div>

                        {/* تاریخ عضویت (نمایش صرفاً تاریخ بدون ساعت) */}
                        {userData?.joinDate && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-[#457B9D] mb-2">تاریخ عضویت در سیستم</label>
                                <input
                                    type="text"
                                    value={formatOnlyDate(userData.joinDate)}
                                    disabled
                                    className="w-full bg-[#A8DADC]/20 border border-[#A8DADC]/60 rounded-xl px-4 py-2.5 text-sm text-[#457B9D] cursor-not-allowed select-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* دکمه ذخیره تغییرات */}
                    <div className="flex justify-end pt-4 border-t border-[#A8DADC]/60">
                        <button
                            type="submit"
                            disabled={saving || !userData}
                            className="bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>در حال ذخیره...</span>
                                </>
                            ) : (
                                <>
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                    <span>ذخیره تغییرات</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Select from '@/components/ui/Select'
import { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import {
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineCalendar,
    HiOutlineCheck,
    HiOutlineLocationMarker,
    HiOutlineMail,
} from 'react-icons/hi'

// غیرفعال کردن SSR برای دیت‌پیکر جهت جلوگیری از خطای Hydration در Next.js
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
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
    gender: number
    birthDate: string
    joinDate: string
}

export default function UserProfilePage() {
    const [formData, setFormData] = useState<UserProfileDto>({
        firstName: 'الکس',
        lastName: 'رضایی',
        phoneNumber: '09123456789',
        nationalCode: '0012345678',
        gender: 0,
        birthDate: '1375/06/15',
        joinDate: '1402/02/10',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleGenderChange = (selectedOption: OptionType | null) => {
        if (selectedOption) {
            setFormData((prev) => ({
                ...prev,
                gender: selectedOption.value,
            }))
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        console.log('داده‌های ارسالی به بک‌اند:', formData)

        setTimeout(() => {
            setIsSubmitting(false)
            setSuccessMessage(true)
            setTimeout(() => setSuccessMessage(false), 3000)
        }, 800)
    }

    const currentGenderOption = genderOptions.find((opt) => opt.value === formData.gender)

    return (
        <div className="p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl">
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

            {/* فرم اطلاعات پروفایل */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#A8DADC] shadow-sm max-w-4xl mx-auto">
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
                            <div className="relative">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pr-10 pl-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] transition-all"
                                />
                                <HiOutlineUser className="absolute right-3 top-3 w-5 h-5 text-[#457B9D]" />
                            </div>
                        </div>

                        {/* نام خانوادگی */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">نام خانوادگی</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pr-10 pl-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] transition-all"
                                />
                                <HiOutlineUser className="absolute right-3 top-3 w-5 h-5 text-[#457B9D]" />
                            </div>
                        </div>

                        {/* شماره تلفن */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">شماره همراه</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    dir="ltr"
                                    className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1D3557] text-right focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] transition-all"
                                />
                                <HiOutlinePhone className="absolute left-3 top-3 w-5 h-5 text-[#457B9D]" />
                            </div>
                        </div>

                        {/* کد ملی */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">کد ملی</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="nationalCode"
                                    value={formData.nationalCode}
                                    onChange={handleChange}
                                    required
                                    maxLength={10}
                                    dir="ltr"
                                    className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1D3557] text-right focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] transition-all"
                                />
                                <HiOutlineIdentification className="absolute left-3 top-3 w-5 h-5 text-[#457B9D]" />
                            </div>
                        </div>

                        {/* جنسیت (با استفاده از کامپوننت اختصاصی Select پروژه) */}
                        <div>
                            <label className="block text-xs font-bold text-[#1D3557] mb-2">جنسیت</label>
                            <Select<OptionType>
                                options={genderOptions}
                                value={currentGenderOption}
                                onChange={handleGenderChange}
                                placeholder="انتخاب جنسیت"
                            />
                        </div>

                        {/* تاریخ تولد - Persian Date Picker */}
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
                                    inputClass="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pr-10 pl-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] transition-all"
                                    containerStyle={{ width: '100%' }}
                                />
                                <HiOutlineCalendar className="absolute right-3 top-3 w-5 h-5 text-[#457B9D] pointer-events-none z-10" />
                            </div>
                        </div>

                        {/* تاریخ عضویت (غیرقابل ویرایش) */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-[#457B9D] mb-2">تاریخ عضویت در سیستم</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.joinDate}
                                    disabled
                                    className="w-full bg-[#A8DADC]/20 border border-[#A8DADC]/60 rounded-xl pr-10 pl-4 py-2.5 text-sm text-[#457B9D] cursor-not-allowed select-none"
                                />
                                <HiOutlineCalendar className="absolute right-3 top-3 w-5 h-5 text-[#457B9D]" />
                            </div>
                        </div>
                    </div>

                    {/* پیام موفقیت */}
                    {successMessage && (
                        <div className="flex items-center gap-2 p-3.5 bg-[#A8DADC]/30 border border-[#A8DADC] text-[#1D3557] rounded-xl text-xs font-bold transition-all">
                            <HiOutlineCheck className="w-5 h-5 text-[#E63946] shrink-0" />
                            <span>تغییرات با موفقیت ذخیره شد.</span>
                        </div>
                    )}

                    {/* دکمه ذخیره تغییرات */}
                    <div className="flex justify-end pt-4 border-t border-[#A8DADC]/60">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#E63946] hover:bg-[#E63946]/90 active:scale-[0.98] text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
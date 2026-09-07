'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ApiService from '@/services/client/ApiService'
import {
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineCheckCircle,
} from 'react-icons/hi'

interface AdminDto {
    id: number
    firstName: string
    lastName: string
    nationalCode: string
    phoneNumber: string
}

interface UpdateAdminDto {
    firstName: string
    lastName: string
    phoneNumber: string
}

const NAME_IDENTIFIER_CLAIM =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

function parseJwtPayload(
    token: string,
): Record<string, unknown> | null {
    try {
        if (!token || typeof token !== 'string') {
            return null
        }

        const parts = token.split('.')

        if (parts.length !== 3) {
            return null
        }

        const payloadPart = parts[1]

        if (!payloadPart) {
            return null
        }

        const base64 = payloadPart
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const paddedBase64 =
            base64 +
            '='.repeat(
                (4 - (base64.length % 4)) % 4,
            )

        const binaryString = atob(paddedBase64)

        const bytes = Uint8Array.from(
            binaryString,
            (char) => char.charCodeAt(0),
        )

        const decoded = new TextDecoder().decode(bytes)

        return JSON.parse(decoded) as Record<
            string,
            unknown
        >
    } catch (error) {
        console.error(
            'Failed to parse JWT payload:',
            error,
        )

        return null
    }
}

export default function AdminProfilePage() {
    const { data: session, status } = useSession()

    const [adminData, setAdminData] =
        useState<AdminDto | null>(null)

    const [formData, setFormData] =
        useState<UpdateAdminDto>({
            firstName: '',
            lastName: '',
            phoneNumber: '',
        })

    const [loading, setLoading] =
        useState<boolean>(true)

    const [saving, setSaving] =
        useState<boolean>(false)

    const [message, setMessage] =
        useState<{
            type: 'success' | 'error'
            text: string
        } | null>(null)

    useEffect(() => {
    if (status === 'loading') {
        return
    }

    if (status !== 'authenticated') {
        setLoading(false)
        return
    }

    const accessToken = session?.accessToken

    if (!accessToken) {
        setLoading(false)
        setMessage({
            type: 'error',
            text: 'Access Token در Session پیدا نشد.',
        })
        return
    }

    let cancelled = false

    const fetchAdminProfile = async () => {
        try {
            setLoading(true)
            setMessage(null)

            // Decode JWT
            const payload = parseJwtPayload(accessToken)

            if (!payload) {
                throw new Error(
                    'امکان Decode کردن JWT وجود ندارد.',
                )
            }

            const adminIdValue =
                payload[NAME_IDENTIFIER_CLAIM]

            if (
                adminIdValue === undefined ||
                adminIdValue === null
            ) {
                throw new Error(
                    'شناسه ادمین در JWT پیدا نشد.',
                )
            }

            const adminId = Number(adminIdValue)

            if (
                !Number.isInteger(adminId) ||
                adminId <= 0
            ) {
                throw new Error(
                    'شناسه ادمین در JWT معتبر نیست.',
                )
            }

            console.log('Admin ID:', adminId)

            // گرفتن اطلاعات ادمین
            const response =
                await ApiService.get<AdminDto>(
                    `/admins/${adminId}`,
                )

            if (cancelled) {
                return
            }

            if (!response) {
                throw new Error(
                    'اطلاعات پروفایل دریافت نشد.',
                )
            }

            console.log(
                'Admin Profile:',
                response,
            )

            setAdminData(response)

            setFormData({
                firstName:
                    response.firstName ?? '',
                lastName:
                    response.lastName ?? '',
                phoneNumber:
                    response.phoneNumber ?? '',
            })
        } catch (error) {
            if (cancelled) {
                return
            }

            console.error(
                'Error fetching admin profile:',
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

    fetchAdminProfile()

    return () => {
        cancelled = true
    }
}, [status, session?.accessToken])

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

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()

        if (!adminData) {
            return
        }

        try {
            setSaving(true)
            setMessage(null)

            await ApiService.put(
                `/admins/${adminData.id}`,
                formData,
            )

            setAdminData((prev) => {
                if (!prev) {
                    return null
                }

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
                'Error updating admin profile:',
                error,
            )

            setMessage({
                type: 'error',
                text: 'خطا در ذخیره‌سازی اطلاعات. لطفاً دوباره تلاش کنید.',
            })
        } finally {
            setSaving(false)
        }
    }

    // --------------------------------
    // Loading
    // --------------------------------

    if (loading || status === 'loading') {
        return (
            <div
                dir="rtl"
                className="flex min-h-[500px] items-center justify-center"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="text-sm text-gray-500">
                        در حال دریافت اطلاعات پروفایل...
                    </p>
                </div>
            </div>
        )
    }

    // --------------------------------
    // Not authenticated
    // --------------------------------

    if (status !== 'authenticated') {
        return (
            <div
                dir="rtl"
                className="flex min-h-[500px] items-center justify-center"
            >
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
                    <p className="font-medium text-red-600">
                        برای مشاهده پروفایل ابتدا وارد حساب کاربری شوید.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            dir="rtl"
            className="w-full p-4 md:p-6"
        >
            <div className="mx-auto max-w-4xl">
                {/* -------------------------------- */}
                {/* Header */}
                {/* -------------------------------- */}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        پروفایل ادمین
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        اطلاعات حساب کاربری خود را مشاهده و ویرایش کنید.
                    </p>
                </div>

                {/* -------------------------------- */}
                {/* Message */}
                {/* -------------------------------- */}

                {message && (
                    <div
                        className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                            message.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                    >
                        {message.type ===
                            'success' && (
                            <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
                        )}

                        <span className="text-sm font-medium">
                            {message.text}
                        </span>
                    </div>
                )}

                {/* -------------------------------- */}
                {/* Profile Card */}
                {/* -------------------------------- */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* Profile Header */}

                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <HiOutlineUser className="h-8 w-8 text-blue-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {adminData
                                        ? `${adminData.firstName} ${adminData.lastName}`
                                        : 'ادمین'}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    مدیر سیستم
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="p-6"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* First Name */}

                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    نام
                                </label>

                                <div className="relative">
                                    <HiOutlineUser className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={
                                            formData.firstName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                        placeholder="نام خود را وارد کنید"
                                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-10 pl-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    نام خانوادگی
                                </label>

                                <div className="relative">
                                    <HiOutlineUser className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={
                                            formData.lastName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                        placeholder="نام خانوادگی خود را وارد کنید"
                                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-10 pl-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>

                            {/* National Code */}

                            <div>
                                <label
                                    htmlFor="nationalCode"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    کد ملی
                                </label>

                                <div className="relative">
                                    <HiOutlineIdentification className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="nationalCode"
                                        type="text"
                                        value={
                                            adminData?.nationalCode ??
                                            ''
                                        }
                                        disabled
                                        className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pr-10 pl-4 text-sm text-gray-500 outline-none"
                                    />
                                </div>

                                <p className="mt-1.5 text-xs text-gray-400">
                                    کد ملی قابل ویرایش نیست.
                                </p>
                            </div>

                            {/* Phone Number */}

                            <div>
                                <label
                                    htmlFor="phoneNumber"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    شماره موبایل
                                </label>

                                <div className="relative">
                                    <HiOutlinePhone className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={
                                            formData.phoneNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                        placeholder="شماره موبایل خود را وارد کنید"
                                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-10 pl-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* -------------------------------- */}
                        {/* Admin ID */}
                        {/* -------------------------------- */}

                        {adminData && (
                            <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        شناسه ادمین
                                    </span>

                                    <span className="font-mono text-sm font-semibold text-gray-700">
                                        {adminData.id}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* -------------------------------- */}
                        {/* Submit */}
                        {/* -------------------------------- */}

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    !adminData
                                }
                                className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineCheckCircle className="h-5 w-5" />

                                        ذخیره تغییرات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
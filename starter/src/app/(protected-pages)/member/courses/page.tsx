'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import { useCourseStore } from '@/store/useCourseStore'
import ApiService from '@/services/client/ApiService'
import {
    HiOutlineAcademicCap,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineCurrencyDollar,
    HiOutlineClipboardList,
} from 'react-icons/hi'

export interface OptionType {
    value: string
    label: string
}

// این دقیقاً همون ActivePackageDto سمت بک‌اند است (GET /api/packages).
// توجه: این DTO فیلد رشته‌ی ورزشی (sportName) یا زمان‌بندی کلاس‌ها را ندارد؛
// آن‌ها فقط بعد از انتخاب پکیج و در صفحه‌ی رزرو (از طریق
// GET /api/gym-classes/{packageId}/classes) در دسترس‌اند.
export interface PackageDto {
    id: number
    title: string
    trainerName: string
    durationDays: number
    totalSessions: number
    price: number
}

function formatPrice(price?: number): string {
    if (price === undefined || price === null) return 'تعیین نشده'
    return `${Number(price).toLocaleString('fa-IR')} تومان`
}

export default function GymCoursesListPage() {
    const router = useRouter()
    const setSelectedCourse = useCourseStore((state) => state.setSelectedCourse)

    const [packages, setPackages] = useState<PackageDto[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [expandedPackageId, setExpandedPackageId] = useState<number | null>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [searchOptions, setSearchOptions] = useState<OptionType[]>([])
    const [isPending, startTransition] = useTransition()

    // دریافت لیست پکیج‌های فعال (شامل قیمت واقعی هر پکیج، بدون نیاز به فچ جداگانه)
    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true)
            try {
                const data = await ApiService.get<PackageDto[]>('/packages')
                if (data && Array.isArray(data)) {
                    setPackages(data)
                } else {
                    setPackages([])
                }
            } catch (err) {
                console.error('خطا در دریافت لیست پکیج‌ها:', err)
                setPackages([])
            } finally {
                setLoading(false)
            }
        }
        fetchPackages()
    }, [])

    const handleSearchInputChange = (value: string) => {
        const trimmed = value.trim().toLowerCase()
        setSearchQuery(value)

        if (!trimmed) {
            setSearchOptions([])
            return
        }

        startTransition(() => {
            const matches = packages
                .filter((p) => p.title?.toLowerCase().includes(trimmed))
                .map((p) => ({
                    value: p.title,
                    label: p.title,
                }))
            setSearchOptions(matches)
        })
    }

    const toggleExpand = (id: number) => {
        setExpandedPackageId((prevId) => (prevId === id ? null : id))
    }

    const handleReserveClick = (pkg: PackageDto) => {
        // pkg.id همان packageId واقعی است — دقیقاً همانی که صفحه‌ی رزرو
        // برای /api/packages/{id} و /api/gym-classes/{packageId}/classes نیاز دارد.
        setSelectedCourse(pkg as any)
        router.push('/member/courses/reserve')
    }

    const filteredPackages = packages.filter((pkg) => {
        const matchesSearch =
            !searchQuery ||
            pkg.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())

        return matchesSearch
    })

    const defaultCourseImage =
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600'

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-gray-50/50 min-h-screen text-gray-900 dir-rtl max-w-5xl mx-auto">
            {/* هدر صفحه */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">پکیج‌های تمرینی باشگاه</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        یک پکیج را انتخاب کنید؛ سانس و زمان‌بندی دقیق را در مرحله‌ی بعد مشخص می‌کنید
                    </p>
                </div>

                <div className="w-full sm:w-72">
                    <Select<OptionType>
                        isSearchable
                        isLoading={isPending}
                        placeholder="جستجوی نام پکیج..."
                        noOptionsMessage={() => (isPending ? 'در حال جستجو...' : 'پکیجی یافت نشد')}
                        options={searchOptions}
                        onInputChange={handleSearchInputChange}
                        onChange={(opt) => setSearchQuery(opt?.value || '')}
                    />
                </div>
            </div>

            {/* لیست کارت‌ها */}
            <div className="space-y-6">
                {loading ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm space-y-3">
                        <p className="text-gray-500 text-sm font-medium">در حال دریافت اطلاعات پکیج‌ها...</p>
                    </div>
                ) : filteredPackages.length > 0 ? (
                    filteredPackages.map((pkg) => {
                        const isExpanded = expandedPackageId === pkg.id

                        return (
                            <div
                                key={pkg.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* تصویر پکیج */}
                                    <div className="relative w-full md:w-1/3 h-52 md:h-auto min-h-[200px] shrink-0 overflow-hidden bg-gray-100">
                                        <Image
                                            src={defaultCourseImage}
                                            alt={pkg.title || 'تصویر پکیج'}
                                            fill
                                            unoptimized
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-xs">
                                            <HiOutlineClipboardList className="w-3.5 h-3.5 text-gray-300" />
                                            <span>{pkg.totalSessions} جلسه</span>
                                        </div>
                                    </div>

                                    {/* اطلاعات اصلی */}
                                    <div className="p-6 sm:p-8 md:w-2/3 flex flex-col justify-between space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                                    {pkg.title}
                                                </h2>
                                                <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs sm:text-sm bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-100">
                                                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                                                    <span>{formatPrice(pkg.price)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <HiOutlineUser className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate">مربی: {pkg.trainerName || 'تعیین نشده'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <HiOutlineCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate">مدت اعتبار: {pkg.durationDays} روز</span>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <HiOutlineClipboardList className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate">تعداد جلسات: {pkg.totalSessions}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(pkg.id)}
                                                className="w-full sm:w-auto text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-5 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border border-gray-200 cursor-pointer"
                                            >
                                                <span>{isExpanded ? 'بستن جزئیات' : 'جزئیات بیشتر'}</span>
                                                {isExpanded ? (
                                                    <HiOutlineChevronUp className="w-4 h-4 text-rose-600" />
                                                ) : (
                                                    <HiOutlineChevronDown className="w-4 h-4" />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleReserveClick(pkg)}
                                                className="w-full sm:w-auto text-xs font-bold px-7 py-3 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white"
                                            >
                                                <HiOutlineAcademicCap className="w-4 h-4" />
                                                <span>انتخاب سانس و رزرو</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* جزئیات بازشونده */}
                                {isExpanded && (
                                    <div className="p-6 bg-gray-50/60 border-t border-gray-100 transition-all duration-300 space-y-3">
                                        <p className="text-xs text-gray-500">
                                            سانس‌ها و زمان‌بندی دقیق کلاس‌های این پکیج، پس از انتخاب و در مرحله‌ی
                                            بعد به شما نمایش داده می‌شود.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm space-y-3">
                        <p className="text-gray-900 font-bold text-sm">پکیجی با این مشخصات یافت نشد.</p>
                        <p className="text-xs text-gray-500">لطفاً عبارت جستجو را تغییر دهید.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

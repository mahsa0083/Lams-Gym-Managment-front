'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import { useCourseStore } from '@/store/useCourseStore'
import ApiService from '@/services/client/ApiService'
import {
    HiOutlineAcademicCap,
    HiOutlineClock,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineTag,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineLightningBolt,
    HiOutlineExclamation,
    HiOutlineX,
    HiOutlineCurrencyDollar,
} from 'react-icons/hi'

export interface OptionType {
    value: string
    label: string
}

export interface GymClassScheduleDto {
    id?: number
    dayOfWeek: string
    startTime: string
    endTime: string
}

export interface GymClassDto {
    id: number
    title: string
    groupName: string
    trainerName: string
    sportName: string
    capacity: number
    remainingCapacity: number
    startDate: string
    isActive?: boolean
    packageId?: number
    price?: number | string
    schedules: GymClassScheduleDto[]
}

export interface SportDto {
    id: number
    name: string
    description?: string
}

export interface PackagePurchaseDto {
    id: number
    title: string
    price: number
    durationDays?: number
    totalSessions?: number
}

// تابع تبدیل روزهای هفته از انگلیسی به فارسی
function formatDayOfWeek(day: string): string {
    if (!day) return ''
    const daysMap: Record<string, string> = {
        saturday: 'شنبه',
        sunday: 'یکشنبه',
        monday: 'دوشنبه',
        tuesday: 'سه‌شنبه',
        wednesday: 'چهارشنبه',
        thursday: 'پنج‌شنبه',
        friday: 'جمعه',
    }
    return daysMap[day.trim().toLowerCase()] || day
}

export default function GymCoursesListPage() {
    const router = useRouter()
    const setSelectedCourse = useCourseStore((state) => state.setSelectedCourse)

    const [courses, setCourses] = useState<GymClassDto[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [filterOptions, setFilterOptions] = useState<OptionType[]>([
        { value: 'all', label: 'همه رشته‌های ورزشی' },
    ])
    const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(filterOptions[0])
    const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null)
    const [showFullModal, setShowFullModal] = useState(false)
    const [selectedFullCourseTitle, setSelectedFullCourseTitle] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [searchOptions, setSearchOptions] = useState<OptionType[]>([])
    const [isPending, startTransition] = useTransition()

    // ۱. دریافت لیست رشته‌های ورزشی برای دراپ‌داون
    useEffect(() => {
        const fetchSports = async () => {
            try {
                const data = await ApiService.get<SportDto[]>('/sports')
                if (data && Array.isArray(data)) {
                    const opts: OptionType[] = [
                        { value: 'all', label: 'همه رشته‌های ورزشی' },
                        ...data.map((sport) => ({
                            value: sport.name,
                            label: sport.name,
                        })),
                    ]
                    setFilterOptions(opts)
                    setSelectedCategory(opts[0])
                }
            } catch (err) {
                console.error('خطا در دریافت لیست ورزش‌ها:', err)
            }
        }
        fetchSports()
    }, [])

    // ۲. دریافت لیست کلاس‌ها و استخراج قیمت پکیج‌ها
    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true)
            try {
                const data = await ApiService.get<GymClassDto[]>('/gym-classes')
                if (data && Array.isArray(data)) {
                    const updatedClasses = await Promise.all(
                        data.map(async (cls) => {
                            if (cls.packageId) {
                                try {
                                    const pkg = await ApiService.get<PackagePurchaseDto>(
                                        `/packages/purchase/${cls.packageId}`
                                    )
                                    return { ...cls, price: pkg?.price }
                                } catch {
                                    return cls
                                }
                            }
                            return cls
                        })
                    )
                    setCourses(updatedClasses)
                } else {
                    setCourses([])
                }
            } catch (err) {
                console.error('خطا در دریافت لیست کلاس‌ها:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchClasses()
    }, [])

    // مدیریت تغییرات اینپوت جستجو
    const handleSearchInputChange = (value: string) => {
        const trimmed = value.trim().toLowerCase()
        setSearchQuery(value)

        if (!trimmed) {
            setSearchOptions([])
            return
        }

        startTransition(() => {
            const matches = courses
                .filter((c) => c.title?.toLowerCase().includes(trimmed))
                .map((c) => ({
                    value: c.title,
                    label: c.title,
                }))
            setSearchOptions(matches)
        })
    }

    const toggleExpand = (id: number) => {
        setExpandedCourseId((prevId) => (prevId === id ? null : id))
    }

    const handleReserveClick = (course: GymClassDto) => {
        const isFull = course.remainingCapacity <= 0
        if (isFull) {
            setSelectedFullCourseTitle(course.title)
            setShowFullModal(true)
        } else {
            setSelectedCourse(course as any)
            router.push('/member/courses/reserve')
        }
    }

    // فیلتر دوره‌ها بر اساس دسته‌بندی و عبارت جستجو
    const filteredCourses = courses.filter((course) => {
        const matchesCategory =
            !selectedCategory ||
            selectedCategory.value === 'all' ||
            course.sportName === selectedCategory.value

        const matchesSearch =
            !searchQuery ||
            course.title?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            course.sportName?.toLowerCase().includes(searchQuery.toLowerCase().trim())

        return matchesCategory && matchesSearch
    })

    const defaultCourseImage =
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600'

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-gray-50/50 min-h-screen text-gray-900 dir-rtl max-w-5xl mx-auto">
            {/* مدال تکمیل ظرفیت */}
            {showFullModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3 text-rose-600">
                                <HiOutlineExclamation className="w-6 h-6 shrink-0" />
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">ظرفیت کلاس تکمیل است</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFullModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-xl transition-colors cursor-pointer"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            متأسفانه ظرفیت ثبت‌نام در کلاس{' '}
                            <strong className="text-rose-600 font-bold">{selectedFullCourseTitle}</strong> به پایان رسیده است و
                            امکان رزرو جدید وجود ندارد.
                        </p>

                        <div className="flex justify-end pt-3">
                            <button
                                type="button"
                                onClick={() => setShowFullModal(false)}
                                className="bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer"
                            >
                                متوجه شدم
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* هدر صفحه */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">کلاس‌ها و دوره‌های ورزشی</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        برنامه‌های تمرینی باشگاه را مشاهده کرده و برای رزرو کلاس اقدام کنید
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
                    <div className="w-full sm:w-60">
                        <Select<OptionType>
                            isSearchable
                            isLoading={isPending}
                            placeholder="جستجوی نام دوره..."
                            noOptionsMessage={() => (isPending ? 'در حال جستجو...' : 'دوره‌ای یافت نشد')}
                            options={searchOptions}
                            onInputChange={handleSearchInputChange}
                            onChange={(opt) => setSearchQuery(opt?.value || '')}
                        />
                    </div>

                    <div className="w-full sm:w-56">
                        <Select<OptionType>
                            options={filterOptions}
                            value={selectedCategory}
                            onChange={(option) => setSelectedCategory(option)}
                            placeholder="دسته‌بندی ورزشی"
                        />
                    </div>
                </div>
            </div>

            {/* لیست کارت‌ها */}
            <div className="space-y-6">
                {loading ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm space-y-3">
                        <p className="text-gray-500 text-sm font-medium">در حال دریافت اطلاعات کلاس‌ها...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                        const isExpanded = expandedCourseId === course.id
                        const isFull = course.remainingCapacity <= 0

                        // ساخت متن برنامه زمان‌بندی با تبدیل روزهای هفته به فارسی
                        const firstSchedule = course.schedules && course.schedules[0]
                        const scheduleText = firstSchedule
                            ? `${formatDayOfWeek(firstSchedule.dayOfWeek)} (${firstSchedule.startTime} الی ${firstSchedule.endTime})`
                            : 'برنامه زمانی تعیین‌نشده'

                        // فرمت قیمت پکیج
                        const formattedPrice = course.price
                            ? `${Number(course.price).toLocaleString('fa-IR')} تومان`
                            : ''

                        return (
                            <div
                                key={course.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* تصویر کلاس */}
                                    <div className="relative w-full md:w-1/3 h-52 md:h-auto min-h-[200px] shrink-0 overflow-hidden bg-gray-100">
                                        <Image
                                            src={defaultCourseImage}
                                            alt={course.title || 'تصویر کلاس'}
                                            fill
                                            unoptimized
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                        {isFull ? (
                                            <div className="absolute top-4 right-4 bg-rose-600 text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-xs">
                                                تکمیل ظرفیت
                                            </div>
                                        ) : (
                                            <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-xs">
                                                <HiOutlineTag className="w-3.5 h-3.5 text-gray-300" />
                                                <span>رشته: {course.sportName || 'عمومی'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* اطلاعات اصلی */}
                                    <div className="p-6 sm:p-8 md:w-2/3 flex flex-col justify-between space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                                    {course.title}
                                                </h2>
                                                {/* نمایش قیمت پکیج در کارت اصلی */}
                                                {formattedPrice && (
                                                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs sm:text-sm bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-100">
                                                        <HiOutlineCurrencyDollar className="w-4 h-4" />
                                                        <span>{formattedPrice}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl font-medium">
                                                    گروه: {course.groupName || 'عمومی'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* شبکه اطلاعات - ریسپانسو شده برای موبایل */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <HiOutlineUser className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate">مربی: {course.trainerName || 'تعیین نشده'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <HiOutlineClock className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate whitespace-nowrap">زمان: {scheduleText}</span>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <HiOutlineCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate">شروع: {course.startDate || 'تعیین نشده'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(course.id)}
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
                                                onClick={() => handleReserveClick(course)}
                                                className={`w-full sm:w-auto text-xs font-bold px-7 py-3 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                                                    isFull
                                                        ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                                                        : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white'
                                                }`}
                                            >
                                                <HiOutlineAcademicCap className="w-4 h-4" />
                                                <span>{isFull ? 'تکمیل ظرفیت' : 'رزرو کلاس'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* جزئیات بازشونده */}
                                {isExpanded && (
                                    <div className="p-6 bg-gray-50/60 border-t border-gray-100 transition-all duration-300 space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                                                <HiOutlineLightningBolt className="w-5 h-5 text-rose-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-gray-400 block">رشته ورزشی:</span>
                                                    <span className="font-bold text-gray-900 truncate block mt-0.5">
                                                        {course.sportName || 'عمومی'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                                                <HiOutlineUser className="w-5 h-5 text-gray-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-gray-400 block">ظرفیت باقی‌مانده:</span>
                                                    <span className="font-bold text-gray-900 truncate block mt-0.5">
                                                        {course.remainingCapacity} نفر از {course.capacity} نفر
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                                                <HiOutlineCurrencyDollar className="w-5 h-5 text-rose-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-gray-400 block">قیمت پکیج:</span>
                                                    <span className="font-bold text-gray-900 truncate block mt-0.5">
                                                        {formattedPrice || 'تعیین نشده'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* برنامه کامل روزها و ساعات با روزهای فارسی */}
                                        {course.schedules && course.schedules.length > 0 && (
                                            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                                                <h4 className="text-xs font-bold text-gray-900">برنامه روزها و ساعت برگزاری:</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700">
                                                    {course.schedules.map((sch, idx) => (
                                                        <div key={idx} className="flex items-center gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                            <HiOutlineClock className="w-4 h-4 text-gray-400 shrink-0" />
                                                            <span className="whitespace-nowrap font-medium">
                                                                {formatDayOfWeek(sch.dayOfWeek)}: {sch.startTime} تا {sch.endTime}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm space-y-3">
                        <p className="text-gray-900 font-bold text-sm">کلاس ورزشی با این مشخصات یافت نشد.</p>
                        <p className="text-xs text-gray-500">لطفاً عبارت جستجو یا دسته‌بندی ورزشی را تغییر دهید.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
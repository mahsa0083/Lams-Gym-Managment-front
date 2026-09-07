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
  HiOutlineLocationMarker,
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
          // دریافت قیمت پکیج برای هر کلاس در صورت وجود packageId
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
    <div className="p-4 sm:p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl">
      {/* مدال تکمیل ظرفیت */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#A8DADC] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#A8DADC]/40 pb-3">
              <div className="flex items-center gap-2 text-[#E63946]">
                <HiOutlineExclamation className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold">ظرفیت کلاس تکمیل است</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="text-[#457B9D] hover:text-[#1D3557] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#1D3557] leading-relaxed">
              متأسفانه ظرفیت ثبت‌نام در کلاس{' '}
              <strong className="text-[#E63946]">{selectedFullCourseTitle}</strong> به پایان رسیده است و
              امکان رزرو جدید وجود ندارد.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#A8DADC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557]">کلاس‌ها و دوره‌های ورزشی</h1>
          <p className="text-xs sm:text-sm text-[#457B9D] mt-1">
            برنامه‌های تمرینی باشگاه را مشاهده کرده و برای رزرو کلاس اقدام کنید
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
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
          <div className="bg-white p-12 rounded-2xl border border-[#A8DADC] text-center space-y-3">
            <p className="text-[#1D3557] font-bold text-xs">در حال دریافت اطلاعات کلاس‌ها...</p>
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
                className="bg-white rounded-2xl border border-[#A8DADC] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="flex flex-col md:flex-row">
                  {/* تصویر کلاس */}
                  <div className="relative w-full md:w-1/3 h-48 md:h-auto min-h-[180px] shrink-0 overflow-hidden bg-slate-100">
                    <Image
                      src={defaultCourseImage}
                      alt={course.title || 'تصویر کلاس'}
                      fill
                      unoptimized
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {isFull ? (
                      <div className="absolute top-3 right-3 bg-[#E63946] text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                        تکمیل ظرفیت
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-[#1D3557]/80 backdrop-blur-md text-[#F1FAEE] text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                        <HiOutlineTag className="w-3.5 h-3.5 text-[#A8DADC]" />
                        <span>رشته: {course.sportName || 'عمومی'}</span>
                      </div>
                    )}
                  </div>

                  {/* اطلاعات اصلی */}
                  <div className="p-4 sm:p-6 md:w-2/3 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-[#1D3557]">
                          {course.title}
                        </h2>
                        {/* نمایش قیمت پکیج در کارت اصلی */}
                        <div className="flex items-center gap-1 text-[#E63946] font-bold text-xs sm:text-sm bg-[#E63946]/10 px-3 py-1 rounded-xl">
                          <HiOutlineCurrencyDollar className="w-4 h-4" />
                          <span>{formattedPrice}</span>
                        </div>
                      </div>

                      <div className="text-xs text-[#457B9D] flex items-center gap-2">
                        <span className="bg-[#A8DADC]/30 text-[#1D3557] px-2.5 py-1 rounded-lg font-semibold">
                          گروه: {course.groupName || 'عمومی'}
                        </span>
                      </div>
                    </div>

                    {/* شبکه اطلاعات - ریسپانسو شده برای موبایل */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#A8DADC]/40 text-xs text-[#1D3557]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <HiOutlineUser className="w-4 h-4 text-[#457B9D] shrink-0" />
                        <span className="truncate">مربی: {course.trainerName || 'تعیین نشده'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <HiOutlineClock className="w-4 h-4 text-[#457B9D] shrink-0" />
                        <span className="truncate whitespace-nowrap">زمان: {scheduleText}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <HiOutlineCalendar className="w-4 h-4 text-[#457B9D] shrink-0" />
                        <span className="truncate">شروع: {course.startDate || 'تعیین نشده'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(course.id)}
                        className="w-full sm:w-auto text-xs font-bold text-[#457B9D] hover:text-[#1D3557] bg-[#F1FAEE] hover:bg-[#A8DADC]/30 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#A8DADC] cursor-pointer"
                      >
                        <span>{isExpanded ? 'بستن جزئیات' : 'جزئیات بیشتر'}</span>
                        {isExpanded ? (
                          <HiOutlineChevronUp className="w-4 h-4 text-[#E63946]" />
                        ) : (
                          <HiOutlineChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReserveClick(course)}
                        className={`w-full sm:w-auto text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                          isFull
                            ? 'bg-gray-300 text-gray-600 hover:bg-gray-400/80'
                            : 'bg-[#E63946] hover:bg-[#E63946]/90 active:scale-[0.98] text-white'
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
                  <div className="p-4 sm:p-6 bg-[#F1FAEE]/60 border-t border-[#A8DADC]/60 transition-all duration-300 space-y-4 max-h-96 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <HiOutlineLightningBolt className="w-5 h-5 text-[#E63946] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[#457B9D] block">رشته ورزشی:</span>
                          <span className="font-bold text-[#1D3557] truncate block">
                            {course.sportName || 'عمومی'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <HiOutlineUser className="w-5 h-5 text-[#457B9D] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[#457B9D] block">ظرفیت باقی‌مانده:</span>
                          <span className="font-bold text-[#1D3557] truncate block">
                            {course.remainingCapacity} نفر از {course.capacity} نفر
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <HiOutlineCurrencyDollar className="w-5 h-5 text-[#E63946] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[#457B9D] block">قیمت پکیج:</span>
                          <span className="font-bold text-[#1D3557] truncate block">
                            {formattedPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* برنامه کامل روزها و ساعات با روزهای فارسی */}
                    {course.schedules && course.schedules.length > 0 && (
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-[#A8DADC]/40">
                        <h4 className="text-xs font-bold text-[#1D3557]">برنامه روزها و ساعت برگزاری:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1D3557]">
                          {course.schedules.map((sch, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#F1FAEE] p-2 rounded-lg">
                              <HiOutlineClock className="w-4 h-4 text-[#457B9D] shrink-0" />
                              <span className="whitespace-nowrap">
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
          <div className="bg-white p-12 rounded-2xl border border-[#A8DADC] text-center space-y-3">
            <p className="text-[#1D3557] font-bold">کلاس ورزشی با این مشخصات یافت نشد.</p>
            <p className="text-xs text-[#457B9D]">لطفاً عبارت جستجو یا دسته‌بندی ورزشی را تغییر دهید.</p>
          </div>
        )}
      </div>
    </div>
  )
}
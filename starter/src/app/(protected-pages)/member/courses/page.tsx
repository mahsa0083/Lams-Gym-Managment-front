'use client'

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import { useCourseStore, Course } from '@/store/useCourseStore'
import {
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineFire,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineLocationMarker,
  HiOutlineExclamation,
  HiOutlineX,
} from 'react-icons/hi'

export interface OptionType {
  value: string
  label: string
}

const allGymCourses: Course[] = [
  {
    id: 1,
    title: 'دوره تخصصی بدنسازی و فرم‌دهی بدنی',
    description: 'تمرینات تخصصی هایپرتروفی، افزایش حجم عضلانی و کاهش چربی زیر نظر مربی با برنامه غذایی و مکمل‌های ورزشی.',
    instructor: 'استاد علی رضایی',
    duration: '۳ روز در هفته (۱۲ جلسه)',
    startDate: '۱۴۰۳/۰۶/۰۱',
    price: '۲,۵۰۰,۰۰۰ تومان',
    category: 'bodybuilding',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
    level: 'متوسط تا پیشرفته',
    capacity: '۱۵ نفر (۵ ظرفیت خالی)',
    isFull: false,
    location: 'سالن اصلی - سالن وزنه',
    features: [
      'ارائه برنامه غذایی تخصصی همراه دوره',
      'آنالیز ترکیب بدنی (InBody) در ابتدا و انتهای دوره',
      'پشتیبانی آنلاین و پاسخگویی به سوالات تغذیه‌ای',
    ],
    prerequisites: 'داشتن حداقل ۳ ماه سابقه تمرینات پایه بدنسازی',
  },
  {
    id: 2,
    title: 'کلاس چربی‌سوزی حرفه‌ای فیتنس و کراس‌فیت',
    description: 'تمرینات پرشدت اینتروال (HIIT) برای افزایش استقامت قلبی-عروقی، چربی‌سوزی سریع و تقویت عضلات کور بدن.',
    instructor: 'مربی سارا علوی',
    duration: '۴ روز در هفته (۱۶ جلسه)',
    startDate: '۱۴۰۳/۰۶/۰۵',
    price: '۲,۸۰۰,۰۰۰ تومان',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    level: 'همه سطح‌ها',
    capacity: 'تکمیل ظرفیت',
    isFull: true,
    location: 'سالن فیتنس و هوازی',
    features: [
      'تمرینات چربی‌سوزی هوازی و قدرتی گروهی',
      'بهبود سرعت، چابکی و توان قلبی عروقی',
      'استفاده از تجهیزات مدرن کراس‌فیت',
    ],
    prerequisites: 'بدون نیاز به پیش‌زمینه، مناسب برای شروع چربی‌سوزی',
  },
  {
    id: 3,
    title: 'دوره آرامش و انعطاف‌پذیری یوگا و مدیتیشن',
    description: 'تمرینات تنفسی، بهبود وضعیت قامت و ستون فقرات، کاهش استرس و افزایش انعطاف‌پذیری عضلات و مفاصل.',
    instructor: 'استاد مریم امیری',
    duration: '۲ روز در هفته (۸ جلسه)',
    startDate: '۱۴۰۳/۰۶/۱۰',
    price: '۱,۹۰۰,۰۰۰ تومان',
    category: 'yoga',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600',
    level: 'مبتدی تا متوسط',
    capacity: '۱۰ نفر (۲ ظرفیت خالی)',
    isFull: false,
    location: 'سالن یوگا و آرامش',
    features: [
      'تمرین‌های اصلاحی ستون فقرات و گودی کمر',
      'مدیتیشن و کنترل استرس روزمره',
      'محیط کاملاً آرام و استاندارد همراه با مت اختصاصی',
    ],
    prerequisites: 'مناسب برای تمامی رده‌های سنی',
  },
]

const filterOptions: OptionType[] = [
  { value: 'all', label: 'همه رشته‌های ورزشی' },
  { value: 'bodybuilding', label: 'بدنسازی و پرورشی' },
  { value: 'fitness', label: 'فیتنس و کراس‌فیت' },
  { value: 'yoga', label: 'یوگا و مدیتیشن' },
]

export default function GymCoursesListPage() {
  const router = useRouter()
  const setSelectedCourse = useCourseStore((state) => state.setSelectedCourse)

  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(filterOptions[0])
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null)
  const [showFullModal, setShowFullModal] = useState(false)
  const [selectedFullCourseTitle, setSelectedFullCourseTitle] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState<OptionType[]>([])
  const [isPending, startTransition] = useTransition()

  // مدیریت تایپ و تغییر در فیلد جستجو
  const handleSearchInputChange = (value: string) => {
    const trimmed = value.trim().toLowerCase()
    setSearchQuery(value)

    if (!trimmed) {
      setSearchOptions([])
      return
    }

    startTransition(() => {
      const matches = allGymCourses
        .filter((course) => course.title.toLowerCase().includes(trimmed))
        .map((course) => ({
          value: course.title,
          label: course.title,
        }))
      setSearchOptions(matches)
    })
  }

  const toggleExpand = (id: number) => {
    setExpandedCourseId((prevId) => (prevId === id ? null : id))
  }

  const handleReserveClick = (course: Course) => {
    if (course.isFull) {
      setSelectedFullCourseTitle(course.title)
      setShowFullModal(true)
    } else {
      setSelectedCourse(course)
      router.push('/member/courses/reserve')
    }
  }

  // فیلتر همزمان روی دسته‌بندی و متن جستجو
  const filteredCourses = allGymCourses.filter((course) => {
    const matchesCategory =
      !selectedCategory || selectedCategory.value === 'all' || course.category === selectedCategory.value
    const matchesSearch =
      !searchQuery || course.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl">
      {/* مدال تکمیل ظرفیت */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#A8DADC] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#A8DADC]/40 pb-3">
              <div className="flex items-center gap-2 text-[#E63946]">
                <HiOutlineExclamation className="w-6 h-6" />
                <h3 className="text-base font-bold">ظرفیت کلاس تکمیل است</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="text-[#457B9D] hover:text-[#1D3557] p-1 rounded-lg transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#1D3557] leading-relaxed">
              متأسفانه ظرفیت ثبت‌نام در کلاس <strong className="text-[#E63946]">{selectedFullCourseTitle}</strong> به پایان رسیده است و امکان رزرو جدید وجود ندارد.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E63946]/10 rounded-xl text-[#E63946]">
            {/* <HiOutlineFire className="w-8 h-8" /> */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1D3557]">کلاس‌ها و دوره‌های ورزشی</h1>
            <p className="text-sm text-[#457B9D] mt-1">
              برنامه‌های تمرینی باشگاه را مشاهده کرده و برای رزرو کلاس اقدام کنید
            </p>
          </div>
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
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[#A8DADC] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="flex flex-col md:flex-row min-h-[220px]">
                  {/* تصویر */}
                  <div className="relative w-full md:w-1/3 min-h-[200px] md:min-h-full shrink-0 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {course.isFull ? (
                      <div className="absolute top-3 right-3 bg-[#E63946] text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                        تکمیل ظرفیت
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-[#1D3557]/80 backdrop-blur-md text-[#F1FAEE] text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                        <HiOutlineTag className="w-3.5 h-3.5 text-[#A8DADC]" />
                        <span>{course.price}</span>
                      </div>
                    )}
                  </div>

                  {/* اطلاعات اصلی */}
                  <div className="p-6 md:w-2/3 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-[#1D3557] hover:text-[#457B9D] transition-colors cursor-pointer">
                        {course.title}
                      </h2>
                      <p className="text-xs md:text-sm text-[#457B9D] line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#A8DADC]/40 text-xs text-[#1D3557]">
                      <div className="flex items-center gap-1.5">
                        <HiOutlineUser className="w-4 h-4 text-[#457B9D] shrink-0" />
                        <span className="truncate">مربی: {course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HiOutlineClock className="w-4 h-4 text-[#457B9D] shrink-0" />
                        <span>زمان: {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HiOutlineCalendar className="w-4 h-4 text-[#457B9D] shrink-0" />
                        <span>شروع: {course.startDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(course.id)}
                        className="text-xs font-bold text-[#457B9D] hover:text-[#1D3557] bg-[#F1FAEE] hover:bg-[#A8DADC]/30 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-[#A8DADC]"
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
                        className={`text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                          course.isFull
                            ? 'bg-gray-300 text-gray-600 hover:bg-gray-400/80 cursor-pointer'
                            : 'bg-[#E63946] hover:bg-[#E63946]/90 active:scale-[0.98] text-white'
                        }`}
                      >
                        <HiOutlineAcademicCap className="w-4 h-4" />
                        <span>{course.isFull ? 'تکمیل ظرفیت' : 'رزرو کلاس'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* جزئیات بازشونده */}
                {isExpanded && (
                  <div className="p-6 bg-[#F1FAEE]/60 border-t border-[#A8DADC]/60 transition-all duration-300 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b border-[#A8DADC]/40 text-xs">
                      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <HiOutlineLightningBolt className="w-5 h-5 text-[#E63946]" />
                        <div>
                          <span className="text-[#457B9D] block">سطح برگزاری:</span>
                          <span className="font-bold text-[#1D3557]">{course.level}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <HiOutlineUser className="w-5 h-5 text-[#457B9D]" />
                        <div>
                          <span className="text-[#457B9D] block">ظرفیت کلاس:</span>
                          <span className="font-bold text-[#1D3557]">{course.capacity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <HiOutlineLocationMarker className="w-5 h-5 text-[#457B9D]" />
                        <div>
                          <span className="text-[#457B9D] block">محل برگزاری:</span>
                          <span className="font-bold text-[#1D3557]">{course.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#1D3557]">ویژگی‌های این دوره ورزشی:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {course.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#1D3557]">
                            <HiOutlineCheckCircle className="w-4 h-4 text-[#457B9D] shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-[#457B9D] bg-white p-3 rounded-xl border border-[#A8DADC]/40">
                      <strong className="text-[#1D3557]">پیش‌نیاز یا توضیحات تکمیلی: </strong>
                      {course.prerequisites}
                    </div>
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
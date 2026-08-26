'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCourseStore, Course } from '@/store/useCourseStore' // مسیر استور خود را چک کنید
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUserCircle,
  HiOutlineCreditCard,
  HiOutlineRefresh,
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi'

interface EnrolledCourse {
  id: number
  title: string
  instructor: string
  location: string
  days: string
  time: string
  startDate: string
  endDate: string
  pricePaid: string
  image: string
  isExpired: boolean
  remainingSessions: number
  description?: string
  duration?: string
  category?: string
  level?: string
  capacity?: string
  isFull?: boolean
  features?: string[]
  prerequisites?: string
}

// داده‌های نمونه دوره‌های ثبت‌نام‌شده کاربر
const myEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: 'دوره تخصصی بدنسازی و فرم‌دهی بدنی',
    instructor: 'استاد علی رضایی',
    location: 'سالن شماره ۱ (وزنه‌برداری)',
    days: 'روزهای زوج (شنبه، دوشنبه، چهارشنبه)',
    time: '۱۶:۰۰ الی ۱۷:۳۰',
    startDate: '۱۴۰۵/۰۵/۰۱',
    endDate: '۱۴۰۵/۰۶/۰۱',
    pricePaid: '۱,۲۰۰,۰۰۰ تومان',
    image: '/images/bodybuilding.jpg',
    isExpired: false,
    remainingSessions: 7,
    description: 'دوره جامع تمرینات هوازی و قدرت',
    duration: 'یک ماه (۱۲ جلسه)',
    category: 'بدنسازی',
    level: 'پیشرفته',
    capacity: '۲۰ نفر',
    isFull: false,
    features: ['برنامه غذایی', 'پشتیبانی حضوری'],
    prerequisites: 'ندارد',
  },
  {
    id: 2,
    title: 'دوره آرامش و انعطاف‌پذیری یوگا',
    instructor: 'استاد مریم امیری',
    location: 'سالن شماره ۳ (یوگا و پیلاتس)',
    days: 'روزهای فرد (یکشنبه، سه‌شنبه، پنج‌شنبه)',
    time: '۱۷:۰۰ الی ۱۸:۳۰',
    startDate: '۱۴۰۵/۰۴/۰۱',
    endDate: '۱۴۰۵/۰۵/۰۱',
    pricePaid: '۹۵0,۰۰۰ تومان',
    image: '/images/yoga.jpg',
    isExpired: true,
    remainingSessions: 0,
    description: 'دوره تمرینات تمرکز و انعطاف‌پذیری',
    duration: 'یک ماه (۱۲ جلسه)',
    category: 'یوگا',
    level: 'مقدماتی',
    capacity: '۱۵ نفر',
    isFull: false,
    features: ['زیرانداز رایگان'],
    prerequisites: 'ندارد',
  },
]

export default function MyCoursesPage() {
  const router = useRouter()
  const renewCourse = useCourseStore((state) => state.renewCourse)

  // تابع تبدیل داده ثبت‌نامی به تایپ Course استور و هدایت مستقیم به مرحله پرداخت
  const handleRenew = (enrolledCourse: EnrolledCourse) => {
    const courseToRenew: Course = {
      id: enrolledCourse.id,
      title: enrolledCourse.title,
      description: enrolledCourse.description || '',
      instructor: enrolledCourse.instructor,
      duration: enrolledCourse.duration || 'یک ماهه',
      startDate: enrolledCourse.startDate,
      price: enrolledCourse.pricePaid,
      category: enrolledCourse.category || 'عمومی',
      image: enrolledCourse.image,
      level: enrolledCourse.level || 'مقدماتی',
      capacity: enrolledCourse.capacity || 'نامشخص',
      isFull: enrolledCourse.isFull || false,
      location: enrolledCourse.location,
      features: enrolledCourse.features || [],
      prerequisites: enrolledCourse.prerequisites || 'ندارد',
    }

    // ذخیره در استور با step=3 و انتقال به رزرو
    renewCourse(courseToRenew)
    router.push('/member/courses/reserve')
  }

  return (
    <div className="p-6 space-y-8 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl max-w-5xl mx-auto">
      {/* هدر صفحه */}
      <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1D3557]/10 rounded-xl text-[#1D3557]">
            <HiOutlineAcademicCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1D3557]">دوره‌های من</h1>
            <p className="text-xs md:text-sm text-[#457B9D] mt-1">
              لیست کلاس‌های فعال و سوابق ثبت‌نام‌های شما
            </p>
          </div>
        </div>
      </div>

      {/* کارت‌های دوره‌ها */}
      <div className="space-y-6">
        {myEnrolledCourses.map((course) => (
          <div
            key={course.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              course.isExpired ? 'border-rose-200 opacity-95' : 'border-[#A8DADC]'
            }`}
          >
            <div className="p-6 flex flex-col lg:flex-row gap-6 items-start">
              {/* تصویر دوره */}
              <div className="relative w-full lg:w-56 h-40 rounded-xl overflow-hidden shrink-0 border border-[#A8DADC]/40">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {/* بج وضعیت بالای عکس */}
                <div className="absolute top-3 right-3">
                  {course.isExpired ? (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                      اشتراک پایان یافته
                    </span>
                  ) : (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                      اشتراک فعال ({course.remainingSessions} جلسه باقی‌مانده)
                    </span>
                  )}
                </div>
              </div>

              {/* مشخصات کامل دوره */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-[#1D3557]">
                    {course.title}
                  </h2>
                  <p className="text-xs text-[#457B9D] flex items-center gap-1 mt-1">
                    <HiOutlineUserCircle className="w-4 h-4" />
                    مربی: {course.instructor}
                  </p>
                </div>

                {/* شبکه‌بندی جزئیات کلاس */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/50 text-xs text-[#1D3557]">
                  <div className="flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4 text-[#457B9D] shrink-0" />
                    <span><strong>برگزاری:</strong> {course.days} ({course.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineLocationMarker className="w-4 h-4 text-[#457B9D] shrink-0" />
                    <span><strong>مکان:</strong> {course.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCalendar className="w-4 h-4 text-[#457B9D] shrink-0" />
                    <span><strong>بازه دوره:</strong> {course.startDate} تا {course.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCreditCard className="w-4 h-4 text-[#457B9D] shrink-0" />
                    <span><strong>مبلغ پرداختی:</strong> {course.pricePaid}</span>
                  </div>
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => router.push('/member/attendance')}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#457B9D] hover:text-[#1D3557] bg-[#F1FAEE] hover:bg-[#A8DADC]/30 px-4 py-2.5 rounded-xl border border-[#A8DADC] transition-all"
                  >
                    <HiOutlineClipboardCheck className="w-4 h-4" />
                    مشاهده سوابق حضور و غیاب
                  </button>

                  {/* اگر اشتراک تمام شده باشد، کلیک روی تمدید اشتراک مستقیماً کاربر را به گام ۳ رزرو می‌برد */}
                  {course.isExpired && (
                    <button
                      onClick={() => handleRenew(course)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-[#E63946] hover:bg-[#E63946]/90 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      <HiOutlineRefresh className="w-4 h-4" />
                      تمدید اشتراک
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import Collapsible from '@/components/ui/Collapsible'
import {
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineGlobeAlt,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineHashtag,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineExclamationCircle as AlertCircle,
  HiOutlineShieldCheck
} from 'react-icons/hi'

export interface StudentSettlement {
  id: number
  studentName: string
  phoneNumber: string
  courseId: number
  courseTitle: string
  trainerName: string
  amount: string
  isSettled: boolean
  paymentType: 'online' | 'card_to_card'
  trackingCode: string
  paymentDate: string
  paymentTime: string
  cardNumber?: string
}

// لیست دوره‌های معتبر و تعریف‌شده در سیستم (جهت اعتبارسنچی اتصال دوره)
const activeDefinedCourses = [
  { id: 1, title: 'دوره جامع بدنسازی ترم بهار', trainer: 'استاد رضایی', schedule: 'روزهای زوج (۱۵:۰۰ الی ۱۶:۳۰)', salon: 'سالن شماره ۱ - اصلی', capacity: '۱۵ نفر (تکمیل شده)' },
  { id: 2, title: 'یوگا و مدیتیشن پیشرفته', trainer: 'خانم کاظمی', schedule: 'روزهای فرد (۱۰:۰۰ الی ۱۱:۳۰)', salon: 'سالن شماره ۲ - ایروبیک', capacity: '۱۲ نفر' },
  { id: 3, title: 'فیتنس و کراس‌فیت', trainer: 'استاد رضایی', schedule: 'روزهای زوج (۱۸:۰۰ الی ۱۹:۳۰)', salon: 'سالن شماره ۱ - اصلی', capacity: '۲۰ نفر' }
]

const initialSettlements: StudentSettlement[] = [
  {
    id: 101,
    studentName: 'علی محمدی',
    phoneNumber: '09123456789',
    courseId: 1,
    courseTitle: 'دوره جامع بدنسازی ترم بهار',
    trainerName: 'استاد رضایی',
    amount: '۱,۵۰۰,۰۰۰',
    isSettled: true,
    paymentType: 'online',
    trackingCode: 'TRX-98234101',
    paymentDate: '۱۴۰۳/۰۲/۱۵',
    paymentTime: '۱۴:۳۲:۰۵',
  },
  {
    id: 102,
    studentName: 'رضا کریمی',
    phoneNumber: '09187654321',
    courseId: 1,
    courseTitle: 'دوره جامع بدنسازی ترم بهار',
    trainerName: 'استاد رضایی',
    amount: '۱,۵۰۰,۰۰۰',
    isSettled: false,
    paymentType: 'card_to_card',
    trackingCode: 'C2C-55410928',
    paymentDate: '۱۴۰۳/۰۲/۱۸',
    paymentTime: '۰۹:۱۵:۴۰',
    cardNumber: '۶۰۳۷****۱۲۳۴',
  },
  {
    id: 103,
    studentName: 'زهرا احمدی',
    phoneNumber: '09351112233',
    courseId: 2,
    courseTitle: 'یوگا و مدیتیشن پیشرفته',
    trainerName: 'خانم کاظمی',
    amount: '۱,۲۰۰,۰۰۰',
    isSettled: true,
    paymentType: 'card_to_card',
    trackingCode: 'C2C-77120394',
    paymentDate: '۱۴۰۳/۰۲/۱۰',
    paymentTime: '۱۸:۴۵:۱۲',
    cardNumber: '۵۸۹۲****۵۶۷۸',
  },
  {
    id: 104,
    studentName: 'حسین نوری',
    phoneNumber: '09129998877',
    courseId: 3,
    courseTitle: 'فیتنس و کراس‌فیت',
    trainerName: 'استاد رضایی',
    amount: '۱,۸۰۰,۰۰۰',
    isSettled: false,
    paymentType: 'online',
    trackingCode: 'TRX-11029384',
    paymentDate: '۱۴۰۳/۰۲/۲۰',
    paymentTime: '۱۱:۰۲:۱۸',
  },
]

export default function StudentsSettlementsPage() {
  const [settlements, setSettlements] = useState<StudentSettlement[]>(initialSettlements)
  const [selectedCourseInfo, setSelectedCourseInfo] = useState<any | null>(null)

  // تابع تایید پرداخت توسط مدیر و اعمال وضعیت در پنل اعضا
  const handleApprovePayment = (id: number, e: React.MouseEvent) => {
    e.stopPropagation() // جلوگیری از باز و بسته شدن کلیک کولپسپلب
    setSettlements(prev =>
      prev.map(item => (item.id === id ? { ...item, isSettled: true } : item))
    )
  }

  // بررسی اعتبار و باز کردن مشخصات دوره در صورتی که در سیستم تعریف شده باشد
  const handleOpenCourseModal = (courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const foundCourse = activeDefinedCourses.find(c => c.title === courseTitle)
    if (foundCourse) {
      setSelectedCourseInfo(foundCourse)
    } else {
      // اگر دوره به صورت معتبر تعریف نشده بود
      setSelectedCourseInfo({
        title: courseTitle,
        trainer: 'تعریف نشده',
        schedule: 'نامشخص',
        salon: 'نامشخص',
        capacity: 'نامشخص'
      })
    }
  }

  return (
    <div className="p-6 min-h-screen text-slate-800 dir-rtl font-semibold">
      {/* هدر بخش بدون بک‌گراند اجباری آبی */}
      <div className="p-6 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">وضعیت تسویه‌حساب شاگردان</h1>
          <p className="text-xs text-slate-600 mt-1">
            مشاهده کامل وضعیت پرداخت، کد پیگیری و جزئیات تسویه‌حساب اعضا بابت کلاس‌ها
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-slate-700">
          <HiOutlineDocumentText className="w-4 h-4 text-slate-600" />
          <span>تعداد کل سوابق: {settlements.length} مورد</span>
        </div>
      </div>

      {/* لیست تسویه‌ها */}
      <div className="space-y-3 max-w-5xl mx-auto">
        {settlements.map((item) => (
          <Collapsible
            key={item.id}
            className="bg-white border border-slate-200/60 rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-slate-300"
          >
            {/* سطر اصلی (خلاصه) */}
            <Collapsible.Trigger className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                  <HiOutlineUser className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.studentName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">({item.phoneNumber})</span>
                  </div>
                  
                  {/* اطلاعات کلاس و مربی */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">کلاس:</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleOpenCourseModal(item.courseTitle, e)}
                        className="font-bold text-slate-700 hover:underline hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <HiOutlineAcademicCap className="w-3.5 h-3.5 text-blue-500" />
                        <span>{item.courseTitle}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بخش انتقال‌یافته به سمت چپ کارت (مربی، وضعیت، قیمت) */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-slate-600 text-[11px]">
                  مربی: <strong className="text-slate-900">{item.trainerName}</strong>
                </div>

                <div className="flex items-center gap-3">
                  {item.isSettled ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                      تسویه شده
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      تاییدنشده
                    </span>
                  )}

                  <div className="text-left font-mono">
                    <div className="font-extrabold text-sm text-slate-900">{item.amount} <span className="text-[10px] text-slate-500 font-normal">تومان</span></div>
                  </div>
                </div>
              </div>
            </Collapsible.Trigger>

            {/* بخش جزئیات بیشتر تراکنش */}
            <Collapsible.Content className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                
                {/* روش پرداخت */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                  <span className="text-slate-500 font-medium block">روش پرداخت:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    {item.paymentType === 'online' ? (
                      <>
                        <HiOutlineGlobeAlt className="w-4 h-4 text-blue-500" />
                        <span>درگاه آنلاین</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCreditCard className="w-4 h-4 text-slate-600" />
                        <span>کارت‌به‌کارت</span>
                      </>
                    )}
                  </div>
                </div>

                {/* کد پیگیری */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                  <span className="text-slate-500 font-medium block">کد پیگیری تراکنش:</span>
                  <div className="flex items-center gap-1 font-bold font-mono text-slate-800">
                    <HiOutlineHashtag className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.trackingCode}</span>
                  </div>
                </div>

                {/* تاریخ و ساعت دقیق */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                  <span className="text-slate-500 font-medium block">تاریخ و ساعت پرداخت:</span>
                  <div className="font-bold font-mono text-slate-800">
                    {item.paymentDate} - <span className="text-slate-500">{item.paymentTime}</span>
                  </div>
                </div>

                {/* اطلاعات کارت یا حساب (فقط کارت به کارت) */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                  <span className="text-slate-500 font-medium block">
                    {item.paymentType === 'card_to_card' ? 'شماره کارت مبدأ:' : 'وضعیت درگاه:'}
                  </span>
                  <div className="font-bold font-mono text-slate-800">
                    {item.paymentType === 'card_to_card'
                      ? item.cardNumber || 'ثبت نشده'
                      : 'پرداخت موفق شتابی'}
                  </div>
                </div>

              </div>

              {/* دکمه تایید پرداختی (فقط در صورتی که وضعیت تاییدنشده باشد) */}
              {!item.isSettled && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleApprovePayment(item.id, e)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <HiOutlineShieldCheck className="w-4 h-4" />
                    <span>تایید پرداختی (اعلام در پنل اعضا)</span>
                  </button>
                </div>
              )}
            </Collapsible.Content>
          </Collapsible>
        ))}
      </div>

      {/* ================= مودال مشاهده جزئیات دوره متصل‌شده ================= */}
      {selectedCourseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <HiOutlineAcademicCap className="w-5 h-5 text-blue-600" />
                <span>جزئیات دوره آموزشی تعریف‌شده</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseInfo(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">عنوان دوره:</span>
                <span className="font-bold text-sm text-slate-900">{selectedCourseInfo.title}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">مربی مسئول:</span>
                  <span className="font-semibold text-slate-800">{selectedCourseInfo.trainer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">برنامه کلاسی:</span>
                  <span className="font-semibold text-slate-800">{selectedCourseInfo.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سالن برگزاری:</span>
                  <span className="font-semibold text-slate-800">{selectedCourseInfo.salon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ظرفیت دوره:</span>
                  <span className="font-semibold text-slate-800">{selectedCourseInfo.capacity}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCourseInfo(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-2xs text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
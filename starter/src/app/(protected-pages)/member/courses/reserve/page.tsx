'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCourseStore } from '@/store/useCourseStore'
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineArrowRight,
  HiOutlineGlobeAlt,
  HiOutlineSwitchHorizontal,
  HiOutlineHashtag,
  HiOutlineExclamationCircle,
  HiOutlineX,
} from 'react-icons/hi'

// سانس‌های نمونه
const availableSessions = [
  { id: 1, days: 'روزهای زوج (شنبه، دوشنبه، چهارشنبه)', time: '۱۶:۰۰ الی ۱۷:۳۰' },
  { id: 2, days: 'روزهای زوج (شنبه، دوشنبه، چهارشنبه)', time: '۱۸:۰۰ الی ۱۹:۳۰' },
  { id: 3, days: 'روزهای فرد (یکشنبه، سه‌شنبه، پنج‌شنبه)', time: '۱۷:۰۰ الی ۱۸:۳۰' },
]

// درگاه‌های پرداخت آنلاین
const onlineGateways = [
  { id: 'saman', name: 'درگاه پرداخت سامان (سپ)', icon: '💳' },
  { id: 'parsian', name: 'درگاه پرداخت پارسیان', icon: '🏦' },
  { id: 'zibal', name: 'درگاه پرداخت زیبال', icon: '⚡' },
]

export default function CourseReservationPage() {
  const router = useRouter()
  const { selectedCourse } = useCourseStore()

  // گام‌های رزرو
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // اطلاعات کاربر
  const [userInfo, setUserInfo] = useState({
    fullName: 'رضا عضوی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    nationalCode: '۰۰۱۲۳۴۵۶۷۸',
  })

  // سانس انتخاب‌شده
  const [selectedSessionId, setSelectedSessionId] = useState<number>(availableSessions[0].id)

  // کد تخفیف
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0)

  // روش پرداخت
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cardToCard'>('online')
  const [selectedGateway, setSelectedGateway] = useState<string>('saman')

  // فیلدهای کارت به کارت
  const [serverDateTime, setServerDateTime] = useState<string>('در حال دریافت از سرور...')
  const [cardToCardData, setCardToCardData] = useState({
    trackingCode: '',
    userCardNumber: '',
  })

  // وضعیت مدیریت مودال اعلان و ارورها
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'error' | 'success' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  })

  // تابع کمکی برای باز کردن مودال
  const showAlertModal = (title: string, message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  // بستن مودال
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }))
  }

  // شبیه‌سازی دریافت تاریخ و ساعت از سرور
  useEffect(() => {
    const now = new Date()
    const formattedDate = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(now)

    setServerDateTime(formattedDate)
  }, [])

  if (!selectedCourse) {
    return (
      <div className="p-12 text-center bg-[#F1FAEE] min-h-screen flex flex-col items-center justify-center space-y-4 text-[#1D3557] dir-rtl">
        <p className="font-bold text-lg">هیچ دوره‌ای برای رزرو انتخاب نشده است.</p>
        <button
          onClick={() => router.push('/member/courses')}
          className="bg-[#1D3557] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1D3557]/90 transition-all"
        >
          بازگشت به لیست دوره‌ها
        </button>
      </div>
    )
  }

  // محاسبه قیمت‌ها
  const rawPrice = parseInt(selectedCourse.price.replace(/[^0-9]/g, '')) || 0
  const discountAmount = (rawPrice * appliedDiscount) / 100
  const finalPrice = rawPrice - discountAmount

  // اعمال کد تخفیف
  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      showAlertModal('خطای کد تخفیف', 'لطفاً کد تخفیف را وارد کنید.', 'error')
      return
    }

    if (discountCode.toUpperCase() === 'GOLD10') {
      setAppliedDiscount(10)
      showAlertModal('موفقیت‌آمیز', 'کد تخفیف ۱۰ درصدی با موفقیت اعمال شد.', 'success')
    } else if (discountCode.toUpperCase() === 'GYM20') {
      setAppliedDiscount(20)
      showAlertModal('موفقیت‌آمیز', 'کد تخفیف ۲۰ درصدی با موفقیت اعمال شد.', 'success')
    } else {
      showAlertModal('کد نامعتبر', 'کد تخفیف وارد شده معتبر نیست.', 'error')
    }
  }

  // ثبت نهایی فرم
  const handleSubmitPayment = () => {
    if (paymentMethod === 'cardToCard') {
      if (!cardToCardData.trackingCode.trim() || !cardToCardData.userCardNumber.trim()) {
        showAlertModal('نقص اطلاعات', 'لطفاً شماره پیگیری و شماره کارت خود را وارد کنید.', 'error')
        return
      }
      showAlertModal(
        'ثبت موفقیت‌آمیز',
        'اطلاعات پرداخت کارت به کارت با موفقیت ثبت شد و پس از بررسی توسط مدیریت فعال می‌گردد.',
        'success'
      )
    } else {
      const gatewayName = onlineGateways.find((g) => g.id === selectedGateway)?.name
      showAlertModal('انتقال به درگاه', `در حال انتقال به ${gatewayName}...`, 'info')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl max-w-4xl mx-auto relative">
      {/* هدر و دکمه بازگشت */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#A8DADC] shadow-sm">
        <button
          onClick={() => (step > 1 ? setStep((prev) => (prev - 1) as 1 | 2 | 3) : router.back())}
          className="flex items-center gap-2 text-xs font-bold text-[#457B9D] hover:text-[#1D3557] transition-colors"
        >
          <HiOutlineArrowRight className="w-4 h-4" />
          <span>{step > 1 ? 'مرحله قبل' : 'بازگشت به لیست'}</span>
        </button>
        <h1 className="text-lg font-bold text-[#1D3557]">مراحل ثبت رزرو کلاس ورزشی</h1>
      </div>

      {/* استپر مراحل */}
      <div className="grid grid-cols-3 gap-2 bg-white p-4 rounded-2xl border border-[#A8DADC] text-xs font-bold text-center">
        <div className={`p-2 rounded-xl transition-all ${step === 1 ? 'bg-[#1D3557] text-white' : 'bg-[#F1FAEE] text-[#457B9D]'}`}>
          ۱. اطلاعات ورزشکار
        </div>
        <div className={`p-2 rounded-xl transition-all ${step === 2 ? 'bg-[#1D3557] text-white' : 'bg-[#F1FAEE] text-[#457B9D]'}`}>
          ۲. اطلاعات دوره و سانس
        </div>
        <div className={`p-2 rounded-xl transition-all ${step === 3 ? 'bg-[#1D3557] text-white' : 'bg-[#F1FAEE] text-[#457B9D]'}`}>
          ۳. کد تخفیف و پرداخت
        </div>
      </div>

      {/* مرحله ۱: اطلاعات ورزشکار */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-6">
          <div className="border-b border-[#A8DADC]/40 pb-3">
            <h2 className="text-base font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-[#E63946]" />
              اطلاعات شخصی ورزشکار
            </h2>
            <p className="text-xs text-[#457B9D] mt-1">
              اطلاعات حساب کاربری شما به صورت خودکار قرار گرفته است.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D3557]">نام و نام خانوادگی</label>
              <div className="relative">
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                  className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-3 py-2.5 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                />
                <HiOutlineUser className="w-4 h-4 text-[#457B9D] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D3557]">شماره همراه</label>
              <div className="relative">
                <input
                  type="text"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-3 py-2.5 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                />
                <HiOutlinePhone className="w-4 h-4 text-[#457B9D] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D3557]">کد ملی</label>
              <div className="relative">
                <input
                  type="text"
                  value={userInfo.nationalCode}
                  onChange={(e) => setUserInfo({ ...userInfo, nationalCode: e.target.value })}
                  className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl px-3 py-2.5 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                />
                <HiOutlineIdentification className="w-4 h-4 text-[#457B9D] absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#A8DADC]/40">
            <button
              onClick={() => {
                if (!userInfo.fullName || !userInfo.phone || !userInfo.nationalCode) {
                  showAlertModal('نقص اطلاعات', 'لطفاً تمام فیلدهای اطلاعات شخصی را تکمیل نمایید.', 'error')
                  return
                }
                setStep(2)
              }}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              تایید و مرحله بعد (انتخاب سانس)
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۲: مشخصات دوره و سانس */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start border-b border-[#A8DADC]/40 pb-4">
              <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                <Image src={selectedCourse.image} alt={selectedCourse.title} fill className="object-cover" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-[#1D3557]">{selectedCourse.title}</h2>
                <p className="text-xs text-[#457B9D] leading-relaxed">{selectedCourse.description}</p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[#1D3557] pt-1">
                  <span className="flex items-center gap-1">
                    <HiOutlineAcademicCap className="w-4 h-4 text-[#457B9D]" /> مربی: {selectedCourse.instructor}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineLocationMarker className="w-4 h-4 text-[#457B9D]" /> سالن: {selectedCourse.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendar className="w-4 h-4 text-[#457B9D]" /> شروع: {selectedCourse.startDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/60 space-y-2 text-xs">
              <p className="font-bold text-[#1D3557]">پیش‌نیاز دوره:</p>
              <p className="text-[#457B9D]">{selectedCourse.prerequisites}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-[#E63946]" />
              انتخاب سانس و زمان‌بندی کلاس
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {availableSessions.map((s) => (
                <label
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedSessionId === s.id
                      ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-sm'
                      : 'border-[#A8DADC]/60 hover:bg-[#F1FAEE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="session"
                      checked={selectedSessionId === s.id}
                      onChange={() => setSelectedSessionId(s.id)}
                      className="accent-[#1D3557]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1D3557]">{s.days}</p>
                      <p className="text-[11px] text-[#457B9D] mt-0.5">ساعت برگزاری: {s.time}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#E63946] font-bold">ظرفیت پذیرش فعال</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#A8DADC]/40">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#457B9D] hover:text-[#1D3557]"
              >
                اصلاح اطلاعات شخص
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
              >
                تایید سانس و مرحله بعد (پرداخت)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مرحله ۳: تخفیف و انتخاب درگاه/کارت به کارت */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-6">
          <div className="border-b border-[#A8DADC]/40 pb-3">
            <h2 className="text-base font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineCreditCard className="w-5 h-5 text-[#E63946]" />
              خلاصه فاکتور و انتخاب روش پرداخت
            </h2>
          </div>

          {/* ثبت کد تخفیف */}
          <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC] space-y-3">
            <label className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
              <HiOutlineTicket className="w-4 h-4 text-[#E63946]" />
              کد تخفیف دارید؟
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="مثلاً GOLD10"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 bg-white border border-[#A8DADC] rounded-xl px-3 py-2 text-xs text-[#1D3557] uppercase focus:outline-none focus:border-[#1D3557]"
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0"
              >
                اعمال کد
              </button>
            </div>
          </div>

          {/* خلاصه فاکتور */}
          <div className="space-y-2 text-xs text-[#1D3557] border-t border-[#A8DADC]/40 pt-4">
            <div className="flex justify-between py-1">
              <span className="text-[#457B9D]">عنوان دوره:</span>
              <span className="font-bold">{selectedCourse.title}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#457B9D]">ورزشکار:</span>
              <span className="font-bold">{userInfo.fullName} ({userInfo.phone})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#457B9D]">قیمت دوره:</span>
              <span>{selectedCourse.price}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between py-1 text-emerald-600 font-bold">
                <span>تخفیف ({appliedDiscount}%):</span>
                <span>-{discountAmount.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t border-[#A8DADC] text-sm font-bold text-[#1D3557]">
              <span>مبلغ قابل پرداخت:</span>
              <span className="text-[#E63946] text-base">{finalPrice.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>

          {/* انتخاب روش پرداخت */}
          <div className="space-y-4 border-t border-[#A8DADC]/40 pt-4">
            <h3 className="text-xs font-bold text-[#1D3557]">روش پرداخت را انتخاب کنید:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'online'
                    ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-sm'
                    : 'border-[#A8DADC] hover:bg-[#F1FAEE]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineGlobeAlt className="w-5 h-5 text-[#1D3557]" />
                  <div>
                    <p className="text-xs font-bold text-[#1D3557]">پرداخت آنلاین (درگاه)</p>
                    <p className="text-[10px] text-[#457B9D] mt-0.5">اتصال مستقیم به درگاه‌های شتاب</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="accent-[#1D3557]"
                />
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cardToCard')}
                className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'cardToCard'
                    ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-sm'
                    : 'border-[#A8DADC] hover:bg-[#F1FAEE]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineSwitchHorizontal className="w-5 h-5 text-[#E63946]" />
                  <div>
                    <p className="text-xs font-bold text-[#1D3557]">پرداخت کارت به کارت</p>
                    <p className="text-[10px] text-[#457B9D] mt-0.5">واریز به شماره کارت باشگاه و ثبت فیش</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cardToCard'}
                  onChange={() => setPaymentMethod('cardToCard')}
                  className="accent-[#1D3557]"
                />
              </button>
            </div>

            {/* درگاه‌های آنلاین */}
            {paymentMethod === 'online' && (
              <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC] space-y-3 mt-4">
                <p className="text-xs font-bold text-[#1D3557]">انتخاب درگاه بانکی:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {onlineGateways.map((gw) => (
                    <label
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-white ${
                        selectedGateway === gw.id
                          ? 'border-[#1D3557] ring-1 ring-[#1D3557]'
                          : 'border-[#A8DADC]/60 hover:border-[#457B9D]'
                      }`}
                    >
                      <span className="text-xs font-medium text-[#1D3557] flex items-center gap-2">
                        <span>{gw.icon}</span>
                        {gw.name}
                      </span>
                      <input
                        type="radio"
                        name="gateway"
                        checked={selectedGateway === gw.id}
                        onChange={() => setSelectedGateway(gw.id)}
                        className="accent-[#1D3557]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* کارت به کارت */}
            {paymentMethod === 'cardToCard' && (
              <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC] space-y-4 mt-4">
                <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white p-4 rounded-xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-xs opacity-90">
                    <span>شماره کارت جهت واریز:</span>
                    <span>بانک ملی - باشگاه ورزشی</span>
                  </div>
                  <div className="text-center font-mono text-base md:text-lg tracking-widest font-bold py-1 flex items-center justify-center gap-2 dir-ltr">
                    <span>۶۰۳۷ - ۹۹۷۵ - ۱۲۳۴ - ۵۶۷۸</span>
                  </div>
                  <div className="text-[11px] opacity-80 text-left dir-rtl">
                    نام صاحب حساب: مدیر مجموعه ورزشی
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#1D3557] flex items-center gap-1">
                      <HiOutlineCalendar className="w-3.5 h-3.5 text-[#457B9D]" />
                      تاریخ و زمان ثبت (سرور):
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={serverDateTime}
                      className="w-full bg-gray-100 border border-[#A8DADC] rounded-xl px-3 py-2 text-xs text-[#1D3557] font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#1D3557] flex items-center gap-1">
                      <HiOutlineHashtag className="w-3.5 h-3.5 text-[#457B9D]" />
                      شماره پیگیری واریز:
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً ۱۲۳۴۵۶"
                      value={cardToCardData.trackingCode}
                      onChange={(e) => setCardToCardData({ ...cardToCardData, trackingCode: e.target.value })}
                      className="w-full bg-white border border-[#A8DADC] rounded-xl px-3 py-2 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#1D3557] flex items-center gap-1">
                      <HiOutlineCreditCard className="w-3.5 h-3.5 text-[#457B9D]" />
                      شماره کارت واریزکننده:
                    </label>
                    <input
                      type="text"
                      placeholder="۴ رقم آخر یا کامل"
                      value={cardToCardData.userCardNumber}
                      onChange={(e) => setCardToCardData({ ...cardToCardData, userCardNumber: e.target.value })}
                      className="w-full bg-white border border-[#A8DADC] rounded-xl px-3 py-2 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557] dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#A8DADC]/40">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-bold text-[#457B9D] hover:text-[#1D3557]"
            >
              تغییر سانس انتخاب‌شده
            </button>
            <button
              onClick={handleSubmitPayment}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-xs font-bold px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
              <span>
                {paymentMethod === 'online' ? 'انتقال به درگاه و پرداخت' : 'ثبت مشخصات واریز'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* کامپوننت مودال وسط‌چین برای پیام‌ها و خطاهایی که جایگزین Alert شده‌اند */}
      {/* ------------------------------------------------------------- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in dir-rtl">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#A8DADC] space-y-4 text-center transform transition-all scale-100 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>

            {/* آیکون بر اساس نوع پیام */}
            <div className="flex justify-center">
              {modalConfig.type === 'error' && (
                <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-[#E63946]">
                  <HiOutlineExclamationCircle className="w-8 h-8" />
                </div>
              )}
              {modalConfig.type === 'success' && (
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <HiOutlineCheckCircle className="w-8 h-8" />
                </div>
              )}
              {modalConfig.type === 'info' && (
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-[#1D3557]">
                  <HiOutlineGlobeAlt className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* عنوان و متن پیام */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#1D3557]">{modalConfig.title}</h3>
              <p className="text-xs text-[#457B9D] leading-relaxed">{modalConfig.message}</p>
            </div>

            {/* دکمه تایید */}
            <div className="pt-2">
              <button
                onClick={closeModal}
                className="w-full bg-[#1D3557] hover:bg-[#1D3557]/90 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCourseStore } from '@/store/useCourseStore'
import ApiService from '@/services/client/ApiService'
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineArrowRight,
  HiOutlineGlobeAlt,
  HiOutlineSwitchHorizontal,
  HiOutlineHashtag,
  HiOutlineExclamationCircle,
  HiOutlineX,
  HiOutlineStatusOnline,
} from 'react-icons/hi'

// --- Types & DTOs ---
interface ActiveGymClassDto {
  id: number
  title?: string
  groupName?: string
  trainerName?: string
  sportName?: string
  capacity: number
  remainingCapacity: number
  startDate?: string
  durationDays?: number
  totalSession?: number
  isActive?: boolean
  price?: number | string
}

interface PaymentResponseDto {
  paymentId: number
  authority?: string
  paymentUrl?: string
}

interface UserProfileDto {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  gender: number
  birthDate: string
  joinDate?: string
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

// تابع تبدیل تاریخ میلادی به شمسی (رسمی با Intl)
const formatToShamsi = (dateString?: string): string => {
  if (!dateString) return 'نامشخص'
  try {
    const cleanDate = dateString.split('T')[0]
    const dateObj = new Date(cleanDate)
    if (isNaN(dateObj.getTime())) return cleanDate

    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj)
  } catch {
    return dateString
  }
}

export default function CourseReservationPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { selectedCourse } = useCourseStore()

  // گام‌های رزرو
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // اطلاعات کاربر
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    nationalCode: '',
  })

  // لیست کلاس‌های فعال برای انتخاب سانس (gymClassId)
  const [gymClasses, setGymClasses] = useState<ActiveGymClassDto[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number>(0)
  const [loadingClasses, setLoadingClasses] = useState<boolean>(false)

  // روش پرداخت
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cardToCard'>('online')

  // فیلدهای کارت به کارت
  const [serverDateTime, setServerDateTime] = useState<string>('در حال دریافت از سرور...')
  const [cardToCardData, setCardToCardData] = useState({
    trackingCode: '',
    cardLastFourDigits: '',
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

  const showAlertModal = (title: string, message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setModalConfig({ isOpen: true, title, message, type })
  }

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    if (status === 'loading') return
    if (status !== 'authenticated') return

    const accessToken = (session as any)?.accessToken
    if (!accessToken) return

    const fetchUserProfile = async () => {
      try {
        const payload = parseJwtPayload(accessToken)
        if (!payload) return

        const userIdValue = payload[NAME_IDENTIFIER_CLAIM]
        if (userIdValue === undefined || userIdValue === null) return

        const userId = Number(userIdValue)
        if (!Number.isInteger(userId) || userId <= 0) return

        const response = await ApiService.get<UserProfileDto>(
          `/api/members/${userId}`,
        )

        if (response) {
          setUserInfo({
            fullName: `${response.firstName || ''} ${response.lastName || ''}`.trim(),
            phone: response.phoneNumber || '',
            nationalCode: response.nationalCode || '',
          })
        }
      } catch (error) {
        console.error('Error fetching user profile for reservation:', error)
      }
    }

    fetchUserProfile()
  }, [status, (session as any)?.accessToken])

  useEffect(() => {
    const fetchGymClasses = async () => {
      try {
        setLoadingClasses(true)
        const res = await ApiService.get<ActiveGymClassDto[]>('/gym-classes')
        if (res && res.length > 0) {
          setGymClasses(res)
          setSelectedClassId(res[0].id)
        }
      } catch (error) {
        console.error('خطا در دریافت کلاس‌ها:', error)
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchGymClasses()
  }, [])

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
      <div className="p-12 text-center min-h-screen flex flex-col items-center justify-center space-y-4 text-[#1D3557] dir-rtl w-full bg-white">
        <p className="font-bold text-xl">هیچ دوره‌ای برای رزرو انتخاب نشده است.</p>
        <button
          onClick={() => router.push('/member/courses')}
          className="bg-[#1D3557] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#1D3557]/90 transition-all shadow-md"
        >
          بازگشت به لیست دوره‌ها
        </button>
      </div>
    )
  }

  // پیدا کردن کلاس انتخاب شده جهت استخراج اطلاعات دقیق
  const selectedGymClass = gymClasses.find((gc) => gc.id === selectedClassId)

  // هندل کردن قیمت decimal از سمت دیتابیس
  const getNumericPrice = (val: unknown): number => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  // استفاده مستقیم از rawPrice به عنوان مبلغ پایه و نهایی دوره
  const rawPrice = getNumericPrice(selectedGymClass?.price ?? selectedCourse.price)

  const handleSubmitPayment = async () => {
    try {
      if (paymentMethod === 'cardToCard') {
        if (!cardToCardData.trackingCode.trim() || !cardToCardData.cardLastFourDigits.trim()) {
          showAlertModal('نقص اطلاعات', 'لطفاً شماره پیگیری و ۴ رقم آخر کارت خود را وارد کنید.', 'error')
          return
        }
      }

      const subscriptionId = await ApiService.post<number>('/subscriptions', {
        packageId: selectedCourse.id,
        gymClassId: selectedClassId,
      })

      if (paymentMethod === 'cardToCard') {
        await ApiService.post('/api/Payments/card-to-card', {
          subscriptionId: subscriptionId,
          cardLastFourDigits: cardToCardData.cardLastFourDigits,
          transferDateTime: new Date().toISOString(),
        })
        showAlertModal(
          'ثبت موفقیت‌آمیز',
          'اطلاعات پرداخت کارت به کارت با موفقیت ثبت شد و پس از بررسی توسط مدیریت فعال می‌گردد.',
          'success'
        )
      } else {
        const paymentRes = await ApiService.post<PaymentResponseDto>('/Payments/online', {
          subscriptionId: subscriptionId,
        })

        if (paymentRes?.paymentUrl) {
          window.location.href = paymentRes.paymentUrl
        } else {
          showAlertModal('خطای درگاه', 'درگاه پرداخت پاسخ مناسبی ارسال نکرد.', 'error')
        }
      }
    } catch (error) {
      console.error('خطا در فرآیند ثبت رزرو و پرداخت:', error)
      showAlertModal('خطا', 'خطایی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.', 'error')
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 min-h-screen text-[#1D3557] dir-rtl w-full max-w-7xl mx-auto relative bg-white">
      {/* هدر و دکمه بازگشت */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
        <button
          onClick={() => (step > 1 ? setStep((prev) => (prev - 1) as 1 | 2 | 3) : router.back())}
          className="flex items-center gap-2 text-sm font-bold text-[#457B9D] hover:text-[#1D3557] transition-colors"
        >
          <HiOutlineArrowRight className="w-5 h-5" />
          <span>{step > 1 ? 'مرحله قبل' : 'بازگشت به لیست'}</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-[#1D3557]">مراحل ثبت رزرو کلاس ورزشی</h1>
      </div>

      {/* استپر مراحل */}
      <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 text-sm sm:text-base font-bold text-center shadow-sm">
        <div className={`p-3 rounded-xl transition-all ${step === 1 ? 'bg-[#1D3557] text-white shadow' : 'bg-gray-50 text-[#457B9D]'}`}>
          ۱. اطلاعات ورزشکار
        </div>
        <div className={`p-3 rounded-xl transition-all ${step === 2 ? 'bg-[#1D3557] text-white shadow' : 'bg-gray-50 text-[#457B9D]'}`}>
          ۲. اطلاعات دوره و سانس
        </div>
        <div className={`p-3 rounded-xl transition-all ${step === 3 ? 'bg-[#1D3557] text-white shadow' : 'bg-gray-50 text-[#457B9D]'}`}>
          ۳. پرداخت
        </div>
      </div>

      {/* مرحله ۱: اطلاعات ورزشکار */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-md space-y-8 w-full">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineUser className="w-6 h-6 text-[#E63946]" />
              اطلاعات شخصی ورزشکار
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              اطلاعات حساب کاربری شما به صورت خودکار از سیستم دریافت شده است.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">نام و نام خانوادگی</label>
              <div className="relative">
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                />
                <HiOutlineUser className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">شماره همراه</label>
              <div className="relative">
                <input
                  type="text"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                />
                <HiOutlinePhone className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">کد ملی</label>
              <div className="relative">
                <input
                  type="text"
                  value={userInfo.nationalCode}
                  onChange={(e) => setUserInfo({ ...userInfo, nationalCode: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                />
                <HiOutlineIdentification className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                if (!userInfo.fullName || !userInfo.phone || !userInfo.nationalCode) {
                  showAlertModal('نقص اطلاعات', 'لطفاً تمام فیلدهای اطلاعات شخصی را تکمیل نمایید.', 'error')
                  return
                }
                setStep(2)
              }}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-sm font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md"
            >
              تایید و مرحله بعد (انتخاب سانس)
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۲: مشخصات دوره و سانس */}
      {step === 2 && (
        <div className="space-y-6 w-full">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start border-b border-gray-100 pb-6">
              <div className="relative w-full lg:w-72 h-48 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100 bg-gray-100">
                <Image 
                  src={selectedCourse.image || '/placeholder.png'} 
                  alt={selectedCourse.title || 'دوره ورزشی'} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="space-y-3 flex-1">
                <h2 className="text-xl sm:text-2xl font-black text-[#1D3557]">{selectedCourse.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedCourse.description}</p>
                <div className="flex flex-wrap gap-6 text-sm font-semibold text-[#1D3557] pt-2">
                  <span className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                    <HiOutlineAcademicCap className="w-5 h-5 text-[#457B9D]" /> مربی: {selectedGymClass?.trainerName || selectedCourse.instructor || 'نامشخص'}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                    <HiOutlineCalendar className="w-5 h-5 text-[#457B9D]" /> شروع: {formatToShamsi(selectedGymClass?.startDate || selectedCourse.startDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* اطلاعات تکمیلی سانس: title, trainerName, durationDays, totalSession, price, isActive */}
            {selectedGymClass && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-gray-500 block">عنوان سانس:</span>
                  <span className="font-bold text-[#1D3557] truncate block">{selectedGymClass.title || selectedGymClass.groupName || '-'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 block">نام مربی:</span>
                  <span className="font-bold text-[#1D3557] truncate block">{selectedGymClass.trainerName || '-'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 block">مدت دوره (روز):</span>
                  <span className="font-bold text-[#1D3557] block">{selectedGymClass.durationDays ?? '-'} روز</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 block">تعداد کل جلسات:</span>
                  <span className="font-bold text-[#1D3557] block">{selectedGymClass.totalSession ?? '-'} جلسه</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 block">قیمت دوره:</span>
                  <span className="font-bold text-[#E63946] block">{rawPrice ? `${rawPrice.toLocaleString('fa-IR')} تومان` : 'رایگان'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 block">وضعیت:</span>
                  <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg ${selectedGymClass.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <HiOutlineStatusOnline className="w-4 h-4" />
                    {selectedGymClass.isActive !== false ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineClock className="w-6 h-6 text-[#E63946]" />
              انتخاب سانس و زمان‌بندی کلاس
            </h3>

            {loadingClasses ? (
              <p className="text-sm text-gray-500 text-center py-6">در حال بارگذاری کلاس‌ها...</p>
            ) : gymClasses.length === 0 ? (
              <p className="text-sm text-rose-500 text-center py-6">هیچ کلاس فعالی یافت نشد.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {gymClasses.map((gc) => (
                  <label
                    key={gc.id}
                    onClick={() => setSelectedClassId(gc.id)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedClassId === gc.id
                        ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="session"
                        checked={selectedClassId === gc.id}
                        onChange={() => setSelectedClassId(gc.id)}
                        className="accent-[#1D3557] w-4 h-4"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#1D3557]">{gc.title || gc.groupName || 'کلاس ورزشی'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          مربی: {gc.trainerName || 'نامشخص'} | رشته: {gc.sportName || '-'} | شروع: {formatToShamsi(gc.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs text-[#1D3557] bg-white px-3 py-1.5 rounded-xl border border-gray-200 font-semibold">
                        {getNumericPrice(gc.price) ? `${getNumericPrice(gc.price).toLocaleString('fa-IR')} تومان` : ''}
                      </span>
                      <span className="text-xs sm:text-sm text-[#E63946] font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                        ظرفیت: {gc.remainingCapacity}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button
                onClick={() => setStep(1)}
                className="text-sm font-bold text-[#457B9D] hover:text-[#1D3557]"
              >
                اصلاح اطلاعات شخص
              </button>
              <button
                onClick={() => {
                  if (!selectedClassId) {
                    showAlertModal('انتخاب سانس', 'لطفاً یک کلاس/سانس را انتخاب کنید.', 'error')
                    return
                  }
                  setStep(3)
                }}
                className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-sm font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md"
              >
                تایید سانس و مرحله بعد (پرداخت)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مرحله ۳: قیمت و پرداخت */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-md space-y-8 w-full">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineCreditCard className="w-6 h-6 text-[#E63946]" />
              خلاصه فاکتور و انتخاب روش پرداخت
            </h2>
          </div>

          {/* خلاصه فاکتور و قیمت دوره بر اساس rawPrice */}
          <div className="space-y-3 text-sm text-[#1D3557] bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between py-2">
              <span className="text-gray-500">عنوان دوره:</span>
              <span className="font-bold">{selectedCourse.title}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">ورزشکار:</span>
              <span className="font-bold">{userInfo.fullName} ({userInfo.phone})</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">مبلغ پایه (Raw Price):</span>
              <span className="font-bold">{rawPrice ? `${rawPrice.toLocaleString('fa-IR')} تومان` : 'رایگان'}</span>
            </div>
            <div className="flex justify-between py-4 border-t border-gray-200 text-base sm:text-lg font-black text-[#1D3557]">
              <span>مبلغ قابل پرداخت:</span>
              <span className="text-[#E63946]">{rawPrice ? `${rawPrice.toLocaleString('fa-IR')} تومان` : 'رایگان'}</span>
            </div>
          </div>

          {/* انتخاب روش پرداخت */}
          <div className="space-y-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm sm:text-base font-bold text-[#1D3557]">روش پرداخت را انتخاب کنید:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'online'
                    ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <HiOutlineGlobeAlt className="w-6 h-6 text-[#1D3557]" />
                  <div>
                    <p className="text-sm font-bold text-[#1D3557]">پرداخت آنلاین (درگاه)</p>
                    <p className="text-xs text-gray-500 mt-1">اتصال مستقیم به درگاه‌های شتاب</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="accent-[#1D3557] w-4 h-4"
                />
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cardToCard')}
                className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'cardToCard'
                    ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <HiOutlineSwitchHorizontal className="w-6 h-6 text-[#E63946]" />
                  <div>
                    <p className="text-sm font-bold text-[#1D3557]">پرداخت کارت به کارت</p>
                    <p className="text-xs text-gray-500 mt-1">واریز به شماره کارت باشگاه و ثبت فیش</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cardToCard'}
                  onChange={() => setPaymentMethod('cardToCard')}
                  className="accent-[#1D3557] w-4 h-4"
                />
              </button>
            </div>

            {/* کارت به کارت */}
            {paymentMethod === 'cardToCard' && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6 mt-6">
                <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white p-6 rounded-2xl space-y-3 shadow-md">
                  <div className="flex justify-between items-center text-sm opacity-90">
                    <span>شماره کارت جهت واریز:</span>
                    <span>بانک ملی - باشگاه ورزشی</span>
                  </div>
                  <div className="text-center font-mono text-lg sm:text-xl tracking-widest font-bold py-2 flex items-center justify-center gap-2 dir-ltr">
                    <span>۶۰۳۷ - ۹۹۷۵ - ۱۲۳۴ - ۵۶۷۸</span>
                  </div>
                  <div className="text-xs opacity-80 text-left dir-rtl">
                    نام صاحب حساب: مدیر مجموعه ورزشی
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
                      <HiOutlineCalendar className="w-4 h-4 text-[#457B9D]" />
                      تاریخ و زمان ثبت (سرور):
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={serverDateTime}
                      className="w-full bg-gray-200 border border-gray-300 rounded-2xl px-4 py-3 text-xs text-[#1D3557] font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
                      <HiOutlineHashtag className="w-4 h-4 text-[#457B9D]" />
                      شماره پیگیری واریز:
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً ۱۲۳۴۵۶"
                      value={cardToCardData.trackingCode}
                      onChange={(e) => setCardToCardData({ ...cardToCardData, trackingCode: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
                      <HiOutlineCreditCard className="w-4 h-4 text-[#457B9D]" />
                      ۴ رقم آخر کارت واریزکننده:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="مثلاً ۵۶۷۸"
                      value={cardToCardData.cardLastFourDigits}
                      onChange={(e) => setCardToCardData({ ...cardToCardData, cardLastFourDigits: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557] dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(2)}
              className="text-sm font-bold text-[#457B9D] hover:text-[#1D3557]"
            >
              تغییر سانس انتخاب‌شده
            </button>
            <button
              onClick={handleSubmitPayment}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-sm font-bold px-10 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
              <span>
                {paymentMethod === 'online' ? 'انتقال به درگاه و پرداخت' : 'ثبت مشخصات واریز'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* مودال پیام‌ها */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in dir-rtl">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 text-center transform transition-all relative">
            <button
              onClick={closeModal}
              className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>

            <div className="flex justify-center">
              {modalConfig.type === 'error' && (
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-[#E63946]">
                  <HiOutlineExclamationCircle className="w-9 h-9" />
                </div>
              )}
              {modalConfig.type === 'success' && (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <HiOutlineCheckCircle className="w-9 h-9" />
                </div>
              )}
              {modalConfig.type === 'info' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#1D3557]">
                  <HiOutlineGlobeAlt className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1D3557]">{modalConfig.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{modalConfig.message}</p>
            </div>

            <div>
              <button
                onClick={closeModal}
                className="w-full bg-[#1D3557] hover:bg-[#1D3557]/90 text-white text-sm font-bold py-3.5 rounded-2xl transition-all shadow-md"
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
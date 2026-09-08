
'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import Image from 'next/image'

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
  HiOutlineExclamationCircle,
  HiOutlineX,
  HiOutlineStatusOnline,
} from 'react-icons/hi'

/* =========================================================
   Types & DTOs
========================================================= */

interface CourseDto {
  id: number
  trainerId: number
  trainerName: string
  title: string
  durationDays: number
  totalSessions: number
  price: number
  isActive: boolean

  // در صورت وجود در store فعلی
  image?: string
  description?: string
}

interface ScheduleDto {
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface GymClassDto {
  gymClassId: number
  title: string
  capacity: number
  startDate: string
  remainingSessions: number
  trainerFullName: string
  schedules: ScheduleDto[]
}

interface UserProfileDto {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  gender: 'Female' | 'Male' | string
  birthDate: string
  joinDate?: string
}

interface PaymentResponseDto {
  paymentId: number
  authority?: string
  paymentUrl?: string
}

interface CardToCardRequestDto {
  subscriptionId: number
  cardLastFourDigits: string
  transferDateTime: string
}

const NAME_IDENTIFIER_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

/* =========================================================
   JWT
========================================================= */

function parseJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    if (!token || typeof token !== 'string') return null

    const parts = token.split('.')

    if (parts.length !== 3) return null

    const payloadPart = parts[1]

    if (!payloadPart) return null

    const base64 = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const paddedBase64 =
      base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    const binaryString = atob(paddedBase64)

    const bytes = Uint8Array.from(
      binaryString,
      (char) => char.charCodeAt(0)
    )

    const decoded = new TextDecoder().decode(bytes)

    return JSON.parse(decoded) as Record<string, unknown>
  } catch (error) {
    console.error('Failed to parse JWT payload:', error)
    return null
  }
}

/* =========================================================
   Date Helpers
========================================================= */

const formatToShamsi = (dateString?: string): string => {
  if (!dateString) return 'نامشخص'

  try {
    const cleanDate = dateString.split('T')[0]

    const dateObj = new Date(cleanDate)

    if (isNaN(dateObj.getTime())) {
      return cleanDate
    }

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

/* =========================================================
   Day Of Week
========================================================= */

const dayOfWeekFa: Record<string, string> = {
  Saturday: 'شنبه',
  Sunday: 'یکشنبه',
  Monday: 'دوشنبه',
  Tuesday: 'سه‌شنبه',
  Wednesday: 'چهارشنبه',
  Thursday: 'پنجشنبه',
  Friday: 'جمعه',
}

/* =========================================================
   Component
========================================================= */

export default function CourseReservationPage() {
  const router = useRouter()

  const { data: session, status } = useSession()

  const { selectedCourse } = useCourseStore()

  /* =========================================================
     Steps
  ========================================================= */

  const [step, setStep] = useState<1 | 2 | 3>(1)

  /* =========================================================
     Athlete
  ========================================================= */

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    nationalCode: '',
    gender: '',
    birthDate: '',
  })

  /* =========================================================
     Gym Classes
  ========================================================= */

  const [gymClasses, setGymClasses] = useState<GymClassDto[]>([])

  const [selectedClassId, setSelectedClassId] = useState<number>(0)

  const [loadingClasses, setLoadingClasses] =
    useState<boolean>(false)

  /* =========================================================
     Payment
  ========================================================= */

  const [paymentMethod, setPaymentMethod] = useState<
    'online' | 'cardToCard'
  >('online')

  const [serverDateTime, setServerDateTime] =
    useState<string>('در حال دریافت...')

  const [cardToCardData, setCardToCardData] = useState({
    cardLastFourDigits: '',
  })

  /* =========================================================
     Modal
  ========================================================= */

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

  const showAlertModal = (
    title: string,
    message: string,
    type: 'error' | 'success' | 'info' = 'error'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  const closeModal = () => {
    setModalConfig((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  /* =========================================================
     Fetch Athlete
  ========================================================= */

  useEffect(() => {
    if (status === 'loading') return

    if (status !== 'authenticated') return

    const accessToken = (session as any)?.accessToken

    if (!accessToken) return

    const fetchUserProfile = async () => {
      try {
        const payload = parseJwtPayload(accessToken)

        if (!payload) return

        const userIdValue =
          payload[NAME_IDENTIFIER_CLAIM]

        if (
          userIdValue === undefined ||
          userIdValue === null
        ) {
          return
        }

        const userId = Number(userIdValue)

        if (!Number.isInteger(userId) || userId <= 0) {
          return
        }

        const response =
          await ApiService.get<UserProfileDto>(
            `/api/members/${userId}`
          )

        if (response) {
          setUserInfo({
            fullName:
              `${response.firstName || ''} ${
                response.lastName || ''
              }`.trim(),

            phone: response.phoneNumber || '',

            nationalCode:
              response.nationalCode || '',

            gender: response.gender || '',

            birthDate:
              response.birthDate || '',
          })
        }
      } catch (error) {
        console.error(
          'Error fetching user profile:',
          error
        )
      }
    }

    fetchUserProfile()
  }, [
    status,
    (session as any)?.accessToken,
  ])

  /* =========================================================
     Fetch Gym Classes
  ========================================================= */

  useEffect(() => {
    const fetchGymClasses = async () => {
      try {
        setLoadingClasses(true)

        const response =
          await ApiService.get<GymClassDto[]>(
            '/gym-classes'
          )

        if (response && response.length > 0) {
          setGymClasses(response)

          setSelectedClassId(
            response[0].gymClassId
          )
        }
      } catch (error) {
        console.error(
          'خطا در دریافت سانس‌ها:',
          error
        )
      } finally {
        setLoadingClasses(false)
      }
    }

    fetchGymClasses()
  }, [])

  /* =========================================================
     Server Date
  ========================================================= */

  useEffect(() => {
    const now = new Date()

    const formattedDate =
      new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(now)

    setServerDateTime(formattedDate)
  }, [])

  /* =========================================================
     Selected Class
  ========================================================= */

  const selectedGymClass =
    gymClasses.find(
      (item) =>
        item.gymClassId === selectedClassId
    )

  /* =========================================================
     Selected Course
  ========================================================= */

  const course =
    selectedCourse as CourseDto | null

  /* =========================================================
     Price
  ========================================================= */

  const getNumericPrice = (
    value: unknown
  ): number => {
    if (typeof value === 'number') {
      return value
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value)

      return isNaN(parsed) ? 0 : parsed
    }

    return 0
  }

  const rawPrice = getNumericPrice(
    course?.price
  )

  /* =========================================================
     Payment
  ========================================================= */

  const handleSubmitPayment = async () => {
    try {
      if (!course) {
        showAlertModal(
          'خطا',
          'اطلاعات دوره پیدا نشد.',
          'error'
        )

        return
      }

      if (!selectedClassId) {
        showAlertModal(
          'انتخاب سانس',
          'لطفاً یک سانس را انتخاب کنید.',
          'error'
        )

        return
      }

      if (
        paymentMethod === 'cardToCard' &&
        !cardToCardData.cardLastFourDigits.trim()
      ) {
        showAlertModal(
          'نقص اطلاعات',
          'لطفاً ۴ رقم آخر کارت واریزکننده را وارد کنید.',
          'error'
        )

        return
      }

      /* =====================================================
         Create Subscription
      ===================================================== */

      const subscriptionId =
        await ApiService.post<number>(
          '/subscriptions',
          {
            packageId: course.id,
            gymClassId: selectedClassId,
          }
        )

      if (!subscriptionId) {
        showAlertModal(
          'خطا',
          'اشتراک با موفقیت ایجاد نشد.',
          'error'
        )

        return
      }

      /* =====================================================
         Card To Card
      ===================================================== */

      if (paymentMethod === 'cardToCard') {
        const cardToCardRequest: CardToCardRequestDto = {
          subscriptionId,

          cardLastFourDigits:
            cardToCardData.cardLastFourDigits,

          transferDateTime:
            new Date().toISOString(),
        }

        await ApiService.post(
          '/api/Payments/card-to-card',
          cardToCardRequest
        )

        showAlertModal(
          'ثبت موفقیت‌آمیز',
          'اطلاعات پرداخت کارت به کارت با موفقیت ثبت شد و پس از بررسی توسط مدیریت فعال می‌گردد.',
          'success'
        )

        return
      }

      /* =====================================================
         Online Payment
      ===================================================== */

      const paymentRes =
        await ApiService.post<PaymentResponseDto>(
          '/Payments/online',
          {
            subscriptionId,
          }
        )

      if (paymentRes?.paymentUrl) {
        window.location.href =
          paymentRes.paymentUrl
      } else {
        showAlertModal(
          'خطای درگاه',
          'درگاه پرداخت پاسخ مناسبی ارسال نکرد.',
          'error'
        )
      }
    } catch (error) {
      console.error(
        'خطا در فرآیند رزرو و پرداخت:',
        error
      )

      showAlertModal(
        'خطا',
        'خطایی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.',
        'error'
      )
    }
  }

  /* =========================================================
     Selected Course Guard
  ========================================================= */

  if (!course) {
    return (
      <div className="p-12 text-center min-h-screen flex flex-col items-center justify-center space-y-4 text-[#1D3557] dir-rtl w-full bg-white">
        <p className="font-bold text-xl">
          هیچ دوره‌ای برای رزرو انتخاب نشده است.
        </p>

        <button
          onClick={() =>
            router.push('/member/courses')
          }
          className="bg-[#1D3557] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#1D3557]/90 transition-all shadow-md"
        >
          بازگشت به لیست دوره‌ها
        </button>
      </div>
    )
  }

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="p-4 sm:p-8 space-y-6 min-h-screen text-[#1D3557] dir-rtl w-full max-w-7xl mx-auto relative bg-white">

      {/* =====================================================
          Header
      ===================================================== */}

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-md">

        <button
          onClick={() =>
            step > 1
              ? setStep(
                  (prev) =>
                    (prev - 1) as 1 | 2 | 3
                )
              : router.back()
          }
          className="flex items-center gap-2 text-sm font-bold text-[#457B9D] hover:text-[#1D3557] transition-colors"
        >
          <HiOutlineArrowRight className="w-5 h-5" />

          <span>
            {step > 1
              ? 'مرحله قبل'
              : 'بازگشت به لیست'}
          </span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-[#1D3557]">
          مراحل ثبت رزرو کلاس ورزشی
        </h1>
      </div>

      {/* =====================================================
          Stepper
      ===================================================== */}

      <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 text-sm sm:text-base font-bold text-center shadow-sm">

        <div
          className={`p-3 rounded-xl transition-all ${
            step === 1
              ? 'bg-[#1D3557] text-white shadow'
              : 'bg-gray-50 text-[#457B9D]'
          }`}
        >
          ۱. اطلاعات ورزشکار
        </div>

        <div
          className={`p-3 rounded-xl transition-all ${
            step === 2
              ? 'bg-[#1D3557] text-white shadow'
              : 'bg-gray-50 text-[#457B9D]'
          }`}
        >
          ۲. اطلاعات دوره و سانس
        </div>

        <div
          className={`p-3 rounded-xl transition-all ${
            step === 3
              ? 'bg-[#1D3557] text-white shadow'
              : 'bg-gray-50 text-[#457B9D]'
          }`}
        >
          ۳. پرداخت
        </div>
      </div>

      {/* =====================================================
          STEP 1 - Athlete
      ===================================================== */}

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

            {/* Full Name */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-[#1D3557]">
                نام و نام خانوادگی
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={userInfo.fullName}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
                />

                <HiOutlineUser className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Phone */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-[#1D3557]">
                شماره همراه
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={userInfo.phone}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
                />

                <HiOutlinePhone className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* National Code */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-[#1D3557]">
                کد ملی
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={userInfo.nationalCode}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
                />

                <HiOutlineIdentification className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Gender */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-[#1D3557]">
                جنسیت
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={
                    userInfo.gender === 'Female'
                      ? 'زن'
                      : userInfo.gender === 'Male'
                        ? 'مرد'
                        : userInfo.gender
                  }
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
                />

                <HiOutlineUser className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Birth Date */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-[#1D3557]">
                تاریخ تولد
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={formatToShamsi(
                    userInfo.birthDate
                  )}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
                />

                <HiOutlineCalendar className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">

            <button
              onClick={() => {
                if (
                  !userInfo.fullName ||
                  !userInfo.phone ||
                  !userInfo.nationalCode
                ) {
                  showAlertModal(
                    'نقص اطلاعات',
                    'اطلاعات ورزشکار هنوز از سیستم دریافت نشده است.',
                    'error'
                  )

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

      {/* =====================================================
          STEP 2 - Course & Sessions
      ===================================================== */}

      {step === 2 && (
        <div className="space-y-6 w-full">

          {/* Course Information */}

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">

            <div className="flex flex-col lg:flex-row gap-6 items-start border-b border-gray-100 pb-6">

              {course.image ? (
                <div className="relative w-full lg:w-72 h-48 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100 bg-gray-100">

                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="space-y-3 flex-1">

                <h2 className="text-xl sm:text-2xl font-black text-[#1D3557]">
                  {course.title}
                </h2>

                {course.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {course.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-6 text-sm font-semibold text-[#1D3557] pt-2">

                  <span className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">

                    <HiOutlineAcademicCap className="w-5 h-5 text-[#457B9D]" />

                    مربی: {course.trainerName || 'نامشخص'}
                  </span>

                  <span className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">

                    <HiOutlineCalendar className="w-5 h-5 text-[#457B9D]" />

                    شروع: {formatToShamsi(
                      selectedGymClass?.startDate
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Details */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm">

              <div className="space-y-1">

                <span className="text-gray-500 block">
                  عنوان دوره:
                </span>

                <span className="font-bold text-[#1D3557] truncate block">
                  {course.title}
                </span>
              </div>

              <div className="space-y-1">

                <span className="text-gray-500 block">
                  نام مربی:
                </span>

                <span className="font-bold text-[#1D3557] truncate block">
                  {course.trainerName || '-'}
                </span>
              </div>

              <div className="space-y-1">

                <span className="text-gray-500 block">
                  مدت دوره:
                </span>

                <span className="font-bold text-[#1D3557] block">
                  {course.durationDays} روز
                </span>
              </div>

              <div className="space-y-1">

                <span className="text-gray-500 block">
                  تعداد جلسات:
                </span>

                <span className="font-bold text-[#1D3557] block">
                  {course.totalSessions} جلسه
                </span>
              </div>

              <div className="space-y-1">

                <span className="text-gray-500 block">
                  قیمت دوره:
                </span>

                <span className="font-bold text-[#E63946] block">
                  {rawPrice
                    ? `${rawPrice.toLocaleString('fa-IR')} تومان`
                    : 'رایگان'}
                </span>
              </div>
            </div>

            {/* Active Status */}

            <div className="flex justify-end">

              <span
                className={`inline-flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl ${
                  course.isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <HiOutlineStatusOnline className="w-4 h-4" />

                {course.isActive
                  ? 'دوره فعال است'
                  : 'دوره غیرفعال است'}
              </span>
            </div>
          </div>

          {/* Session Selection */}

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">

            <h3 className="text-base sm:text-lg font-bold text-[#1D3557] flex items-center gap-2">

              <HiOutlineClock className="w-6 h-6 text-[#E63946]" />

              انتخاب سانس و زمان‌بندی کلاس
            </h3>

            {loadingClasses ? (
              <p className="text-sm text-gray-500 text-center py-6">
                در حال بارگذاری سانس‌ها...
              </p>
            ) : gymClasses.length === 0 ? (
              <p className="text-sm text-rose-500 text-center py-6">
                هیچ سانس فعالی یافت نشد.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">

                {gymClasses.map((gc) => (

                  <label
                    key={gc.gymClassId}
                    onClick={() =>
                      setSelectedClassId(
                        gc.gymClassId
                      )
                    }
                    className={`flex flex-col gap-5 p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedClassId === gc.gymClassId
                        ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >

                    {/* Main Session Info */}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <input
                          type="radio"
                          name="session"
                          checked={
                            selectedClassId ===
                            gc.gymClassId
                          }
                          onChange={() =>
                            setSelectedClassId(
                              gc.gymClassId
                            )
                          }
                          className="accent-[#1D3557] w-4 h-4"
                        />

                        <div>

                          <p className="text-sm font-bold text-[#1D3557]">
                            {gc.title ||
                              'سانس کلاس ورزشی'}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            مربی:{' '}
                            {gc.trainerFullName ||
                              course.trainerName ||
                              'نامشخص'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">

                        <span className="text-xs sm:text-sm text-[#E63946] font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                          ظرفیت باقی‌مانده:{' '}
                          {gc.remainingSessions}
                        </span>
                      </div>
                    </div>

                    {/* Schedule */}

                    {gc.schedules &&
                      gc.schedules.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">

                          <p className="text-xs font-bold text-[#1D3557] mb-3">
                            برنامه هفتگی:
                          </p>

                          <div className="flex flex-wrap gap-3">

                            {gc.schedules.map(
                              (
                                schedule,
                                index
                              ) => (
                                <div
                                  key={`${gc.gymClassId}-${index}`}
                                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs"
                                >

                                  <HiOutlineClock className="w-4 h-4 text-[#457B9D]" />

                                  <span className="font-bold text-[#1D3557]">
                                    {dayOfWeekFa[
                                      schedule
                                        .dayOfWeek
                                    ] ||
                                      schedule.dayOfWeek}
                                  </span>

                                  <span className="text-gray-500">
                                    {schedule.startTime}
                                  </span>

                                  <span className="text-gray-400">
                                    تا
                                  </span>

                                  <span className="text-gray-500">
                                    {schedule.endTime}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Session Details */}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">

                        <span className="text-xs text-gray-500 block">
                          ظرفیت کل
                        </span>

                        <span className="font-bold text-[#1D3557] text-sm">
                          {gc.capacity}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">

                        <span className="text-xs text-gray-500 block">
                          جلسات باقی‌مانده
                        </span>

                        <span className="font-bold text-[#1D3557] text-sm">
                          {gc.remainingSessions}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">

                        <span className="text-xs text-gray-500 block">
                          تاریخ شروع
                        </span>

                        <span className="font-bold text-[#1D3557] text-sm">
                          {formatToShamsi(
                            gc.startDate
                          )}
                        </span>
                      </div>
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
                    showAlertModal(
                      'انتخاب سانس',
                      'لطفاً یک سانس را انتخاب کنید.',
                      'error'
                    )

                    return
                  }

                  if (!course.isActive) {
                    showAlertModal(
                      'دوره غیرفعال',
                      'این دوره در حال حاضر فعال نیست.',
                      'error'
                    )

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

      {/* =====================================================
          STEP 3 - Payment
      ===================================================== */}

      {step === 3 && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-md space-y-8 w-full">

          <div className="border-b border-gray-100 pb-4">

            <h2 className="text-lg sm:text-xl font-bold text-[#1D3557] flex items-center gap-2">

              <HiOutlineCreditCard className="w-6 h-6 text-[#E63946]" />

              خلاصه فاکتور و انتخاب روش پرداخت
            </h2>
          </div>

          {/* Invoice */}

          <div className="space-y-3 text-sm text-[#1D3557] bg-gray-50 p-6 rounded-2xl border border-gray-200">

            <div className="flex justify-between py-2">

              <span className="text-gray-500">
                عنوان دوره:
              </span>

              <span className="font-bold">
                {course.title}
              </span>
            </div>

            <div className="flex justify-between py-2">

              <span className="text-gray-500">
                ورزشکار:
              </span>

              <span className="font-bold">
                {userInfo.fullName}
              </span>
            </div>

            <div className="flex justify-between py-2">

              <span className="text-gray-500">
                شماره همراه:
              </span>

              <span className="font-bold">
                {userInfo.phone}
              </span>
            </div>

            <div className="flex justify-between py-2">

              <span className="text-gray-500">
                سانس:
              </span>

              <span className="font-bold">
                {selectedGymClass?.title || '-'}
              </span>
            </div>

            <div className="flex justify-between py-2">

              <span className="text-gray-500">
                مربی:
              </span>

              <span className="font-bold">
                {selectedGymClass?.trainerFullName ||
                  course.trainerName ||
                  '-'}
              </span>
            </div>

            <div className="flex justify-between py-2">

              <span className="text-gray-500">
                مبلغ پایه:
              </span>

              <span className="font-bold">
                {rawPrice
                  ? `${rawPrice.toLocaleString(
                      'fa-IR'
                    )} تومان`
                  : 'رایگان'}
              </span>
            </div>

            <div className="flex justify-between py-4 border-t border-gray-200 text-base sm:text-lg font-black text-[#1D3557]">

              <span>
                مبلغ قابل پرداخت:
              </span>

              <span className="text-[#E63946]">
                {rawPrice
                  ? `${rawPrice.toLocaleString(
                      'fa-IR'
                    )} تومان`
                  : 'رایگان'}
              </span>
            </div>
          </div>

          {/* Payment Method */}

          <div className="space-y-6 border-t border-gray-100 pt-6">

            <h3 className="text-sm sm:text-base font-bold text-[#1D3557]">
              روش پرداخت را انتخاب کنید:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Online */}

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod('online')
                }
                className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'online'
                    ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >

                <div className="flex items-center gap-4">

                  <HiOutlineGlobeAlt className="w-6 h-6 text-[#1D3557]" />

                  <div>

                    <p className="text-sm font-bold text-[#1D3557]">
                      پرداخت آنلاین
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      اتصال مستقیم به درگاه پرداخت
                    </p>
                  </div>
                </div>

                <input
                  type="radio"
                  name="paymentMethod"
                  checked={
                    paymentMethod === 'online'
                  }
                  onChange={() =>
                    setPaymentMethod('online')
                  }
                  className="accent-[#1D3557] w-4 h-4"
                />
              </button>

              {/* Card To Card */}

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod('cardToCard')
                }
                className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  paymentMethod ===
                  'cardToCard'
                    ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >

                <div className="flex items-center gap-4">

                  <HiOutlineSwitchHorizontal className="w-6 h-6 text-[#E63946]" />

                  <div>

                    <p className="text-sm font-bold text-[#1D3557]">
                      پرداخت کارت به کارت
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      واریز به حساب باشگاه و ثبت اطلاعات واریز
                    </p>
                  </div>
                </div>

                <input
                  type="radio"
                  name="paymentMethod"
                  checked={
                    paymentMethod ===
                    'cardToCard'
                  }
                  onChange={() =>
                    setPaymentMethod(
                      'cardToCard'
                    )
                  }
                  className="accent-[#1D3557] w-4 h-4"
                />
              </button>
            </div>

            {/* =================================================
                Card To Card
            ================================================= */}

            {paymentMethod ===
              'cardToCard' && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6 mt-6">

                <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white p-6 rounded-2xl space-y-3 shadow-md">

                  <div className="flex justify-between items-center text-sm opacity-90">

                    <span>
                      شماره کارت جهت واریز:
                    </span>

                    <span>
                      بانک ملی - باشگاه ورزشی
                    </span>
                  </div>

                  <div className="text-center font-mono text-lg sm:text-xl tracking-widest font-bold py-2 flex items-center justify-center gap-2 dir-ltr">
                    <span>
                      ۶۰۳۷ - ۹۹۷۵ - ۱۲۳۴ - ۵۶۷۸
                    </span>
                  </div>

                  <div className="text-xs opacity-80 text-left dir-rtl">
                    نام صاحب حساب: مدیر مجموعه ورزشی
                  </div>
                </div>

                {/* Transfer Date */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <label className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">

                      <HiOutlineCalendar className="w-4 h-4 text-[#457B9D]" />

                      تاریخ و زمان ثبت:
                    </label>

                    <input
                      type="text"
                      readOnly
                      value={serverDateTime}
                      className="w-full bg-gray-200 border border-gray-300 rounded-2xl px-4 py-3 text-xs text-[#1D3557] font-semibold cursor-not-allowed"
                    />
                  </div>

                  {/* Last Four Digits */}

                  <div className="space-y-2">

                    <label className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">

                      <HiOutlineCreditCard className="w-4 h-4 text-[#457B9D]" />

                      ۴ رقم آخر کارت واریزکننده:
                    </label>

                    <input
                      type="text"
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="مثلاً ۵۶۷۸"
                      value={
                        cardToCardData.cardLastFourDigits
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ''
                          )

                        setCardToCardData({
                          ...cardToCardData,
                          cardLastFourDigits:
                            value,
                        })
                      }}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557] dir-ltr text-right"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

                  <p className="text-xs text-blue-700 leading-relaxed">
                    پس از واریز وجه، ۴ رقم آخر کارت
                    واریزکننده را وارد کنید. اطلاعات
                    پرداخت برای بررسی مدیریت ثبت خواهد شد.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              Buttons
          ================================================= */}

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
                {paymentMethod === 'online'
                  ? 'انتقال به درگاه و پرداخت'
                  : 'ثبت مشخصات واریز'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          Modal
      ===================================================== */}

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

              {modalConfig.type ===
                'error' && (
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-[#E63946]">
                  <HiOutlineExclamationCircle className="w-9 h-9" />
                </div>
              )}

              {modalConfig.type ===
                'success' && (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <HiOutlineCheckCircle className="w-9 h-9" />
                </div>
              )}

              {modalConfig.type ===
                'info' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#1D3557]">
                  <HiOutlineGlobeAlt className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-2">

              <h3 className="text-lg font-bold text-[#1D3557]">
                {modalConfig.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {modalConfig.message}
              </p>
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


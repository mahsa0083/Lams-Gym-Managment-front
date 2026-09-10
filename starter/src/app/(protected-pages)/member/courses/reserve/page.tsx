'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getJwtUser } from '@/utils/auth'

import { useCourseStore } from '@/store/useCourseStore'
import ApiService from '@/services/client/ApiService'

import {
  HiOutlineUser,
  HiOutlineArrowRight,
} from 'react-icons/hi'
import {  HiOutlineClock } from 'react-icons/hi';

interface ReadonlyShamsiDateTimeProps {
  label?: string;
  className?: string;
}
interface PackagePurchaseDto {
  id: number
  title: string
  price: number
  durationDays: number
  totalSessions: number
  trainerId: number
  trainerName?: string
  isActive?: boolean
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

const dayOfWeekFa: Record<string, string> = {
  Saturday: 'شنبه',
  Sunday: 'یکشنبه',
  Monday: 'دوشنبه',
  Tuesday: 'سه‌شنبه',
  Wednesday: 'چهارشنبه',
  Thursday: 'پنجشنبه',
  Friday: 'جمعه',
}

const genderFa = (gender?: string): string => {
  if (!gender) return 'نامشخص'
  if (gender.toLowerCase() === 'male') return 'مرد'
  if (gender.toLowerCase() === 'female') return 'زن'
  return gender
}

// نمایش خلاصه سانس‌های هفتگی یک کلاس، مثلاً: «شنبه ۰۸:۰۰-۰۹:۰۰ | دوشنبه ۰۸:۰۰-۰۹:۰۰»
const formatSchedules = (schedules?: ScheduleDto[]): string => {
  if (!schedules || schedules.length === 0) return 'زمان‌بندی ثبت نشده'

  return schedules
    .map((s) => `${dayOfWeekFa[s.dayOfWeek] || s.dayOfWeek} ${s.startTime}-${s.endTime}`)
    .join(' | ')
}

export default function CourseReservationPage() {
  const router = useRouter()

  const { data: session, status } = useSession()

  const { selectedCourse } = useCourseStore()

  // --------------------------------------------------
  // Stable primitive values
  // --------------------------------------------------

  const accessToken =
    (session as any)?.accessToken as string | undefined

  const selectedCourseId =
    (selectedCourse as any)?.id as number | undefined

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    nationalCode: '',
    gender: '',
    birthDate: '',
    joinDate: '',
  })

  const [packageData, setPackageData] =
    useState<PackagePurchaseDto | null>(null)

  const [loadingPackage, setLoadingPackage] =
    useState<boolean>(true)

  const [gymClasses, setGymClasses] =
    useState<GymClassDto[]>([])

  const [selectedClassId, setSelectedClassId] =
    useState<number>(0)

  const [loadingClasses, setLoadingClasses] =
    useState<boolean>(false)

  const [paymentMethod, setPaymentMethod] =
    useState<'online' | 'cardToCard'>('online')

  const [serverDateTime, setServerDateTime] =
    useState<string>('در حال دریافت...')

  const [cardToCardData, setCardToCardData] = useState({
    cardLastFourDigits: '',
  })

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

  // --------------------------------------------------
  // Loop guard
  // --------------------------------------------------
  // کلید فچ فعلی رو نگه می‌داریم؛ اگر همون ترکیب token+course دوباره
  // به افکت برسه (مثلاً به‌خاطر رفرش سشن یا رندر اضافه‌ی استور)،
  // دوباره فچ نمی‌کنیم و از حلقه‌ی درخواست جلوگیری می‌کنیم.
  const fetchedKeyRef = useRef<string | null>(null)

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

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

  const getData = <T,>(response: any): T => {
    return (
      response?.data?.data ??
      response?.data ??
      response
    ) as T
  }

  // ==================================================
  // 1. LOAD USER + PACKAGE
  // ==================================================

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status !== 'authenticated') {
      setLoadingPackage(false)
      return
    }

    if (!accessToken) {
      setLoadingPackage(false)
      return
    }

    if (!selectedCourseId) {
      setPackageData(null)
      setLoadingPackage(false)
      return
    }

    // گارد ضد-حلقه: اگر دقیقاً همین ترکیب قبلاً فچ شده، دوباره فچ نکن
    const fetchKey = `${accessToken}:${selectedCourseId}`
    if (fetchedKeyRef.current === fetchKey) {
      return
    }
    fetchedKeyRef.current = fetchKey

    let cancelled = false

    const fetchPageData = async () => {
      setLoadingPackage(true)

      try {
        // ==================================================
        // USER PROFILE
        // ==================================================

        try {
          const jwtUser = getJwtUser(accessToken)
          const userId = jwtUser?.id

          if (userId) {
            const profileRes =
              await ApiService.get<UserProfileDto>(
                `/members/${userId}`
              )

            if (cancelled) return

            const profile =
              getData<UserProfileDto>(profileRes)

            if (profile) {
              setUserInfo({
                fullName:
                  `${profile.firstName || ''} ${profile.lastName || ''
                    }`.trim(),

                phone:
                  profile.phoneNumber || '',

                nationalCode:
                  profile.nationalCode || '',

                gender:
                  profile.gender || '',

                birthDate:
                  profile.birthDate || '',

                joinDate:
                  profile.joinDate || '',
              })
            }
          }
        } catch (error) {
          console.error(
            'Error fetching profile:',
            error
          )
        }

        if (cancelled) return

        // ==================================================
        // PACKAGE
        // ==================================================
        // توجه: /api/packages/purchase/{id} روی بک‌اند فعلی 400 برمی‌گردونه،
        // پس به‌جاش از GET /api/packages/{id} استفاده می‌کنیم که PackageDetailsDto
        // (شامل price, title, durationDays, totalSessions, trainerName, isActive) می‌ده.

        try {
          const packageRes =
            await ApiService.get<PackagePurchaseDto>(
              `/packages/${selectedCourseId}`
            )

          if (cancelled) return

          const pkg =
            getData<PackagePurchaseDto>(packageRes)

          if (pkg) {
            setPackageData({
              ...pkg,

              trainerName:
                pkg.trainerName ||
                (selectedCourse as any)?.instructor ||
                'نامشخص',

              image:
                (selectedCourse as any)?.image ||
                '/images/default.jpg',

              description:
                (selectedCourse as any)?.description ||
                '',

              isActive:
                pkg.isActive ?? true,
            })

            return
          }

          throw new Error(
            'Package API returned empty data'
          )
        } catch (error: any) {
          // این لاگ رو حتماً چک کنید: اگه status روی خطا 404 باشه یعنی
          // selectedCourseId (که از selectedCourse.id میاد) آیدی معتبر
          // پکیج در بک‌اند نیست. اگه 401/403 باشه مشکل از توکن است.
          console.error(
            '[reservation] خطا در دریافت اطلاعات پکیج از /packages/' +
            selectedCourseId,
            {
              status: error?.response?.status,
              data: error?.response?.data,
              message: error?.message,
            }
          )

          // فقط اگر API پکیج شکست خورد، از داده‌ی استور fallback می‌سازیم.
          // این fallback ناقصه (قیمت واقعی و توضیحات دقیق رو نداره) و فقط
          // برای اینکه صفحه کاملاً سفید نمونه نگه داشته شده — تا وقتی
          // ریشه‌ی خطای بالا رفع نشه، قیمت و اطلاعات اینجا قابل‌اعتماد نیستن.
          if (
            selectedCourse &&
            !cancelled
          ) {
            const fallbackPrice =
              typeof (selectedCourse as any)?.price ===
                'number'
                ? (selectedCourse as any).price
                : 0

            if (fallbackPrice === 0) {
              console.warn(
                '[reservation] fallback فعال شد و قیمت معتبری در selectedCourse پیدا نشد؛ فیلد "price" در استور را بررسی کنید.',
                selectedCourse
              )
            }

            setPackageData({
              id: selectedCourseId,

              title:
                (selectedCourse as any)?.title ||
                'دوره ورزشی',

              price: fallbackPrice,

              durationDays: 30,

              totalSessions: 12,

              trainerId: 1,

              trainerName:
                (selectedCourse as any)?.instructor ||
                'نامشخص',

              image:
                (selectedCourse as any)?.image ||
                '/images/default.jpg',

              description:
                (selectedCourse as any)?.description ||
                '',

              isActive: true,
            })
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Error loading reservation page data:',
            error
          )

          setPackageData(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingPackage(false)
        }
      }
    }

    fetchPageData()

    return () => {
      cancelled = true
    }
  }, [
    status,
    accessToken,
    selectedCourseId,
  ])

  // ==================================================
  // 2. LOAD GYM CLASSES (مخصوص همین پکیج)
  // ==================================================
  // طبق swagger: GET /api/gym-classes برمی‌گردونه ActiveGymClassDto[]
  // (همه‌ی کلاس‌های فعال باشگاه، بدون فیلتر پکیج، با فیلد id نه gymClassId)
  // اما اندپوینت درست برای این صفحه GET /api/gym-classes/{packageId}/classes
  // هست که PackageGymClassDto[] برمی‌گردونه — دقیقاً با شکل gymClassId/
  // schedules/trainerFullName که این صفحه انتظارش رو داره.

  const classesFetchedKeyRef = useRef<number | null>(null)

  useEffect(() => {
    if (!packageData?.id) {
      return
    }

    if (classesFetchedKeyRef.current === packageData.id) {
      return
    }

    let cancelled = false

    const fetchGymClasses = async () => {
      try {
        setLoadingClasses(true)

        const response =
          await ApiService.get<GymClassDto[]>(
            `/gym-classes/${packageData.id}/classes`
          )

        if (cancelled) return

        classesFetchedKeyRef.current = packageData.id

        const classes =
          getData<GymClassDto[]>(response)

        if (classes && classes.length > 0) {
          setGymClasses(classes)

          setSelectedClassId(
            (current) =>
              current ||
              classes[0].gymClassId
          )
        } else {
          setGymClasses([])
          setSelectedClassId(0)
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'خطا در دریافت سانس‌های این پکیج:',
            error
          )

          setGymClasses([])
          setSelectedClassId(0)
          // اگر شکست خورد، دوباره اجازه‌ی تلاش بده
          classesFetchedKeyRef.current = null
        }
      } finally {
        if (!cancelled) {
          setLoadingClasses(false)
        }
      }
    }

    fetchGymClasses()

    return () => {
      cancelled = true
    }
  }, [packageData?.id])

  // ==================================================
  // 3. SERVER DATE
  // ==================================================

  useEffect(() => {
    const now = new Date()

    const formattedDate =
      new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(now)

    setServerDateTime(formattedDate)
  }, [])

  // ==================================================
  // SELECTED CLASS
  // ==================================================

  const selectedGymClass =
    gymClasses.find(
      (item) =>
        item.gymClassId === selectedClassId
    )

  // ==================================================
  // PAYMENT
  // ==================================================

  const handleSubmitPayment = async () => {
    try {
      if (!packageData) {
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

      const subscriptionIdRes =
        await ApiService.post<number>(
          '/subscriptions',
          {
            packageId: packageData.id,
            gymClassId: selectedClassId,
          }
        )

      const subscriptionId =
        getData<number>(subscriptionIdRes)

      if (!subscriptionId) {
        showAlertModal(
          'خطا',
          'اشتراک با موفقیت ایجاد نشد.',
          'error'
        )
        return
      }

      if (paymentMethod === 'cardToCard') {
        const cardToCardRequest: CardToCardRequestDto = {
          subscriptionId,

          cardLastFourDigits:
            cardToCardData.cardLastFourDigits,

          transferDateTime:
            new Date().toISOString(),
        }

        await ApiService.post(
          '/Payments/card-to-card',
          cardToCardRequest
        )

        showAlertModal(
          'ثبت موفقیت‌آمیز',
          'اطلاعات پرداخت کارت به کارت با موفقیت ثبت شد و پس از بررسی توسط مدیریت فعال می‌گردد.',
          'success'
        )

        return
      }

      const paymentRes =
        await ApiService.post<PaymentResponseDto>(
          '/Payments/online',
          {
            subscriptionId,
          }
        )

      const paymentData =
        getData<PaymentResponseDto>(
          paymentRes
        )

      if (paymentData?.paymentUrl) {
        window.location.href =
          paymentData.paymentUrl
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

  // ==================================================
  // LOADING
  // ==================================================

  if (loadingPackage) {
    return (
      <div className="p-12 text-center min-h-screen flex items-center justify-center text-[#1D3557] bg-white">
        <p className="font-bold text-xl">
          در حال بارگذاری اطلاعات...
        </p>
      </div>
    )
  }

  // ==================================================
  // NO PACKAGE
  // ==================================================

  if (!packageData) {
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

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="p-4 sm:p-8 space-y-6 min-h-screen text-[#1D3557] dir-rtl w-full max-w-7xl mx-auto relative bg-white">

      {/* HEADER */}

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

        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-black text-[#1D3557]">
            مراحل ثبت رزرو کلاس ورزشی
          </h1>
          <span className="text-xs text-gray-400">
            {serverDateTime}
          </span>
        </div>
      </div>

      {/* STEPS */}

      <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 text-sm sm:text-base font-bold text-center shadow-sm">

        <div
          className={`p-3 rounded-xl transition-all ${step === 1
              ? 'bg-[#1D3557] text-white shadow'
              : 'bg-gray-50 text-[#457B9D]'
            }`}
        >
          ۱. اطلاعات ورزشکار
        </div>

        <div
          className={`p-3 rounded-xl transition-all ${step === 2
              ? 'bg-[#1D3557] text-white shadow'
              : 'bg-gray-50 text-[#457B9D]'
            }`}
        >
          ۲. اطلاعات دوره و سانس
        </div>

        <div
          className={`p-3 rounded-xl transition-all ${step === 3
              ? 'bg-[#1D3557] text-white shadow'
              : 'bg-gray-50 text-[#457B9D]'
            }`}
        >
          ۳. پرداخت
        </div>
      </div>

      {/* ==================================================
          STEP 1
      ================================================== */}

      {step === 1 && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-md space-y-8 w-full">

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#1D3557] flex items-center gap-2">
              <HiOutlineUser className="w-6 h-6 text-[#E63946]" />

              اطلاعات شخصی ورزشکار
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">
                نام و نام خانوادگی
              </label>

              <input
                type="text"
                value={userInfo.fullName}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">
                شماره همراه
              </label>

              <input
                type="text"
                value={userInfo.phone}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">
                کد ملی
              </label>

              <input
                type="text"
                value={userInfo.nationalCode}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">
                جنسیت
              </label>

              <input
                type="text"
                value={genderFa(userInfo.gender)}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1D3557]">
                تاریخ تولد
              </label>

              <input
                type="text"
                value={formatToShamsi(userInfo.birthDate)}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
              />
            </div>

            {userInfo.joinDate && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1D3557]">
                  تاریخ عضویت
                </label>

                <input
                  type="text"
                  value={formatToShamsi(userInfo.joinDate)}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-[#1D3557] focus:outline-none"
                />
              </div>
            )}

          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">

            <button
              onClick={() => setStep(2)}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-sm font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md"
            >
              تایید و مرحله بعد (انتخاب سانس)
            </button>

          </div>
        </div>
      )}

      {/* ==================================================
          STEP 2
      ================================================== */}

      {step === 2 && (
        <div className="space-y-6 w-full">

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">

            <h2 className="text-xl sm:text-2xl font-black text-[#1D3557]">
              {packageData.title}
            </h2>

            {packageData.description && (
              <p className="text-sm text-gray-600">
                {packageData.description}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block">مربی</span>
                <strong>{packageData.trainerName}</strong>
              </div>
              <div>
                <span className="text-gray-400 block">مدت اعتبار</span>
                <strong>{packageData.durationDays} روز</strong>
              </div>
              <div>
                <span className="text-gray-400 block">تعداد جلسات</span>
                <strong>{packageData.totalSessions}</strong>
              </div>
              <div>
                <span className="text-gray-400 block">قیمت</span>
                <strong>{packageData.price.toLocaleString('fa-IR')} تومان</strong>
              </div>
            </div>

          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">

            <h3 className="text-base sm:text-lg font-bold text-[#1D3557]">
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
                    className={`flex flex-col gap-2 p-5 rounded-2xl border cursor-pointer transition-all ${selectedClassId ===
                        gc.gymClassId
                        ? 'border-[#1D3557] bg-[#1D3557]/5 shadow-md'
                        : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >

                    <p className="text-sm font-bold text-[#1D3557]">
                      {gc.title}
                    </p>

                    <span className="text-xs text-gray-500">
                      مربی: {gc.trainerFullName || 'نامشخص'}
                    </span>

                    <span className="text-xs text-gray-500">
                      زمان‌بندی: {formatSchedules(gc.schedules)}
                    </span>

                    <span className="text-xs text-gray-500">
                      تاریخ شروع: {formatToShamsi(gc.startDate)}
                    </span>

                    <span className="text-xs text-gray-500">
                      ظرفیت باقی‌مانده: {gc.remainingSessions} از {gc.capacity}
                    </span>

                  </label>
                ))}

              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">

              <button
                onClick={() => setStep(1)}
                className="text-sm font-bold text-[#457B9D]"
              >
                مرحله قبل
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

                  setStep(3)
                }}
                className="bg-[#E63946] text-white text-sm font-bold px-8 py-3.5 rounded-2xl"
              >
                تایید سانس و پرداخت
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          STEP 3
      ================================================== */}

      {step === 3 && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-md space-y-8 w-full">

          <h2 className="text-lg font-bold text-[#1D3557]">
            خلاصه فاکتور و پرداخت
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>دوره</span>
              <strong>
                {packageData.title}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>قیمت</span>
              <strong>
                {packageData.price.toLocaleString(
                  'fa-IR'
                )}{' '}
                تومان
              </strong>
            </div>

            {selectedGymClass && (
              <>
                <div className="flex justify-between">
                  <span>سانس</span>
                  <strong>
                    {selectedGymClass.title}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>زمان‌بندی</span>
                  <strong>
                    {formatSchedules(selectedGymClass.schedules)}
                  </strong>
                </div>
              </>
            )}

          </div>

          <div className="pt-6 border-t border-gray-100 space-y-4">

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod('online')
                }
                className={`flex-1 py-4 rounded-2xl border font-bold ${paymentMethod === 'online'
                    ? 'border-[#1D3557] bg-[#1D3557] text-white'
                    : 'border-gray-200 text-[#1D3557]'
                  }`}
              >
                پرداخت آنلاین
              </button>

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod('cardToCard')
                }
                className={`flex-1 py-4 rounded-2xl border font-bold ${paymentMethod ===
                    'cardToCard'
                    ? 'border-[#1D3557] bg-[#1D3557] text-white'
                    : 'border-gray-200 text-[#1D3557]'
                  }`}
              >
                کارت به کارت
              </button>

            </div>

            {paymentMethod === 'cardToCard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* فیلد ۴ رقم آخر کارت */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    ۴ رقم آخر کارت واریزکننده
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={cardToCardData.cardLastFourDigits}
                    onChange={(e) =>
                      setCardToCardData((prev) => ({
                        ...prev,
                        cardLastFourDigits: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1D3557] text-sm"
                    placeholder="مثلاً ۱۲۳۴"
                  />
                </div>

                {/* فیلد تاریخ و زمان جاری (ReadOnly) */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    تاریخ و ساعت تراکنش
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      value={
                        typeof window !== 'undefined'
                          ? new Intl.DateTimeFormat('fa-IR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                          }).format(new Date())
                          : ''
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-10 text-sm font-medium text-gray-600 select-none cursor-default focus:outline-none"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D3557] pointer-events-none">
                      <HiOutlineClock className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">

            <button
              onClick={() => setStep(2)}
              className="text-sm font-bold text-[#457B9D]"
            >
              مرحله قبل
            </button>

            <button
              onClick={handleSubmitPayment}
              className="bg-[#E63946] text-white text-sm font-bold px-10 py-3.5 rounded-2xl"
            >
              پرداخت نهایی
            </button>

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL
      ================================================== */}

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 text-center">

            <h3 className="text-lg font-bold text-[#1D3557]">
              {modalConfig.title}
            </h3>

            <p className="text-sm text-gray-600">
              {modalConfig.message}
            </p>

            <button
              onClick={closeModal}
              className="w-full bg-[#1D3557] text-white py-3.5 rounded-2xl"
            >
              متوجه شدم
            </button>

          </div>

        </div>
      )}

    </div>
  )
}
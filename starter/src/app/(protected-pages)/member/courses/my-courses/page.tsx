'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getJwtUser } from '@/utils/auth'
import ApiService from '@/services/client/ApiService'
import { useCourseStore, Course } from '@/store/useCourseStore'
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi'

interface ScheduleDTO {
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface AttendanceDTO {
  attendanceDate: string
  isPresent: boolean
}

interface CourseEnrollmentDTO {
  enrollmentId: number
  classId: number
  classTitle: string
  groupName: string
  sportName: string
  trainerFullName: string
  schedules?: ScheduleDTO[]
  attendances?: AttendanceDTO[]
  image?: string
  price?: number
  isExpired?: boolean
  packageName: string
  remainingSessions: number
  status: string
  totalSessions: number
}

interface MemberDetailsDTO {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  gender: string
  birthDate: string
  joinDate: string
  medicalNotes: string
  emergencyPhone: string
  isActive: boolean
  subscriptions: CourseEnrollmentDTO[]
}

interface StatusInfo {
  text: string
  className: string
}

export default function MyCoursesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const renewCourse = useCourseStore((state) => state.renewCourse)

  const [memberData, setMemberData] =
    useState<MemberDetailsDTO | null>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const accessToken = (session as any)?.accessToken as string | undefined

  const getData = <T,>(response: any): T => {
    return (response?.data?.data ??
      response?.data ??
      response) as T
  }

  const getStatusInfo = (courseStatus?: string): StatusInfo => {
    const normalizedStatus = courseStatus?.toLowerCase().trim()

     switch (normalizedStatus) {
      case 'active':
      case 'Success':
      case 'approved':
      case 'تایید شده':
      case 'confirmed':
      case 'تایید':
        return {
          text: 'فعال',
          className: 'bg-green-100 text-green-700',
        }

      case 'expired':
      case 'منقضی':
      case 'منقضی شده':
        return {
          text: 'منقضی شده',
          className: 'bg-red-100 text-red-700',
        }
        case 'PendingApproval':
        return {
          text: ' در انتظار تایید',
          className: 'bg-red-100 text-red-700',
        }
         case 'Failed':
        return {
          text: 'خطا در پرداخت',
          className: 'bg-red-100 text-red-700',
        }


      case 'PendingPayment':
      case 'در انتظار':
      case 'در انتظار تأیید':
      case 'در انتظار تایید':
        return {
          text: 'در انتظار پرداخت',
          className: 'bg-yellow-100 text-yellow-700',
        }

      case 'cancelled':
      case 'canceled':
      case 'لغو شده':
      case 'لغو':
        return {
          text: 'لغو شده',
          className: 'bg-gray-100 text-gray-600',
        }

      case 'rejected':
      case 'رد شده':
      case 'Rejected':
        return {
          text: 'رد شده',
          className: 'bg-red-100 text-red-700',
        }

      default:
        return {
          text: courseStatus || 'نامشخص',
          className: 'bg-gray-100 text-gray-600',
        }
    }
  }

  const loadMemberDetails = async (token: string) => {
    try {
      setLoading(true)
      setError(null)

      const jwtUser = getJwtUser(token)

      if (!jwtUser.id) {
        throw new Error('شناسه کاربر در JWT پیدا نشد.')
      }

      const currentMemberId = jwtUser.id

      const response = await ApiService.get<MemberDetailsDTO>(
        `/members/${currentMemberId}/details`,
      )

      const data = getData<MemberDetailsDTO>(response)

      setMemberData({
        ...data,
        subscriptions: data?.subscriptions ?? [],
      })
    } catch (err: any) {
      console.error('Member Details API Error:', err)

      setError(
        err?.message || 'خطا در دریافت اطلاعات دوره‌های کاربر',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status !== 'authenticated') {
      setLoading(false)
      setError('برای مشاهده اطلاعات، ابتدا وارد حساب کاربری شوید.')
      return
    }

    if (!accessToken) {
      setLoading(false)
      setError('توکن دسترسی در Session پیدا نشد.')
      return
    }

    let cancelled = false

    const fetchData = async () => {
      if (cancelled) {
        return
      }

      await loadMemberDetails(accessToken)
    }

    fetchData().catch((fetchError) => {
      if (!cancelled) {
        console.error('Error loading member courses:', fetchError)
      }
    })

    return () => {
      cancelled = true
    }
  }, [status, accessToken])

 const handleRenew = (courseDto: CourseEnrollmentDTO) => {
  const courseToRenew: Course = {
    id: courseDto.classId,
    title: courseDto.classTitle,
    description: `گروه: ${courseDto.groupName} - رشته: ${courseDto.sportName}`,
    instructor: courseDto.trainerFullName,
    category: courseDto.sportName,
    level: courseDto.groupName,
    schedules: courseDto.schedules,
    attendances: courseDto.attendances,
    // مقادیر پیش‌فرض
    image: '/images/default.jpg',
    duration: 'یک ماهه',
    startDate: '---',
    price: '۰ تومان',
    capacity: 'نامشخص',
    isFull: false,
    location: courseDto.groupName,
    features: [],
    prerequisites: 'ندارد',
  };

  renewCourse(courseToRenew);
  router.push('/member/courses/reserve');
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 flex items-center justify-center dir-rtl">
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-700">
            در حال بارگذاری اطلاعات دوره‌ها...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 flex items-center justify-center dir-rtl">
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
          <p className="text-sm font-bold text-[#E63946]">
            {error}
          </p>
        </div>
      </div>
    )
  }

  const subscriptions = memberData?.subscriptions ?? []

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto bg-gray-50/50 p-4 sm:p-8 space-y-6 text-gray-900 dir-rtl">
      {/* هدر صفحه */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gray-100 rounded-2xl text-gray-800">
            <HiOutlineAcademicCap className="w-8 h-8 text-[#E63946]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              دوره‌های من
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              کاربر گرامی:{' '}
              {memberData?.firstName || '---'}{' '}
              {memberData?.lastName || ''} | لیست کلاس‌های فعال و سوابق ثبت‌نام
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 self-start sm:self-auto">
          کل دوره‌ها: {subscriptions.length} مورد
        </div>
      </div>

      {/* لیست دوره‌ها */}
      <div className="space-y-6">
        {subscriptions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-700">
              هیچ دوره‌ای برای شما ثبت نشده است.
            </p>
          </div>
        ) : (
          subscriptions.map((course) => {
            const isExpired = course.isExpired ?? false
            const schedules = course.schedules ?? []
            const statusInfo = getStatusInfo(course.status)

            return (
              <div
                key={course.enrollmentId}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  isExpired
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-gray-100'
                }`}
              >
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  {/* عنوان و وضعیت */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {course.packageName || 'دوره بدون عنوان'}
                    </h2>

                    {isExpired ? (
                      <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                        <HiOutlineExclamationCircle className="w-4 h-4" />
                        اشتراک پایان یافته
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        اشتراک فعال
                      </span>
                    )}
                  </div>

                  {/* نام پکیج */}
                  

                  {/* اطلاعات دوره */}
                  <div className="flex items-center gap-3 sm:gap-6 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <HiOutlineUserCircle className="w-4 h-4 text-gray-400" />
                      مربی:
                      <strong className="text-gray-800">
                        {course.trainerFullName || 'نامشخص'}
                      </strong>
                    </span>

                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-semibold">
                      رشته: {course.sportName || '---'}
                    </span>

                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-semibold">
                      گروه: {course.groupName || '---'}
                    </span>

                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-semibold">
                      جلسات: {course.totalSessions ?? 0}
                    </span>

                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-semibold">
                      جلسات باقی‌مانده:{' '}
                      {course.remainingSessions ?? 0}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${statusInfo.className}`}
                    >
                      وضعیت پرداخت: {statusInfo.text}
                    </span>
                  </div>

                  {/* برنامه هفتگی */}
                  <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-3">
                    <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                      برنامه‌های هفتگی کلاس:
                    </p>

                    {schedules.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {schedules.map((schedule, index) => (
                          <div
                            key={`${schedule.dayOfWeek}-${schedule.startTime}-${index}`}
                            className="bg-white p-3 rounded-xl border border-gray-200/50 text-xs flex items-center justify-between gap-3"
                          >
                            <span className="font-bold text-gray-800">
                              {schedule.dayOfWeek || '---'}
                            </span>

                            <span className="text-gray-500 flex items-center gap-1 dir-ltr whitespace-nowrap">
                              <HiOutlineClock className="w-3.5 h-3.5 text-gray-400" />
                              {schedule.startTime || '--:--'} -{' '}
                              {schedule.endTime || '--:--'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 bg-white/60 p-3 rounded-xl border border-dashed border-gray-200 text-center">
                        برنامه زمانی مشخصی برای این دوره ثبت نشده است.
                      </div>
                    )}
                  </div>

                  {/* دکمه‌های عملیاتی */}
                  <div className="flex flex-wrap items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    {isExpired && (
                      <button
                        type="button"
                        onClick={() => handleRenew(course)}
                        className="flex items-center gap-2 text-xs font-bold bg-[#E63946] hover:bg-[#c92f3b] text-white px-6 py-3 rounded-2xl transition-all shadow-sm"
                      >
                        تمدید اشتراک دوره
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

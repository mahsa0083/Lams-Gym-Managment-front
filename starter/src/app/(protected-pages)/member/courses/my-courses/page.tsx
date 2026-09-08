'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useCourseStore, Course } from '@/store/useCourseStore'
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineClipboardCheck,
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
  schedules: ScheduleDTO[]
  attendances: AttendanceDTO[]
  image?: string
  price?: number
  isExpired?: boolean
}

interface MemberCoursesDTO {
  memberId: number
  firstName: string
  lastName: string
  nationalCode: string
  courses: CourseEnrollmentDTO[]
}

const mockMemberData: MemberCoursesDTO = {
  memberId: 101,
  firstName: 'مهسا',
  lastName: 'میرزایی',
  nationalCode: '۰۰۱2345678',
  courses: [
    {
      enrollmentId: 1,
      classId: 10,
      classTitle: 'دوره تخصصی بدنسازی و فرم‌دهی بدنی',
      groupName: 'پیشرفته آقایان/بانوان',
      sportName: 'بدنسازی',
      trainerFullName: 'استاد علی رضایی',
      image: '/images/bodybuilding.jpg',
      price: 1200000,
      isExpired: false,
      schedules: [
        { dayOfWeek: 'شنبه', startTime: '۱۶:۰۰', endTime: '۱۷:۳۰' },
        { dayOfWeek: 'دوشنبه', startTime: '۱۶:۰۰', endTime: '۱۷:۳۰' },
        { dayOfWeek: 'چهارشنبه', startTime: '۱۶:۰۰', endTime: '۱۷:۳۰' },
      ],
      attendances: [
        { attendanceDate: '2026-09-01', isPresent: true },
        { attendanceDate: '2026-09-03', isPresent: true },
        { attendanceDate: '2026-09-06', isPresent: true },
      ],
    },
    {
      enrollmentId: 2,
      classId: 11,
      classTitle: 'دوره آرامش و انعطاف‌پذیری یوگا',
      groupName: 'مقدماتی',
      sportName: 'یوگا',
      trainerFullName: 'استاد مریم امیری',
      image: '/images/yoga.jpg',
      price: 950000,
      isExpired: true,
      schedules: [
        { dayOfWeek: 'یکشنبه', startTime: '۱۷:۰۰', endTime: '۱۸:۳۰' },
        { dayOfWeek: 'سه‌شنبه', startTime: '۱۷:۰۰', endTime: '۱۸:۳۰' },
      ],
      attendances: [
        { attendanceDate: '2026-08-10', isPresent: true },
        { attendanceDate: '2026-08-12', isPresent: false },
      ],
    },
  ],
}

export default function MyCoursesPage() {
  const router = useRouter()
  const renewCourse = useCourseStore((state) => state.renewCourse)

  const handleRenew = (courseDto: CourseEnrollmentDTO) => {
    const courseToRenew: Course = {
      id: courseDto.classId,
      title: courseDto.classTitle,
      description: `گروه: ${courseDto.groupName} - ورزش: ${courseDto.sportName}`,
      instructor: courseDto.trainerFullName,
      duration: 'یک ماهه',
      startDate: '---',
      price: courseDto.price ? courseDto.price.toLocaleString('fa-IR') + ' تومان' : '۰۰۰ تومان',
      category: courseDto.sportName,
      image: courseDto.image || '/images/default.jpg',
      level: courseDto.groupName,
      capacity: 'نامشخص',
      isFull: false,
      location: courseDto.groupName,
      features: [],
      prerequisites: 'ندارد',
    }

    renewCourse(courseToRenew)
    router.push('/member/courses/reserve')
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50/50 min-h-screen text-gray-900 dir-rtl w-full max-w-7xl mx-auto">
      {/* هدر صفحه */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gray-100 rounded-2xl text-gray-800">
            <HiOutlineAcademicCap className="w-8 h-8 text-[#E63946]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">دوره‌های من</h1>
            <p className="text-sm text-gray-500 mt-1">
              کاربر گرامی: {mockMemberData.firstName} {mockMemberData.lastName} | لیست کلاس‌های فعال و سوابق ثبت‌نام
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 self-start sm:self-auto">
          کل دوره‌ها: {mockMemberData.courses.length} مورد
        </div>
      </div>

      {/* لیست کارت‌های دوره‌ها */}
      <div className="space-y-6">
        {mockMemberData.courses.map((course) => {
          const isExpired = course.isExpired ?? false

          return (
            <div
              key={course.enrollmentId}
              className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                isExpired ? 'border-rose-200 bg-rose-50/10' : 'border-gray-100'
              }`}
            >
              <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-between">
                
                {/* اطلاعات اصلی و برنامه‌ها */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {course.classTitle}
                    </h2>
                    {isExpired ? (
                      <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                        <HiOutlineExclamationCircle className="w-4 h-4" /> اشتراک پایان یافته
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                        <HiOutlineCheckCircle className="w-4 h-4" /> اشتراک فعال
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <HiOutlineUserCircle className="w-4 h-4 text-gray-400" />
                      مربی: <strong className="text-gray-800">{course.trainerFullName}</strong>
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-semibold">
                      رشته: {course.sportName} ({course.groupName})
                    </span>
                  </div>

                  {/* بخش جدول روزها و ساعت‌های برگزاری */}
                  <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                      <HiOutlineCalendar className="w-4 h-4 text-gray-400" /> برنامه‌های هفتگی کلاس:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {course.schedules.map((schedule, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200/50 text-xs flex items-center justify-between">
                          <span className="font-bold text-gray-800">{schedule.dayOfWeek}</span>
                          <span className="text-gray-500 flex items-center gap-1 dir-ltr">
                            <HiOutlineClock className="w-3.5 h-3.5 text-gray-400" />
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* دکمه‌های عملیاتی پایین کارت */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                    
                    {/* دکمه حضور و غیاب غیرفعال شده همراه با Blur و برچسب به زودی (کد اصلی کامنت شد) */}
                    <div className="relative inline-block">
                      <button
                        disabled
                        className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 cursor-not-allowed select-none blur-[0.8px] opacity-70"
                      >
                        <HiOutlineClipboardCheck className="w-4 h-4 text-gray-400" />
                        مشاهده سوابق حضور و غیاب ({course.attendances.length} جلسه ثبت شده)
                      </button>
                      <span className="absolute inset-0 flex items-center justify-center font-extrabold text-xs text-gray-700 bg-white/60 rounded-2xl backdrop-blur-[0.5px] shadow-2xs">
                        به زودی...
                      </span>
                    </div>

                    {/* کد اصلی کامنت شده حضور و غیاب:
                    <button
                      onClick={() => router.push('/member/attendance')}
                      className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 transition-all"
                    >
                      <HiOutlineClipboardCheck className="w-4 h-4 text-gray-500" />
                      مشاهده سوابق حضور و غیاب ({course.attendances.length} جلسه ثبت شده)
                    </button>
                    */}

                    {isExpired && (
                      <button
                        onClick={() => handleRenew(course)}
                        className="flex items-center gap-2 text-xs font-bold bg-[#E63946] hover:bg-[#E63946]/90 text-white px-6 py-3 rounded-2xl transition-all shadow-sm"
                      >
                        تمدید اشتراک دوره
                      </button>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
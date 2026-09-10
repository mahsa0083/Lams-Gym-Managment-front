'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineBadgeCheck,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineUserGroup,
    HiOutlineX,
    HiOutlineCreditCard,
} from 'react-icons/hi'
import { BiDumbbell } from 'react-icons/bi'
import ApiService from '@/services/client/ApiService'
import { getJwtUser } from '@/utils/auth'

/* =========================
   Types
========================= */

interface Schedule {
    id?: number
    dayOfWeek: string
    startTime: string
    endTime: string
}

interface PackageClassItem {
    gymClassId: number
    title: string
    capacity: number
    startDate: string
    remainingSessions: number
    trainerFullName: string
    schedules: Schedule[]
}

interface PackageItem {
    id: number
    title: string
    trainerName: string
    durationDays: number
    totalSessions: number
    price: number
}

interface Subscription {
    subscriptionId: number
    packageName: string
    trainerFullName: string
    startDate: string
    endDate: string
    totalSessions: number
    remainingSessions: number
    status: string
}

interface Attendance {
    attendanceDate: string
    isPresent: boolean
}

interface MemberCourseItem {
    enrollmentId: number
    classId: number
    classTitle: string
    groupName: string
    sportName: string
    trainerFullName: string
    schedules: Schedule[]
    attendances: Attendance[]
}

interface MemberCoursesResponse {
    memberId: number
    firstName: string
    lastName: string
    nationalCode: string
    courses: MemberCourseItem[]
}

interface MemberProfile {
    id: number
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
    gender: string
    birthDate: string
    joinDate: string
}

interface MemberDetails extends MemberProfile {
    medicalNotes?: string
    emergencyPhone?: string
    isActive?: boolean
    subscriptions: Subscription[]
    courses: MemberCourseItem[]
}

interface Payment {
    packageName: string
    trainerFirstName: string
    trainerLastName: string
    amount: number
    paymentMethod: string
    paidAt: string
}

/* =========================
   Constants
========================= */

const API_IMAGES = [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
]

/* =========================
   Helpers
========================= */

const getData = <T,>(response: any): T => {
    return (response?.data?.data ?? response?.data ?? response) as T
}

const getArray = <T,>(response: any): T[] => {
    const value = getData<any>(response)
    if (Array.isArray(value)) return value
    if (Array.isArray(value?.items)) return value.items
    return []
}

const formatDate = (value?: string) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date)
}

const formatMoney = (value: number) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`

const formatTime = (value?: string) => {
    if (!value) return ''
    return value.length >= 5 ? value.slice(0, 5) : value
}

const getDayLabel = (day?: string) => {
    const map: Record<string, string> = {
        Saturday: 'شنبه',
        Sunday: 'یکشنبه',
        Monday: 'دوشنبه',
        Tuesday: 'سه‌شنبه',
        Wednesday: 'چهارشنبه',
        Thursday: 'پنج‌شنبه',
        Friday: 'جمعه',
    }
    return day ? map[day] || day : ''
}

export default function MemberDashboard() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const sliderRef = useRef<HTMLDivElement>(null)

    const [memberId, setMemberId] = useState<number | null>(null)
    const [member, setMember] = useState<MemberDetails | null>(null)
    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null)
    const [memberCourses, setMemberCourses] = useState<MemberCourseItem[]>([])
    const [packages, setPackages] = useState<PackageItem[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // استیت‌های مربوط به انتخاب پکیج و دریافت کلاس‌های آن
    const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null)
    const [packageClasses, setPackageClasses] = useState<PackageClassItem[]>([])
    const [loadingClasses, setLoadingClasses] = useState(false)
    const [classesError, setClassesError] = useState('')

    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const accessToken = (session as any)?.accessToken as string | undefined

    const loadDashboard = async (token: string) => {
        try {
            setLoading(true)
            setError('')

            const jwtUser = getJwtUser(token)
            if (!jwtUser.id) throw new Error('شناسه کاربر در JWT پیدا نشد.')
            if (jwtUser.role === null) throw new Error('Role کاربر در JWT پیدا نشد.')

            const currentMemberId = jwtUser.id
            setMemberId(currentMemberId)

            const [
                memberProfileResponse,
                memberDetailsResponse,
                memberCoursesResponse,
                packageResponse,
                paymentResponse,
            ] = await Promise.all([
                ApiService.get<MemberProfile>(`/members/${currentMemberId}?role=${jwtUser.role}`),
                ApiService.get<MemberDetails>(`/members/${currentMemberId}/details`),
                ApiService.get<MemberCoursesResponse>(`/members/${currentMemberId}/courses`),
                ApiService.get<PackageItem[]>('/packages'),
                ApiService.get<Payment[]>(`/members/${currentMemberId}/payments`),
            ])

            const apiMemberProfile = getData<MemberProfile>(memberProfileResponse)
            const memberDetails = getData<MemberDetails>(memberDetailsResponse)
            const apiMemberCoursesData = getData<MemberCoursesResponse>(memberCoursesResponse)
            const apiPackages = getArray<PackageItem>(packageResponse)
            const apiPayments = getArray<Payment>(paymentResponse)

            if (!apiMemberProfile) throw new Error('اطلاعات پروفایل دریافت نشد.')

            setMemberProfile(apiMemberProfile)

            const extractedCourses = apiMemberCoursesData?.courses || memberDetails?.courses || []
            setMemberCourses(extractedCourses)

            if (memberDetails) {
                setMember({
                    ...memberDetails,
                    firstName: apiMemberProfile.firstName,
                    lastName: apiMemberProfile.lastName,
                    id: apiMemberProfile.id,
                    subscriptions: memberDetails.subscriptions || [],
                    courses: extractedCourses,
                })
            } else {
                setMember({
                    ...apiMemberProfile,
                    subscriptions: [],
                    courses: extractedCourses,
                    medicalNotes: '',
                    emergencyPhone: '',
                    isActive: false,
                })
            }

            setPackages(apiPackages)
            setPayments(apiPayments.slice().reverse())
        } catch (err: any) {
            const responseStatus = err?.response?.status
            if (responseStatus === 401) {
                setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.')
            } else if (responseStatus === 403) {
                setError('شما اجازه دسترسی به اطلاعات این صفحه را ندارید.')
            } else {
                setError(
                    err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    err?.message ||
                    'دریافت اطلاعات از API با خطا مواجه شد.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    // دریافت کلاس‌های یک پکیج
    const handleOpenPackageDetails = async (pkg: PackageItem) => {
        setSelectedPackage(pkg)
        setLoadingClasses(true)
        setClassesError('')
        setPackageClasses([])

        try {
            const response = await ApiService.get<PackageClassItem[]>(`/gym-classes/${pkg.id}/classes`)
            const classesData = getArray<PackageClassItem>(response)
            setPackageClasses(classesData)
        } catch (err: any) {
            setClassesError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                'دریافت اطلاعات کلاس‌های این پکیج با خطا مواجه شد.'
            )
        } finally {
            setLoadingClasses(false)
        }
    }

    useEffect(() => {
        if (status === 'loading') return
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
        const fetchDashboard = async () => {
            try {
                await loadDashboard(accessToken)
            } catch (error) {
                if (!cancelled) console.error('Error loading dashboard:', error)
            }
        }

        fetchDashboard()
        return () => {
            cancelled = true
        }
    }, [status, accessToken])

    // محاسبه اشتراک فعال
    const activeSubscription = useMemo(() => {
        if (!member?.subscriptions?.length) return null
        return (
            member.subscriptions.find((item) => {
                const status = item.status?.toLowerCase()
                return status !== 'expired' && status !== 'cancelled'
            }) || member.subscriptions[0]
        )
    }, [member])

    // محاسبه روزهای باقی‌مانده از اشتراک فعال
    const daysRemaining = useMemo(() => {
        if (!activeSubscription?.endDate) return 0
        const end = new Date(activeSubscription.endDate)
        if (Number.isNaN(end.getTime())) return 0
        const diff = end.getTime() - Date.now()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }, [activeSubscription])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!sliderRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - sliderRef.current.offsetLeft)
        setScrollLeft(sliderRef.current.scrollLeft)
    }

    const handleMouseLeaveOrUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return
        e.preventDefault()
        const x = e.pageX - sliderRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        sliderRef.current.scrollLeft = scrollLeft - walk
    }

    const scrollByButtons = (direction: 'left' | 'right') => {
        if (!sliderRef.current) return
        const amount = 320
        sliderRef.current.scrollTo({
            left: direction === 'right' ? sliderRef.current.scrollLeft + amount : sliderRef.current.scrollLeft - amount,
            behavior: 'smooth',
        })
    }

    const fullName = memberProfile?.firstName || memberProfile?.lastName
        ? `${memberProfile?.firstName || ''} ${memberProfile?.lastName || ''}`.trim()
        : 'کاربر'

    return (
        <div dir="rtl" className="p-4 sm:p-6 space-y-6 min-h-screen text-[#1D3557]">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm">
                    {error}
                    <button
                        onClick={() => {
                            if (error.includes('وارد') || error.includes('منقضی')) {
                                router.push('/sign-in')
                            } else if (accessToken) {
                                loadDashboard(accessToken)
                            }
                        }}
                        className="mr-3 font-bold underline"
                    >
                        تلاش مجدد
                    </button>
                </div>
            )}

            {/* بخش خوش‌آمدگویی و پروفایل */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E63946] shrink-0">
                        <Image src={API_IMAGES[3]} alt="تصویر کاربر" fill className="object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#1D3557]">
                            خوش آمدی،
                            <span className="text-[#E63946]">{loading ? '...' : fullName}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-[#457B9D] mt-1">امروز برای رسیدن به اهدافت آماده‌ای؟</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-[#A8DADC] text-[#1D3557] px-4 py-3 rounded-xl self-start md:self-auto w-full md:w-auto">
                    <HiOutlineBadgeCheck className="w-6 h-6 shrink-0 text-[#E63946]" />
                    <div>
                        <div className="text-sm font-bold">
                            {activeSubscription ? 'اشتراک فعال' : 'بدون اشتراک فعال'}
                        </div>
                        <div className="text-xs text-[#457B9D]">
                            {activeSubscription?.packageName || 'برای شروع، یک اشتراک انتخاب کنید'}
                        </div>
                    </div>
                </div>
            </div>

            {/* کارت‌های آماری */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#457B9D] flex items-center justify-center shrink-0">
                        <HiOutlineCalendar className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold">روزهای باقی‌مانده (از جزئیات)</span>
                        <div className="text-2xl font-black text-[#1D3557]">
                            {loading ? '...' : `${daysRemaining} روز`}
                        </div>
                    </div>
                </div>

                <div className="relative bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                        <span className="bg-[#1D3557] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md">به‌زودی</span>
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0 filter blur-sm">
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
                            <circle cx="24" cy="24" r="20" stroke="#457B9D" strokeWidth="4" strokeDasharray={125} strokeDashoffset={60} strokeLinecap="round" fill="transparent" />
                        </svg>
                        <span className="absolute text-xs font-bold text-[#1D3557]">۵۰٪</span>
                    </div>
                    <div className="filter blur-sm">
                        <span className="text-xs text-[#457B9D] font-semibold">میزان حضور</span>
                        <div className="text-2xl font-black text-[#1D3557]">۵۰٪</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4 sm:col-span-2 md:col-span-1">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#457B9D] flex items-center justify-center shrink-0">
                        <BiDumbbell className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold">کلاس‌های رزرو شده (مجموع)</span>
                        <div className="text-2xl font-black text-[#1D3557]">
                            {loading ? '...' : `${memberCourses.length} کلاس`}
                        </div>
                    </div>
                </div>
            </div>

            {/* کارت اشتراک فعال */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-[#457B9D]">اشتراک فعال و روزهای باقی‌مانده</span>
                            {activeSubscription && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                                    {daysRemaining} روز تا پایان
                                </span>
                            )}
                        </div>

                        {activeSubscription ? (
                            <div className="flex flex-col sm:flex-row gap-5 items-center bg-gray-50 p-4 rounded-xl border border-[#A8DADC]/30">
                                <div className="relative w-full sm:w-36 h-32 rounded-lg overflow-hidden shrink-0">
                                    <Image src={API_IMAGES[0]} alt={activeSubscription.packageName} fill className="object-cover" />
                                </div>
                                <div className="space-y-2 w-full">
                                    <h3 className="text-xl font-black text-[#1D3557]">{activeSubscription.packageName}</h3>
                                    <div className="text-xs text-[#E63946] font-bold">مربی: {activeSubscription.trainerFullName}</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-[#457B9D]">
                                        <span>شروع: {formatDate(activeSubscription.startDate)}</span>
                                        <span>پایان: {formatDate(activeSubscription.endDate)}</span>
                                        <span>جلسات کل: {activeSubscription.totalSessions}</span>
                                        <span>باقی‌مانده جلسات: {activeSubscription.remainingSessions}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-[#A8DADC]/40 rounded-xl p-6 text-center text-sm text-[#457B9D]">
                                هنوز اشتراک فعالی برای حساب شما ثبت نشده است.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#A8DADC]/40">
                        <button
                            onClick={() => router.push('/member/courses')}
                            className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm"
                        >
                            رزرو دوره جدید
                        </button>
                        <button
                            onClick={() =>
                                activeSubscription
                                    ? router.push(`/member/profile?subscriptionId=${activeSubscription.subscriptionId}`)
                                    : router.push('/member/profile')
                            }
                            className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-[#1D3557] font-bold py-3 px-4 rounded-xl transition-all text-sm"
                        >
                            مشاهده پروفایل و اشتراک
                        </button>
                    </div>
                </div>

                <div className="relative lg:col-span-5 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                        <span className="bg-[#1D3557] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md">به‌زودی</span>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-4 filter blur-sm">
                            <span className="text-xs font-bold text-[#457B9D]">سوابق اخیر حضور</span>
                        </div>
                        <div className="space-y-3 filter blur-sm">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20">
                                <div>
                                    <div className="text-xs font-bold text-[#1D3557]">کلاس بدنسازی عمومی</div>
                                    <div className="text-[11px] text-[#457B9D] mt-1">۱۴۰۵/۰۶/۱۵ • مربی نمونه</div>
                                </div>
                                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* لیست پکیج‌های باشگاه (از /packages) */}
            <div className="bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#1D3557]">پکیج‌ها و دوره‌های باشگاه</h2>
                        <p className="text-xs text-[#457B9D] mt-0.5">پکیج مورد نظر خود را برای مشاهده کلاس‌ها انتخاب کنید.</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => scrollByButtons('right')}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollByButtons('left')}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-sm text-[#457B9D]">در حال دریافت پکیج‌ها...</div>
                ) : !packages.length ? (
                    <div className="py-12 text-center text-sm text-slate-400">پکیج فعالی یافت نشد.</div>
                ) : (
                    <div
                        ref={sliderRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeaveOrUp}
                        onMouseUp={handleMouseLeaveOrUp}
                        onMouseMove={handleMouseMove}
                        className="flex gap-5 overflow-x-auto py-2 px-1 cursor-grab active:cursor-grabbing select-none no-scrollbar"
                        style={{ touchAction: 'pan-x' }}
                    >
                        {packages.map((pkg, index) => (
                            <div
                                key={pkg.id}
                                onClick={() => handleOpenPackageDetails(pkg)}
                                className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] bg-gray-50 border border-[#A8DADC]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between shrink-0 group cursor-pointer"
                            >
                                <div>
                                    <div className="relative w-full h-36 overflow-hidden">
                                        <Image
                                            src={API_IMAGES[index % API_IMAGES.length]}
                                            alt={pkg.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                        />
                                        <span className="absolute top-3 right-3 bg-[#E63946] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                            {pkg.durationDays} روزه
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <h3 className="font-black text-sm text-[#1D3557] line-clamp-1">{pkg.title}</h3>
                                        <p className="text-xs text-[#457B9D]">مربی: {pkg.trainerName || 'ثبت نشده'}</p>
                                        <div className="pt-2 border-t border-[#A8DADC]/40 space-y-1.5 text-xs text-[#1D3557]">
                                            <div className="flex items-center gap-1.5 text-[#457B9D]">
                                                <BiDumbbell className="w-4 h-4 text-[#E63946] shrink-0" />
                                                <span>{pkg.totalSessions} جلسه تمرینی</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#457B9D]">
                                                <HiOutlineCreditCard className="w-4 h-4 text-[#2A9D8F] shrink-0" />
                                                <span className="font-bold text-[#E63946]">{formatMoney(pkg.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenPackageDetails(pkg)
                                        }}
                                        className="w-full bg-[#1D3557] text-white font-bold py-2 rounded-xl text-xs hover:bg-[#1D3557]/90 transition-colors"
                                    >
                                        مشاهده کلاس‌ها و جزئیات
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* آخرین پرداخت‌ها */}
            <div className="bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#1D3557]">آخرین پرداخت‌ها</h2>
                        <p className="text-xs text-[#457B9D] mt-1">نمایش سوابق پرداخت‌های عضو (از جدیدترین به قدیمی‌ترین).</p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-xs text-slate-400 py-8 text-center">در حال دریافت...</p>
                ) : payments.length ? (
                    <div className="overflow-x-auto">
                        <div className="min-w-[650px]">
                            <div className="grid grid-cols-5 gap-3 bg-gray-50 rounded-xl p-3 text-[11px] font-bold text-[#457B9D]">
                                <span>پکیج</span>
                                <span>مربی</span>
                                <span>مبلغ</span>
                                <span>روش پرداخت</span>
                                <span>تاریخ</span>
                            </div>
                            <div className="space-y-2 mt-2">
                                {payments.slice(0, 5).map((payment, index) => (
                                    <div
                                        key={`${payment.paidAt}-${index}`}
                                        className="grid grid-cols-5 gap-3 p-3 rounded-xl border border-[#A8DADC]/20 text-xs text-[#1D3557] items-center"
                                    >
                                        <span className="font-bold">{payment.packageName}</span>
                                        <span>{payment.trainerFirstName} {payment.trainerLastName}</span>
                                        <span className="font-bold text-[#E63946]">{formatMoney(payment.amount)}</span>
                                        <span>{payment.paymentMethod}</span>
                                        <span>{formatDate(payment.paidAt)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 py-8 text-center">سابقه پرداختی برای این عضو ثبت نشده است.</p>
                )}
            </div>

            {/* مودال جزئیات پکیج و دریافت کلاس‌های آن از /gym-classes/{packageId}/classes */}
            {/* مودال جزئیات پکیج و کلاس‌های آن */}
            {selectedPackage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedPackage(null)}
                >
                    <div
                        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#A8DADC] max-h-[90vh] flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هدر مودال */}
                        <div className="p-5 border-b border-[#A8DADC]/30 flex items-center justify-between bg-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-[#1D3557]">{selectedPackage.title}</h3>
                                <p className="text-xs text-[#457B9D] mt-1">
                                    مربی: {selectedPackage.trainerName || 'ثبت نشده'} • {selectedPackage.totalSessions} جلسه ({selectedPackage.durationDays} روزه)
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPackage(null)}
                                className="bg-white text-[#1D3557] p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* بدنه مودال و لیست کلاس‌های پکیج */}
                        <div className="p-6 overflow-y-auto space-y-4 no-scrollbar">
                            <div className="flex items-center justify-between bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs">
                                <span className="font-bold text-[#1D3557]">شهریه پکیج:</span>
                                <span className="font-black text-[#E63946] text-sm">{formatMoney(selectedPackage.price)}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <h4 className="font-bold text-sm text-[#1D3557] flex items-center gap-1.5">
                                    <BiDumbbell className="w-5 h-5 text-[#E63946]" />
                                    کلاس‌های این پکیج
                                </h4>
                            </div>

                            {loadingClasses ? (
                                <div className="py-8 text-center text-sm text-[#457B9D]">در حال دریافت لیست کلاس‌ها...</div>
                            ) : classesError ? (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
                                    {classesError}
                                </div>
                            ) : packageClasses.length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-400 bg-gray-50 rounded-xl">
                                    هیچ کلاسی برای این پکیج ثبت نشده است.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {packageClasses.map((cls) => (
                                        <div
                                            key={cls.gymClassId}
                                            className="p-4 rounded-xl border border-[#A8DADC]/40 bg-gray-50/70 hover:bg-gray-50 transition-colors space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <span className="font-bold text-sm text-[#1D3557]">{cls.title}</span>
                                                    <div className="text-xs text-[#457B9D] mt-0.5">مربی: {cls.trainerFullName}</div>
                                                </div>

                                                {/* دکمه قرمز رزرو دوره برای هر کلاس با ارسال شناسه پکیج و کلاس */}
                                                <button
                                                    onClick={() => {
                                                        router.push(`/member/courses/reserve?packageId=${selectedPackage.id}&classId=${cls.gymClassId}`)
                                                    }}
                                                    disabled={cls.capacity <= 0}
                                                    className="bg-[#E63946] hover:bg-[#E63946]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm shrink-0 self-start sm:self-auto"
                                                >
                                                    {cls.capacity <= 0 ? 'تکمیل ظرفیت' : 'رزرو دوره'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#457B9D] pt-1">
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-[#E63946] shrink-0" />
                                                    <span>ظرفیت: {cls.capacity} نفر</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineCalendar className="w-4 h-4 text-[#E63946] shrink-0" />
                                                    <span>شروع: {formatDate(cls.startDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <BiDumbbell className="w-4 h-4 text-[#E63946] shrink-0" />
                                                    <span>جلسات باقیمانده: {cls.remainingSessions}</span>
                                                </div>
                                            </div>

                                            {/* زمان‌بندی‌های کلاس */}
                                            {cls.schedules && cls.schedules.length > 0 && (
                                                <div className="pt-2 border-t border-gray-200/60 flex flex-wrap gap-2">
                                                    {cls.schedules.map((sch, sIdx) => (
                                                        <span
                                                            key={sIdx}
                                                            className="inline-flex items-center gap-1 text-[11px] bg-white border border-[#A8DADC]/40 text-[#1D3557] px-2.5 py-1 rounded-lg"
                                                        >
                                                            <HiOutlineClock className="w-3.5 h-3.5 text-[#E63946]" />
                                                            {getDayLabel(sch.dayOfWeek)}: {formatTime(sch.startTime)} تا {formatTime(sch.endTime)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* فوتر مودال همراه با دکمه رزرو مستقیم کل پکیج */}
                        <div className="p-4 border-t border-[#A8DADC]/30 bg-white flex items-center justify-between gap-3">
                            <button
                                onClick={() => {
                                    router.push(`/member/courses/reserve?packageId=${selectedPackage.id}`)
                                }}
                                className="bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md"
                            >
                                رزرو دوره (این پکیج)
                            </button>
                            <button
                                onClick={() => setSelectedPackage(null)}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1D3557] font-bold rounded-xl text-xs transition-colors"
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

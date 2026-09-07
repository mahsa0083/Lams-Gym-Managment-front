'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineBadgeCheck,
    HiOutlineCheck,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineUserGroup,
    HiOutlineX,
    HiOutlineInformationCircle,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineGlobeAlt,
    HiOutlineSwitchHorizontal,
    HiOutlineArrowRight,
} from 'react-icons/hi'
import { BiDumbbell } from 'react-icons/bi'
import ApiService from '@/services/client/ApiService'

type Role = 'ADMIN' | 'TRAINER' | 'MEMBER' | null

interface Schedule {
    id?: number
    dayOfWeek: string
    startTime: string
    endTime: string
}

interface ApiCourse {
    id: number
    title: string
    groupName?: string
    trainerName?: string
    sportName?: string
    capacity?: number
    remainingCapacity?: number
    startDate?: string
    schedules?: Schedule[]
}

interface Course extends ApiCourse {
    instructor: string
    time: string
    capacityText: string
    image: string
    tag: string
    description: string
    prerequisites: string
    features: string[]
    price: string
    location?: string
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

interface MemberCourse {
    enrollmentId: number
    classId: number
    classTitle: string
    groupName: string
    sportName: string
    trainerFullName: string
    schedules: Schedule[]
    attendances: Attendance[]
}

interface MemberDetails {
    id: number
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
    gender: string
    birthDate: string
    joinDate: string
    medicalNotes?: string
    emergencyPhone?: string
    isActive?: boolean
    subscriptions: Subscription[]
    courses: MemberCourse[]
}

interface Payment {
    packageName: string
    trainerFirstName: string
    trainerLastName: string
    amount: number
    paymentMethod: string
    paidAt: string
}

interface PackageItem {
    id: number
    title: string
    trainerName: string
    durationDays: number
    totalSessions: number
    price: number
}

interface UserIdentity {
    id: number
    role: Role
}

const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

const NAME_IDENTIFIER_CLAIM =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

const API_IMAGES = [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
]

const getData = <T,>(response: any): T => {
    return (response?.data?.data ?? response?.data ?? response) as T
}

const getArray = <T,>(response: any): T[] => {
    const value = getData<any>(response)

    if (Array.isArray(value)) {
        return value
    }

    if (Array.isArray(value?.items)) {
        return value.items
    }

    return []
}

const parseJwt = (token: string): Record<string, any> | null => {
    try {
        const parts = token.split('.')

        if (parts.length < 2) {
            return null
        }

        const payload = parts[1]

        const base64 = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '=',
        )

        return JSON.parse(
            decodeURIComponent(
                atob(padded)
                    .split('')
                    .map(
                        (char) =>
                            '%' +
                            ('00' + char.charCodeAt(0).toString(16)).slice(-2),
                    )
                    .join(''),
            ),
        )
    } catch {
        return null
    }
}

const normalizeRole = (value: any): Role => {
    if (Array.isArray(value)) {
        value = value[0]
    }

    if (value === null || value === undefined) {
        return null
    }

    const normalized = String(value)
        .trim()
        .toUpperCase()

    if (
        normalized === '1' ||
        normalized === 'ADMIN' ||
        normalized === 'ROLE_ADMIN'
    ) {
        return 'ADMIN'
    }

    if (
        normalized === '2' ||
        normalized === 'TRAINER' ||
        normalized === 'ROLE_TRAINER'
    ) {
        return 'TRAINER'
    }

    if (
        normalized === '3' ||
        normalized === 'MEMBER' ||
        normalized === 'ROLE_MEMBER'
    ) {
        return 'MEMBER'
    }

    return null
}

const getStoredValue = (keys: string[]): string | null => {
    if (typeof window === 'undefined') {
        return null
    }

    for (const key of keys) {
        try {
            const localValue = localStorage.getItem(key)

            if (localValue && localValue.trim()) {
                return localValue
            }
        } catch {}

        try {
            const sessionValue = sessionStorage.getItem(key)

            if (sessionValue && sessionValue.trim()) {
                return sessionValue
            }
        } catch {}
    }

    return null
}

const getStoredUser = (): any | null => {
    if (typeof window === 'undefined') {
        return null
    }

    const keys = [
        'user',
        'currentUser',
        'authUser',
        'userData',
        'loggedInUser',
        'profile',
    ]

    for (const key of keys) {
        try {
            const localValue = localStorage.getItem(key)

            if (localValue) {
                const parsed = JSON.parse(localValue)

                if (parsed && typeof parsed === 'object') {
                    return parsed?.data ?? parsed?.user ?? parsed
                }
            }
        } catch {}

        try {
            const sessionValue = sessionStorage.getItem(key)

            if (sessionValue) {
                const parsed = JSON.parse(sessionValue)

                if (parsed && typeof parsed === 'object') {
                    return parsed?.data ?? parsed?.user ?? parsed
                }
            }
        } catch {}
    }

    return null
}

const getIdentityFromToken = (): UserIdentity | null => {
    if (typeof window === 'undefined') {
        return null
    }

    /*
     * اول توکن را از تمام کلیدهای رایج پیدا می‌کنیم.
     */
    const token = getStoredValue([
        'accessToken',
        'access_token',
        'token',
        'jwt',
        'access-token',
    ])

    /*
     * اگر توکن وجود داشت، اطلاعات را از JWT می‌خوانیم.
     */
    if (token) {
        const payload = parseJwt(token)

        if (payload) {
            const idValue =
                payload[NAME_IDENTIFIER_CLAIM] ??
                payload['nameid'] ??
                payload.sub ??
                payload.userId ??
                payload.user_id ??
                payload.id ??
                payload.memberId ??
                payload.member_id

            const roleValue =
                payload[ROLE_CLAIM] ??
                payload.role ??
                payload.roles ??
                payload.Role ??
                payload.userRole ??
                payload.user_role

            const role = normalizeRole(roleValue)

            const id = Number(idValue)

            if (Number.isFinite(id) && id > 0 && role) {
                return {
                    id,
                    role,
                }
            }
        }
    }

    /*
     * اگر JWT قابل استفاده نبود، اطلاعات user ذخیره‌شده را بررسی می‌کنیم.
     */
    const storedUser = getStoredUser()

    if (storedUser) {
        const idValue =
            storedUser.id ??
            storedUser.userId ??
            storedUser.user_id ??
            storedUser.memberId ??
            storedUser.member_id

        const roleValue =
            storedUser.role ??
            storedUser.roles ??
            storedUser.Role ??
            storedUser.userRole ??
            storedUser.user_role

        const id = Number(idValue)
        const role = normalizeRole(roleValue)

        if (Number.isFinite(id) && id > 0 && role) {
            return {
                id,
                role,
            }
        }
    }

    /*
     * بعضی پروژه‌ها فقط userId و role را جداگانه ذخیره می‌کنند.
     */
    const storedId = getStoredValue([
        'userId',
        'user_id',
        'memberId',
        'member_id',
    ])

    const storedRole = getStoredValue([
        'role',
        'userRole',
        'user_role',
    ])

    const id = Number(storedId)
    const role = normalizeRole(storedRole)

    if (Number.isFinite(id) && id > 0 && role) {
        return {
            id,
            role,
        }
    }

    return null
}

const formatDate = (value?: string) => {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date)
}

const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString('fa-IR')} تومان`

const formatTime = (value?: string) => {
    if (!value) {
        return ''
    }

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

const getCourseTime = (schedules?: Schedule[]) => {
    if (!schedules?.length) {
        return 'زمان‌بندی ثبت نشده'
    }

    return schedules
        .slice(0, 2)
        .map(
            (item) =>
                `${getDayLabel(item.dayOfWeek)} ${formatTime(item.startTime)} الی ${formatTime(item.endTime)}`,
        )
        .join(' | ')
}

const mapCourse = (
    item: ApiCourse,
    index: number,
    packages: PackageItem[],
): Course => {
    const trainer = item.trainerName || 'مربی ثبت نشده'

    const matchedPackage = packages.find(
        (pkg) =>
            pkg.trainerName &&
            trainer &&
            pkg.trainerName.trim() === trainer.trim(),
    )

    const remaining = Number(item.remainingCapacity ?? 0)
    const capacity = Number(item.capacity ?? 0)

    return {
        ...item,
        instructor: trainer,
        time: getCourseTime(item.schedules),
        capacityText:
            remaining <= 0
                ? 'تکمیل ظرفیت'
                : `ظرفیت ${remaining} نفر`,
        image: API_IMAGES[index % API_IMAGES.length],
        tag: remaining <= 0 ? 'تکمیل ظرفیت' : 'ظرفیت فعال',
        description:
            `کلاس ${item.title || 'ورزشی'} در گروه ${item.groupName || 'عمومی'}، ` +
            `رشته ${item.sportName || 'ورزشی'} و تحت نظر ${trainer} برگزار می‌شود.`,
        prerequisites: 'طبق قوانین و شرایط ثبت‌نام باشگاه',
        features: [
            'برنامه تمرینی متناسب با دوره',
            'ثبت حضور در سامانه',
            'دسترسی به اطلاعات زمان‌بندی کلاس',
            'پیگیری وضعیت ظرفیت',
        ],
        price: matchedPackage
            ? formatMoney(matchedPackage.price)
            : 'قیمت در پکیج',
        location: 'طبق اطلاعات ثبت‌شده در باشگاه',
    }
}

export default function MemberDashboard() {
    const router = useRouter()
    const sliderRef = useRef<HTMLDivElement>(null)

    const [identity, setIdentity] = useState<UserIdentity | null>(null)
    const [member, setMember] = useState<MemberDetails | null>(null)
    const [courses, setCourses] = useState<Course[]>([])
    const [packages, setPackages] = useState<PackageItem[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [activeBookingCourse, setActiveBookingCourse] =
        useState<Course | null>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const loadDashboard = async () => {
        try {
            setLoading(true)
            setError('')

            /*
             * نکته مهم:
             * دیگر فقط accessToken بررسی نمی‌شود.
             * getIdentityFromToken تمام محل‌های رایج ذخیره auth را بررسی می‌کند.
             */
            const currentIdentity = getIdentityFromToken()

            console.log('Member Dashboard identity:', currentIdentity)

            if (!currentIdentity) {
                setError(
                    'اطلاعات ورود کاربر پیدا نشد. لطفاً دوباره وارد حساب شوید.',
                )
                setLoading(false)
                return
            }

            setIdentity(currentIdentity)

            if (currentIdentity.role !== 'MEMBER') {
                setError(
                    `این صفحه برای عضو طراحی شده است. نقش فعلی شما: ${currentIdentity.role}`,
                )
                setLoading(false)
                return
            }

            const [
                memberDetailsResponse,
                courseResponse,
                packageResponse,
                paymentResponse,
            ] = await Promise.all([
                ApiService.get<MemberDetails>(
                    `/members/${currentIdentity.id}/details`,
                ),

                ApiService.get<ApiCourse[]>('/gym-classes'),

                ApiService.get<PackageItem[]>('/packages'),

                ApiService.get<Payment[]>(
                    `/members/${currentIdentity.id}/payments`,
                ),
            ])

            const memberDetails =
                getData<MemberDetails>(memberDetailsResponse)

            const apiCourses =
                getArray<ApiCourse>(courseResponse)

            const apiPackages =
                getArray<PackageItem>(packageResponse)

            const apiPayments =
                getArray<Payment>(paymentResponse)

            if (!memberDetails) {
                throw new Error(
                    'اطلاعات عضو از API دریافت نشد.',
                )
            }

            setMember({
                ...memberDetails,
                subscriptions:
                    memberDetails?.subscriptions || [],
                courses:
                    memberDetails?.courses || [],
            })

            setPackages(apiPackages)
            setPayments(apiPayments)

            setCourses(
                apiCourses.map((course, index) =>
                    mapCourse(
                        course,
                        index,
                        apiPackages,
                    ),
                ),
            )
        } catch (err: any) {
            console.error(
                'خطا در دریافت اطلاعات داشبورد عضو:',
                err,
            )

            const status = err?.response?.status

            if (status === 401) {
                setError(
                    'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
                )
            } else if (status === 403) {
                setError(
                    'شما اجازه دسترسی به اطلاعات این صفحه را ندارید.',
                )
            } else {
                setError(
                    err?.response?.data?.detail ||
                        err?.response?.data?.message ||
                        err?.message ||
                        'دریافت اطلاعات از API با خطا مواجه شد.',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    const activeSubscription = useMemo(() => {
        if (!member?.subscriptions?.length) {
            return null
        }

        return (
            member.subscriptions.find(
                (item) =>
                    item.status?.toLowerCase() !== 'expired' &&
                    item.status?.toLowerCase() !== 'cancelled',
            ) || member.subscriptions[0]
        )
    }, [member])

    const attendanceStats = useMemo(() => {
        const attendance = (member?.courses || []).flatMap(
            (course) => course.attendances || [],
        )

        const total = attendance.length

        const present = attendance.filter(
            (item) => item.isPresent,
        ).length

        return {
            total,
            present,
            percentage: total
                ? Math.round((present / total) * 100)
                : 0,
        }
    }, [member])

    const daysRemaining = useMemo(() => {
        if (!activeSubscription?.endDate) {
            return 0
        }

        const end = new Date(
            activeSubscription.endDate,
        )

        if (Number.isNaN(end.getTime())) {
            return 0
        }

        const diff =
            end.getTime() - Date.now()

        return Math.max(
            0,
            Math.ceil(
                diff /
                    (1000 *
                        60 *
                        60 *
                        24),
            ),
        )
    }, [activeSubscription])

    const recentAttendance = useMemo(() => {
        return (member?.courses || [])
            .flatMap((course) =>
                (course.attendances || []).map(
                    (attendance) => ({
                        id: `${course.enrollmentId}-${attendance.attendanceDate}`,
                        date: attendance.attendanceDate,
                        class: course.classTitle,
                        trainer:
                            course.trainerFullName,
                        isPresent:
                            attendance.isPresent,
                    }),
                ),
            )
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime(),
            )
            .slice(0, 5)
    }, [member])

    const handleStartBooking = (
        course?: Course,
    ) => {
        const targetCourse =
            course || courses[0]

        if (!targetCourse) {
            return
        }

        setSelectedCourse(null)
        setActiveBookingCourse(targetCourse)
    }

    const handleMouseDown = (
        e: React.MouseEvent,
    ) => {
        if (!sliderRef.current) {
            return
        }

        setIsDragging(true)

        setStartX(
            e.pageX -
                sliderRef.current
                    .offsetLeft,
        )

        setScrollLeft(
            sliderRef.current.scrollLeft,
        )
    }

    const handleMouseLeaveOrUp = () =>
        setIsDragging(false)

    const handleMouseMove = (
        e: React.MouseEvent,
    ) => {
        if (
            !isDragging ||
            !sliderRef.current
        ) {
            return
        }

        e.preventDefault()

        const x =
            e.pageX -
            sliderRef.current.offsetLeft

        const walk =
            (x - startX) * 1.5

        sliderRef.current.scrollLeft =
            scrollLeft - walk
    }

    const scrollByButtons = (
        direction: 'left' | 'right',
    ) => {
        if (!sliderRef.current) {
            return
        }

        const amount = 320

        sliderRef.current.scrollTo({
            left:
                direction === 'right'
                    ? sliderRef.current
                          .scrollLeft +
                      amount
                    : sliderRef.current
                          .scrollLeft -
                      amount,
            behavior: 'smooth',
        })
    }

    const fullName =
        member?.firstName ||
        member?.lastName
            ? `${member.firstName || ''} ${
                  member.lastName || ''
              }`.trim()
            : 'کاربر'

    if (activeBookingCourse) {
        return (
            <CourseReservationPage
                course={activeBookingCourse}
                memberId={
                    member?.id ||
                    identity?.id ||
                    0
                }
                packages={packages}
                onBack={() =>
                    setActiveBookingCourse(
                        null,
                    )
                }
                onCompleted={loadDashboard}
            />
        )
    }

    return (
        <div className="p-6 space-y-6 dir-rtl bg-[#F1FAEE] min-h-screen text-[#1D3557]">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm">
                    {error}

                    <button
                        onClick={() => {
                            if (
                                error.includes(
                                    'وارد',
                                ) ||
                                error.includes(
                                    'منقضی',
                                )
                            ) {
                                router.push(
                                    '/sign-in',
                                )
                            } else {
                                setLoading(true)
                                loadDashboard()
                            }
                        }}
                        className="mr-3 font-bold underline"
                    >
                        تلاش مجدد
                    </button>
                </div>
            )}

            {/* هدر */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E63946] shrink-0">
                        <Image
                            src={
                                API_IMAGES[3]
                            }
                            alt="تصویر کاربر"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1D3557]">
                            خوش آمدی،
                            <span className="text-[#E63946]">
                                {loading
                                    ? '...'
                                    : fullName}
                            </span>
                        </h1>

                        <p className="text-sm text-[#457B9D] mt-1">
                            امروز برای رسیدن به اهدافت آماده‌ای؟
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#A8DADC]/30 border border-[#A8DADC] text-[#1D3557] px-4 py-3 rounded-xl self-start md:self-auto">
                    <HiOutlineBadgeCheck className="w-6 h-6 shrink-0 text-[#E63946]" />

                    <div>
                        <div className="text-sm font-bold">
                            {activeSubscription
                                ? 'اشتراک فعال'
                                : 'بدون اشتراک فعال'}
                        </div>

                        <div className="text-xs text-[#457B9D]">
                            {activeSubscription?.packageName ||
                                'برای شروع، یک اشتراک انتخاب کنید'}
                        </div>
                    </div>
                </div>
            </div>

            {/* آمار */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center shrink-0">
                        <HiOutlineCalendar className="w-6 h-6" />
                    </div>

                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold">
                            روزهای باقی‌مانده
                        </span>

                        <div className="text-2xl font-black text-[#1D3557]">
                            {loading
                                ? '...'
                                : `${daysRemaining} روز`}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="#F1FAEE"
                                strokeWidth="4"
                                fill="transparent"
                            />

                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="#457B9D"
                                strokeWidth="4"
                                strokeDasharray={125}
                                strokeDashoffset={
                                    125 -
                                    (125 *
                                        attendanceStats.percentage) /
                                        100
                                }
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>

                        <span className="absolute text-xs font-bold text-[#1D3557]">
                            {loading
                                ? '...'
                                : `${attendanceStats.percentage}%`}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold">
                            میزان حضور
                        </span>

                        <div className="text-2xl font-black text-[#1D3557]">
                            {loading
                                ? '...'
                                : `${attendanceStats.percentage}%`}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center shrink-0">
                        <BiDumbbell className="w-6 h-6" />
                    </div>

                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold">
                            کلاس‌های رزرو شده
                        </span>

                        <div className="text-2xl font-black text-[#1D3557]">
                            {loading
                                ? '...'
                                : `${
                                      member?.courses
                                          ?.length ||
                                      0
                                  } کلاس`}
                        </div>
                    </div>
                </div>
            </div>

            {/* اشتراک و حضور */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <div className="text-xs font-bold text-[#457B9D] mb-4">
                            اشتراک فعال
                        </div>

                        {activeSubscription ? (
                            <div className="flex flex-col sm:flex-row gap-5 items-center bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/30">
                                <div className="relative w-full sm:w-36 h-32 rounded-lg overflow-hidden shrink-0">
                                    <Image
                                        src={
                                            API_IMAGES[0]
                                        }
                                        alt={
                                            activeSubscription.packageName
                                        }
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="space-y-2 w-full">
                                    <h3 className="text-xl font-black text-[#1D3557]">
                                        {
                                            activeSubscription.packageName
                                        }
                                    </h3>

                                    <div className="text-xs text-[#E63946] font-bold">
                                        مربی:{' '}
                                        {
                                            activeSubscription.trainerFullName
                                        }
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-[#457B9D]">
                                        <span>
                                            شروع:{' '}
                                            {formatDate(
                                                activeSubscription.startDate,
                                            )}
                                        </span>

                                        <span>
                                            پایان:{' '}
                                            {formatDate(
                                                activeSubscription.endDate,
                                            )}
                                        </span>

                                        <span>
                                            جلسات:{' '}
                                            {
                                                activeSubscription.totalSessions
                                            }
                                        </span>

                                        <span>
                                            باقی‌مانده:{' '}
                                            {
                                                activeSubscription.remainingSessions
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#F1FAEE] border border-[#A8DADC]/40 rounded-xl p-6 text-center text-sm text-[#457B9D]">
                                هنوز اشتراک فعالی برای حساب شما ثبت نشده است.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#A8DADC]/40">
                        <button
                            onClick={() =>
                                handleStartBooking()
                            }
                            disabled={
                                !courses.length
                            }
                            className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm"
                        >
                            رزرو دوره جدید
                        </button>

                        <button
                            onClick={() =>
                                activeSubscription
                                    ? router.push(
                                          `/member/profile?subscriptionId=${activeSubscription.subscriptionId}`,
                                      )
                                    : router.push(
                                          '/member/profile',
                                      )
                            }
                            className="flex-1 bg-[#A8DADC]/30 hover:bg-[#A8DADC]/50 active:scale-[0.98] text-[#1D3557] font-bold py-3 px-4 rounded-xl transition-all text-sm"
                        >
                            مشاهده پروفایل و اشتراک
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[#457B9D]">
                            سوابق اخیر حضور
                        </span>
                    </div>

                    {loading ? (
                        <p className="text-xs text-slate-400 text-center py-8">
                            در حال دریافت اطلاعات...
                        </p>
                    ) : recentAttendance.length ? (
                        <div className="space-y-3">
                            {recentAttendance.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20"
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-[#1D3557]">
                                                {
                                                    item.class
                                                }
                                            </div>

                                            <div className="text-[11px] text-[#457B9D] mt-1">
                                                {formatDate(
                                                    item.date,
                                                )}

                                                {item.trainer
                                                    ? ` • ${item.trainer}`
                                                    : ''}
                                            </div>
                                        </div>

                                        {item.isPresent ? (
                                            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <HiOutlineX className="w-5 h-5 text-rose-500" />
                                        )}
                                    </div>
                                ),
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-8">
                            هنوز سابقه حضوری ثبت نشده است.
                        </p>
                    )}
                </div>
            </div>

            {/* کلاس‌ها */}
            <div className="bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#1D3557]">
                            رزرو دوره‌ها و کلاس‌های باشگاه
                        </h2>

                        <p className="text-xs text-[#457B9D] mt-0.5">
                            اطلاعات این بخش مستقیماً از API کلاس‌های فعال دریافت می‌شود.
                        </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() =>
                                scrollByButtons(
                                    'right',
                                )
                            }
                            className="p-2 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/40 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() =>
                                scrollByButtons(
                                    'left',
                                )
                            }
                            className="p-2 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/40 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-sm text-[#457B9D]">
                        در حال دریافت کلاس‌ها از API...
                    </div>
                ) : !courses.length ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                        هیچ کلاس فعالی از API دریافت نشد.
                    </div>
                ) : (
                    <div
                        ref={sliderRef}
                        onMouseDown={
                            handleMouseDown
                        }
                        onMouseLeave={
                            handleMouseLeaveOrUp
                        }
                        onMouseUp={
                            handleMouseLeaveOrUp
                        }
                        onMouseMove={
                            handleMouseMove
                        }
                        className="flex gap-5 overflow-x-auto py-2 px-1 cursor-grab active:cursor-grabbing select-none no-scrollbar"
                        style={{
                            touchAction:
                                'pan-x',
                        }}
                    >
                        {courses.map(
                            (course) => (
                                <div
                                    key={
                                        course.id
                                    }
                                    onClick={() =>
                                        setSelectedCourse(
                                            course,
                                        )
                                    }
                                    className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] bg-[#F1FAEE] border border-[#A8DADC]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between shrink-0 group cursor-pointer"
                                >
                                    <div>
                                        <div className="relative w-full h-36 overflow-hidden">
                                            <Image
                                                src={
                                                    course.image
                                                }
                                                alt={
                                                    course.title
                                                }
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                            />

                                            <span className="absolute top-3 right-3 bg-[#E63946] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                {
                                                    course.tag
                                                }
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <h3 className="font-black text-sm text-[#1D3557] line-clamp-1">
                                                {
                                                    course.title
                                                }
                                            </h3>

                                            <p className="text-xs text-[#457B9D]">
                                                {
                                                    course.instructor
                                                }
                                            </p>

                                            <div className="pt-2 border-t border-[#A8DADC]/40 space-y-1.5 text-xs text-[#1D3557]">
                                                <div className="flex items-start gap-1.5 text-[#457B9D]">
                                                    <HiOutlineClock className="w-4 h-4 text-[#E63946] shrink-0" />

                                                    <span>
                                                        {
                                                            course.time
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[#457B9D]">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-[#E63946]" />

                                                    <span>
                                                        {
                                                            course.capacityText
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 pt-0">
                                        <button
                                            onClick={(
                                                e,
                                            ) => {
                                                e.stopPropagation()
                                                setSelectedCourse(
                                                    course,
                                                )
                                            }}
                                            className="w-full bg-[#1D3557] text-white font-bold py-2 rounded-xl text-xs"
                                        >
                                            مشاهده جزئیات کامل
                                        </button>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>

            {/* پرداخت‌های اخیر */}
            <div className="bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#1D3557]">
                            آخرین پرداخت‌ها
                        </h2>

                        <p className="text-xs text-[#457B9D] mt-1">
                            اطلاعات این بخش از endpoint پرداخت‌های عضو خوانده می‌شود.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-xs text-slate-400 py-8 text-center">
                        در حال دریافت...
                    </p>
                ) : payments.length ? (
                    <div className="overflow-x-auto">
                        <div className="min-w-[650px]">
                            <div className="grid grid-cols-5 gap-3 bg-[#F1FAEE] rounded-xl p-3 text-[11px] font-bold text-[#457B9D]">
                                <span>
                                    پکیج
                                </span>

                                <span>
                                    مربی
                                </span>

                                <span>
                                    مبلغ
                                </span>

                                <span>
                                    روش پرداخت
                                </span>

                                <span>
                                    تاریخ
                                </span>
                            </div>

                            <div className="space-y-2 mt-2">
                                {payments
                                    .slice(
                                        0,
                                        5,
                                    )
                                    .map(
                                        (
                                            payment,
                                            index,
                                        ) => (
                                            <div
                                                key={`${payment.paidAt}-${index}`}
                                                className="grid grid-cols-5 gap-3 p-3 rounded-xl border border-[#A8DADC]/20 text-xs text-[#1D3557] items-center"
                                            >
                                                <span className="font-bold">
                                                    {
                                                        payment.packageName
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        payment.trainerFirstName
                                                    }{' '}
                                                    {
                                                        payment.trainerLastName
                                                    }
                                                </span>

                                                <span className="font-bold text-[#E63946]">
                                                    {formatMoney(
                                                        payment.amount,
                                                    )}
                                                </span>

                                                <span>
                                                    {
                                                        payment.paymentMethod
                                                    }
                                                </span>

                                                <span>
                                                    {formatDate(
                                                        payment.paidAt,
                                                    )}
                                                </span>
                                            </div>
                                        ),
                                    )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 py-8 text-center">
                        سابقه پرداختی برای این عضو ثبت نشده است.
                    </p>
                )}
            </div>

            {/* جزئیات دوره */}
            {selectedCourse && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedCourse(null)
                    }
                >
                    <div
                        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#A8DADC] max-h-[90vh] overflow-y-auto no-scrollbar relative"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="relative h-56 w-full">
                            <Image
                                src={
                                    selectedCourse.image
                                }
                                alt={
                                    selectedCourse.title
                                }
                                fill
                                className="object-cover"
                            />

                            <button
                                onClick={() =>
                                    setSelectedCourse(
                                        null,
                                    )
                                }
                                className="absolute top-3 left-3 bg-white/90 hover:bg-white text-[#1D3557] p-2 rounded-full transition-colors shadow-md"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>

                            <span className="absolute bottom-3 right-3 bg-[#E63946] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {
                                    selectedCourse.tag
                                }
                            </span>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <h3 className="text-2xl font-black text-[#1D3557]">
                                    {
                                        selectedCourse.title
                                    }
                                </h3>

                                <p className="text-xs text-[#457B9D] mt-1 font-semibold">
                                    مربی رسمی:{' '}
                                    {
                                        selectedCourse.instructor
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/60 text-xs text-[#1D3557]">
                                <div className="flex items-center gap-2">
                                    <HiOutlineClock className="text-[#E63946] w-4 h-4 shrink-0" />

                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">
                                            زمان برگزاری:
                                        </div>

                                        <div className="font-bold">
                                            {
                                                selectedCourse.time
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <HiOutlineUserGroup className="text-[#457B9D] w-4 h-4 shrink-0" />

                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">
                                            ظرفیت:
                                        </div>

                                        <div className="font-bold">
                                            {
                                                selectedCourse.capacityText
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-[#A8DADC]/40">
                                    <HiOutlineLocationMarker className="text-[#457B9D] w-4 h-4 shrink-0" />

                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">
                                            محل برگزاری:
                                        </div>

                                        <div className="font-bold">
                                            {
                                                selectedCourse.location
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-[#A8DADC]/40">
                                    <HiOutlineCreditCard className="text-emerald-600 w-4 h-4 shrink-0" />

                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">
                                            شهریه:
                                        </div>

                                        <div className="font-bold text-[#E63946]">
                                            {
                                                selectedCourse.price
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
                                    <HiOutlineInformationCircle className="w-4 h-4 text-[#457B9D]" />
                                    درباره دوره:
                                </h4>

                                <p className="text-xs text-[#457B9D] leading-relaxed text-justify bg-[#F1FAEE]/50 p-3 rounded-xl">
                                    {
                                        selectedCourse.description
                                    }
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[#1D3557]">
                                    مزایا و خدمات:
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1D3557]">
                                    {selectedCourse.features.map(
                                        (
                                            feature,
                                            index,
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="flex items-center gap-2 bg-[#F1FAEE] p-2 rounded-lg border border-[#A8DADC]/30"
                                            >
                                                <HiOutlineCheck className="text-emerald-600 w-4 h-4 shrink-0" />

                                                <span>
                                                    {
                                                        feature
                                                    }
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                                <strong>
                                    پیش‌نیاز:
                                </strong>{' '}
                                {
                                    selectedCourse.prerequisites
                                }
                            </div>

                            <div className="pt-4 border-t border-[#A8DADC]/40 flex gap-3">
                                <button
                                    onClick={() =>
                                        handleStartBooking(
                                            selectedCourse,
                                        )
                                    }
                                    disabled={
                                        Number(
                                            selectedCourse.remainingCapacity,
                                        ) <=
                                        0
                                    }
                                    className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md"
                                >
                                    تایید و انتقال به رزرو دوره
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedCourse(
                                            null,
                                        )
                                    }
                                    className="px-5 bg-gray-100 hover:bg-gray-200 text-[#1D3557] font-bold py-3 rounded-xl text-xs transition-colors"
                                >
                                    انصراف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function CourseReservationPage({
    course,
    memberId,
    packages,
    onBack,
    onCompleted,
}: {
    course: Course
    memberId: number
    packages: PackageItem[]
    onBack: () => void
    onCompleted: () => Promise<void> | void
}) {
    const [step, setStep] = useState<
        1 | 2 | 3
    >(1)

    const [selectedPackageId, setSelectedPackageId] =
        useState<number | null>(null)

    const [selectedSessionId, setSelectedSessionId] =
        useState(0)

    const [paymentMethod, setPaymentMethod] =
        useState<
            'online' | 'cardToCard'
        >('online')

    const [trackingCode, setTrackingCode] =
        useState('')

    const [userCardNumber, setUserCardNumber] =
        useState('')

    const [discountCode, setDiscountCode] =
        useState('')

    const [discountPercent, setDiscountPercent] =
        useState(0)

    const [loading, setLoading] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const sessions = course.schedules || []

    const trainerPackages =
        packages.filter(
            (pkg) =>
                pkg.trainerName &&
                course.instructor &&
                pkg.trainerName.trim() ===
                    course.instructor.trim(),
        )

    const selectedPackage =
        packages.find(
            (pkg) =>
                pkg.id ===
                selectedPackageId,
        )

    useEffect(() => {
        if (trainerPackages.length) {
            setSelectedPackageId(
                trainerPackages[0].id,
            )
        } else {
            setSelectedPackageId(null)
        }
    }, [course.id, packages])

    const rawPrice = Number(
        selectedPackage?.price || 0,
    )

    const discountAmount = Math.round(
        (rawPrice * discountPercent) /
            100,
    )

    const finalPrice =
        rawPrice - discountAmount

    const applyDiscount = () => {
        const value =
            discountCode
                .trim()
                .toUpperCase()

        if (value === 'GOLD10') {
            setDiscountPercent(10)
            setMessage(
                'کد تخفیف ۱۰ درصدی اعمال شد.',
            )
        } else if (
            value === 'GYM20'
        ) {
            setDiscountPercent(20)
            setMessage(
                'کد تخفیف ۲۰ درصدی اعمال شد.',
            )
        } else {
            setDiscountPercent(0)
            setMessage(
                'کد تخفیف معتبر نیست.',
            )
        }
    }

    const submitBooking = async () => {
        if (!selectedPackageId) {
            setMessage(
                'برای ثبت رزرو، ابتدا یک پکیج مرتبط با این مربی را انتخاب کنید.',
            )
            return
        }

        if (!memberId) {
            setMessage(
                'شناسه عضو پیدا نشد. لطفاً دوباره وارد شوید.',
            )
            return
        }

        if (
            sessions.length &&
            !sessions[selectedSessionId]
        ) {
            setMessage(
                'لطفاً سانس موردنظر را انتخاب کنید.',
            )
            return
        }

        if (
            paymentMethod ===
            'cardToCard'
        ) {
            if (
                !trackingCode.trim() ||
                !userCardNumber.trim()
            ) {
                setMessage(
                    'شماره پیگیری و شماره کارت را وارد کنید.',
                )
                return
            }
        }

        try {
            setLoading(true)

            setMessage(
                'در حال ثبت اطلاعات در API...',
            )

            /*
             * POST /api/subscriptions
             */
            const subscriptionResponse =
                await ApiService.post(
                    '/subscriptions',
                    {
                        packageId:
                            selectedPackageId,
                        gymClassId:
                            course.id,
                    },
                )

            const subscriptionId =
                Number(
                    getData<any>(
                        subscriptionResponse,
                    ),
                )

            /*
             * POST /api/class-enrollments
             */
            if (
                Number.isFinite(
                    subscriptionId,
                ) &&
                subscriptionId > 0
            ) {
                await ApiService.post(
                    '/class-enrollments',
                    {
                        gymClassId:
                            course.id,
                        memberId,
                        subscriptionId,
                    },
                )
            }

            /*
             * پرداخت آنلاین
             */
            if (
                paymentMethod ===
                    'online' &&
                Number.isFinite(
                    subscriptionId,
                ) &&
                subscriptionId > 0
            ) {
                const paymentResponse =
                    await ApiService.post(
                        '/Payments/online',
                        {
                            subscriptionId,
                        },
                    )

                const paymentData =
                    getData<any>(
                        paymentResponse,
                    )

                if (
                    paymentData?.paymentUrl
                ) {
                    window.location.href =
                        paymentData.paymentUrl
                    return
                }
            }

            if (
                paymentMethod ===
                'cardToCard'
            ) {
                setMessage(
                    'رزرو ثبت شد. برای ثبت نهایی فیش کارت‌به‌کارت، endpoint مربوط به ثبت فیش باید در API اضافه شود.',
                )
            } else {
                setMessage(
                    'رزرو با موفقیت در API ثبت شد.',
                )
            }

            await onCompleted()

            setStep(3)
        } catch (error: any) {
            console.error(
                'خطا در ثبت رزرو:',
                error,
            )

            setMessage(
                error?.response?.data
                    ?.detail ||
                    error?.response?.data
                        ?.message ||
                    error?.message ||
                    'ثبت رزرو در API با خطا مواجه شد.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl max-w-4xl mx-auto">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#A8DADC] shadow-sm">
                <button
                    onClick={() =>
                        step > 1
                            ? setStep(
                                  (step -
                                      1) as
                                      | 1
                                      | 2
                                      | 3,
                              )
                            : onBack()
                    }
                    className="flex items-center gap-2 text-xs font-bold text-[#457B9D]"
                >
                    <HiOutlineArrowRight className="w-4 h-4" />

                    <span>
                        {step > 1
                            ? 'مرحله قبل'
                            : 'بازگشت به داشبورد'}
                    </span>
                </button>

                <h1 className="text-lg font-bold text-[#1D3557]">
                    مراحل ثبت رزرو کلاس ورزشی
                </h1>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white p-4 rounded-2xl border border-[#A8DADC] text-xs font-bold text-center">
                <div
                    className={`p-2 rounded-xl ${
                        step === 1
                            ? 'bg-[#1D3557] text-white'
                            : 'bg-[#F1FAEE] text-[#457B9D]'
                    }`}
                >
                    ۱. اطلاعات دوره
                </div>

                <div
                    className={`p-2 rounded-xl ${
                        step === 2
                            ? 'bg-[#1D3557] text-white'
                            : 'bg-[#F1FAEE] text-[#457B9D]'
                    }`}
                >
                    ۲. انتخاب پکیج و سانس
                </div>

                <div
                    className={`p-2 rounded-xl ${
                        step === 3
                            ? 'bg-[#1D3557] text-white'
                            : 'bg-[#F1FAEE] text-[#457B9D]'
                    }`}
                >
                    ۳. پرداخت
                </div>
            </div>

            {message && (
                <div className="bg-white border border-[#A8DADC] rounded-2xl p-4 text-xs text-[#457B9D]">
                    {message}
                </div>
            )}

            {step === 1 && (
                <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-52 h-36 rounded-xl overflow-hidden shrink-0">
                            <Image
                                src={
                                    course.image
                                }
                                alt={
                                    course.title
                                }
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-black">
                                {
                                    course.title
                                }
                            </h2>

                            <p className="text-xs text-[#457B9D]">
                                مربی:{' '}
                                {
                                    course.instructor
                                }
                            </p>

                            <p className="text-xs text-[#457B9D]">
                                رشته:{' '}
                                {
                                    course.sportName ||
                                    'ثبت نشده'
                                }
                            </p>

                            <p className="text-xs text-[#457B9D]">
                                ظرفیت:{' '}
                                {
                                    course.capacityText
                                }
                            </p>

                            <p className="text-xs text-[#457B9D]">
                                زمان:{' '}
                                {
                                    course.time
                                }
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#A8DADC]/40 flex justify-end">
                        <button
                            onClick={() =>
                                setStep(2)
                            }
                            className="bg-[#E63946] text-white text-xs font-bold px-6 py-3 rounded-xl"
                        >
                            ادامه
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-6">
                    <div>
                        <h2 className="text-base font-bold flex items-center gap-2">
                            <HiOutlineCreditCard className="w-5 h-5 text-[#E63946]" />
                            انتخاب پکیج
                        </h2>

                        {trainerPackages.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {trainerPackages.map(
                                    (pkg) => (
                                        <button
                                            key={
                                                pkg.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedPackageId(
                                                    pkg.id,
                                                )
                                            }
                                            className={`text-right p-4 rounded-xl border ${
                                                selectedPackageId ===
                                                pkg.id
                                                    ? 'border-[#1D3557] bg-[#1D3557]/5'
                                                    : 'border-[#A8DADC]'
                                            }`}
                                        >
                                            <div className="font-bold text-sm">
                                                {
                                                    pkg.title
                                                }
                                            </div>

                                            <div className="text-xs text-[#457B9D] mt-1">
                                                {
                                                    pkg.totalSessions
                                                }{' '}
                                                جلسه •{' '}
                                                {
                                                    pkg.durationDays
                                                }{' '}
                                                روز
                                            </div>

                                            <div className="text-sm font-black text-[#E63946] mt-2">
                                                {formatMoney(
                                                    pkg.price,
                                                )}
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 mt-4">
                                هیچ پکیجی برای مربی این کلاس از API پیدا نشد.
                            </div>
                        )}
                    </div>

                    {sessions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <HiOutlineClock className="w-5 h-5 text-[#E63946]" />
                                انتخاب سانس
                            </h3>

                            <div className="space-y-2 mt-4">
                                {sessions.map(
                                    (
                                        session,
                                        index,
                                    ) => (
                                        <button
                                            key={`${session.dayOfWeek}-${session.startTime}-${index}`}
                                            type="button"
                                            onClick={() =>
                                                setSelectedSessionId(
                                                    index,
                                                )
                                            }
                                            className={`w-full text-right p-4 rounded-xl border ${
                                                selectedSessionId ===
                                                index
                                                    ? 'border-[#1D3557] bg-[#1D3557]/5'
                                                    : 'border-[#A8DADC]'
                                            }`}
                                        >
                                            <div className="font-bold text-xs">
                                                {getDayLabel(
                                                    session.dayOfWeek,
                                                )}
                                            </div>

                                            <div className="text-[11px] text-[#457B9D] mt-1">
                                                {formatTime(
                                                    session.startTime,
                                                )}{' '}
                                                الی{' '}
                                                {formatTime(
                                                    session.endTime,
                                                )}
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-[#A8DADC]/40">
                        <button
                            onClick={() =>
                                setStep(1)
                            }
                            className="text-xs font-bold text-[#457B9D]"
                        >
                            مرحله قبل
                        </button>

                        <button
                            onClick={() =>
                                setStep(3)
                            }
                            disabled={
                                !selectedPackageId
                            }
                            className="bg-[#E63946] disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl"
                        >
                            ادامه پرداخت
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-6">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <HiOutlineCreditCard className="w-5 h-5 text-[#E63946]" />
                        خلاصه و پرداخت
                    </h2>

                    <div className="bg-[#F1FAEE] rounded-xl p-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                            <span>
                                دوره:
                            </span>

                            <strong>
                                {
                                    course.title
                                }
                            </strong>
                        </div>

                        <div className="flex justify-between">
                            <span>
                                پکیج:
                            </span>

                            <strong>
                                {
                                    selectedPackage?.title ||
                                    '-'
                                }
                            </strong>
                        </div>

                        <div className="flex justify-between">
                            <span>
                                مبلغ:
                            </span>

                            <strong>
                                {formatMoney(
                                    rawPrice,
                                )}
                            </strong>
                        </div>

                        {discountPercent >
                            0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span>
                                    تخفیف{' '}
                                    {
                                        discountPercent
                                    }
                                    %:
                                </span>

                                <strong>
                                    -
                                    {formatMoney(
                                        discountAmount,
                                    )}
                                </strong>
                            </div>
                        )}

                        <div className="border-t border-[#A8DADC] pt-3 flex justify-between text-sm font-black">
                            <span>
                                قابل پرداخت:
                            </span>

                            <span className="text-[#E63946]">
                                {formatMoney(
                                    finalPrice,
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]">
                        <div className="flex gap-2">
                            <input
                                value={
                                    discountCode
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setDiscountCode(
                                        e.target
                                            .value,
                                    )
                                }
                                placeholder="کد تخفیف"
                                className="flex-1 bg-white border border-[#A8DADC] rounded-xl px-3 py-2 text-xs"
                            />

                            <button
                                onClick={
                                    applyDiscount
                                }
                                className="bg-[#1D3557] text-white px-4 rounded-xl text-xs font-bold"
                            >
                                اعمال
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setPaymentMethod(
                                    'online',
                                )
                            }
                            className={`p-4 rounded-xl border text-right ${
                                paymentMethod ===
                                'online'
                                    ? 'border-[#1D3557] bg-[#1D3557]/5'
                                    : 'border-[#A8DADC]'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <HiOutlineGlobeAlt className="w-5 h-5" />

                                <div>
                                    <div className="text-xs font-bold">
                                        پرداخت آنلاین
                                    </div>

                                    <div className="text-[10px] text-[#457B9D]">
                                        انتقال به درگاه پرداخت
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setPaymentMethod(
                                    'cardToCard',
                                )
                            }
                            className={`p-4 rounded-xl border text-right ${
                                paymentMethod ===
                                'cardToCard'
                                    ? 'border-[#1D3557] bg-[#1D3557]/5'
                                    : 'border-[#A8DADC]'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <HiOutlineSwitchHorizontal className="w-5 h-5" />

                                <div>
                                    <div className="text-xs font-bold">
                                        کارت به کارت
                                    </div>

                                    <div className="text-[10px] text-[#457B9D]">
                                        ثبت اطلاعات واریز
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {paymentMethod ===
                        'cardToCard' && (
                        <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC] grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                value={
                                    trackingCode
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setTrackingCode(
                                        e.target
                                            .value,
                                    )
                                }
                                placeholder="شماره پیگیری"
                                className="bg-white border border-[#A8DADC] rounded-xl px-3 py-2 text-xs"
                            />

                            <input
                                value={
                                    userCardNumber
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setUserCardNumber(
                                        e.target
                                            .value,
                                    )
                                }
                                placeholder="شماره کارت واریزکننده"
                                className="bg-white border border-[#A8DADC] rounded-xl px-3 py-2 text-xs"
                            />
                        </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-[#A8DADC]/40">
                        <button
                            onClick={() =>
                                setStep(2)
                            }
                            className="text-xs font-bold text-[#457B9D]"
                        >
                            تغییر اطلاعات
                        </button>

                        <button
                            onClick={
                                submitBooking
                            }
                            disabled={loading}
                            className="bg-[#E63946] disabled:opacity-50 text-white text-xs font-bold px-8 py-3 rounded-xl flex items-center gap-2"
                        >
                            {loading
                                ? 'در حال ثبت...'
                                : 'ثبت رزرو و پرداخت'}

                            {!loading && (
                                <HiOutlineCheckCircle className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
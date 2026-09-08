'use client'

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

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
} from 'react-icons/hi'

import { BiDumbbell } from 'react-icons/bi'

import ApiService from '@/services/client/ApiService'

/* =========================
   Types
========================= */

type Role =
    | 'ADMIN'
    | 'TRAINER'
    | 'MEMBER'
    | null

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

/* =========================
   اطلاعات اصلی Member
   GET /members/{id}
========================= */

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

/* =========================
   Constants
========================= */

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

/* =========================
   Helpers
========================= */

const getData = <T,>(response: any): T => {
    return (
        response?.data?.data ??
        response?.data ??
        response
    ) as T
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

const parseJwt = (
    token: string,
): Record<string, any> | null => {
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
            base64.length +
                ((4 - (base64.length % 4)) % 4),
            '=',
        )

        return JSON.parse(
            decodeURIComponent(
                atob(padded)
                    .split('')
                    .map(
                        (char) =>
                            '%' +
                            (
                                '00' +
                                char
                                    .charCodeAt(0)
                                    .toString(16)
                            ).slice(-2),
                    )
                    .join(''),
            ),
        )
    } catch {
        return null
    }
}

const normalizeRole = (
    value: any,
): Role => {
    if (Array.isArray(value)) {
        value = value[0]
    }

    if (
        value === null ||
        value === undefined
    ) {
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

const getStoredValue = (
    keys: string[],
): string | null => {
    if (typeof window === 'undefined') {
        return null
    }

    for (const key of keys) {
        try {
            const localValue =
                localStorage.getItem(key)

            if (
                localValue &&
                localValue.trim()
            ) {
                return localValue
            }
        } catch {}

        try {
            const sessionValue =
                sessionStorage.getItem(key)

            if (
                sessionValue &&
                sessionValue.trim()
            ) {
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
            const localValue =
                localStorage.getItem(key)

            if (localValue) {
                const parsed =
                    JSON.parse(localValue)

                if (
                    parsed &&
                    typeof parsed === 'object'
                ) {
                    return (
                        parsed?.data ??
                        parsed?.user ??
                        parsed
                    )
                }
            }
        } catch {}

        try {
            const sessionValue =
                sessionStorage.getItem(key)

            if (sessionValue) {
                const parsed =
                    JSON.parse(sessionValue)

                if (
                    parsed &&
                    typeof parsed === 'object'
                ) {
                    return (
                        parsed?.data ??
                        parsed?.user ??
                        parsed
                    )
                }
            }
        } catch {}
    }

    return null
}

const getIdentityFromToken =
    (): UserIdentity | null => {
        if (typeof window === 'undefined') {
            return null
        }

        const token = getStoredValue([
            'accessToken',
            'access_token',
            'token',
            'jwt',
            'access-token',
        ])

        if (token) {
            const payload = parseJwt(token)

            if (payload) {
                const idValue =
                    payload[
                        NAME_IDENTIFIER_CLAIM
                    ] ??
                    payload.nameid ??
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

                const role =
                    normalizeRole(roleValue)

                const id = Number(idValue)

                if (
                    Number.isFinite(id) &&
                    id > 0 &&
                    role
                ) {
                    return {
                        id,
                        role,
                    }
                }
            }
        }

        const storedUser =
            getStoredUser()

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
            const role =
                normalizeRole(roleValue)

            if (
                Number.isFinite(id) &&
                id > 0 &&
                role
            ) {
                return {
                    id,
                    role,
                }
            }
        }

        const storedId =
            getStoredValue([
                'userId',
                'user_id',
                'memberId',
                'member_id',
            ])

        const storedRole =
            getStoredValue([
                'role',
                'userRole',
                'user_role',
            ])

        const id = Number(storedId)
        const role =
            normalizeRole(storedRole)

        if (
            Number.isFinite(id) &&
            id > 0 &&
            role
        ) {
            return {
                id,
                role,
            }
        }

        return null
    }

const formatDate = (
    value?: string,
) => {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat(
        'fa-IR',
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        },
    ).format(date)
}

const formatMoney = (
    value: number,
) =>
    `${Number(
        value || 0,
    ).toLocaleString('fa-IR')} تومان`

const formatTime = (
    value?: string,
) => {
    if (!value) {
        return ''
    }

    return value.length >= 5
        ? value.slice(0, 5)
        : value
}

const getDayLabel = (
    day?: string,
) => {
    const map: Record<
        string,
        string
    > = {
        Saturday: 'شنبه',
        Sunday: 'یکشنبه',
        Monday: 'دوشنبه',
        Tuesday: 'سه‌شنبه',
        Wednesday: 'چهارشنبه',
        Thursday: 'پنج‌شنبه',
        Friday: 'جمعه',
    }

    return day
        ? map[day] || day
        : ''
}

const getCourseTime = (
    schedules?: Schedule[],
) => {
    if (!schedules?.length) {
        return 'زمان‌بندی ثبت نشده'
    }

    return schedules
        .slice(0, 2)
        .map(
            (item) =>
                `${getDayLabel(
                    item.dayOfWeek,
                )} ${formatTime(
                    item.startTime,
                )} الی ${formatTime(
                    item.endTime,
                )}`,
        )
        .join(' | ')
}

const mapCourse = (
    item: ApiCourse,
    index: number,
    packages: PackageItem[],
): Course => {
    const trainer =
        item.trainerName ||
        'مربی ثبت نشده'

    const matchedPackage =
        packages.find(
            (pkg) =>
                pkg.trainerName &&
                trainer &&
                pkg.trainerName.trim() ===
                    trainer.trim(),
        )

    const remaining = Number(
        item.remainingCapacity ?? 0,
    )

    return {
        ...item,

        instructor: trainer,

        time: getCourseTime(
            item.schedules,
        ),

        capacityText:
            remaining <= 0
                ? 'تکمیل ظرفیت'
                : `ظرفیت ${remaining} نفر`,

        image:
            API_IMAGES[
                index % API_IMAGES.length
            ],

        tag:
            remaining <= 0
                ? 'تکمیل ظرفیت'
                : 'ظرفیت فعال',

        description:
            `کلاس ${
                item.title || 'ورزشی'
            } در گروه ${
                item.groupName || 'عمومی'
            }، رشته ${
                item.sportName || 'ورزشی'
            } و تحت نظر ${
                trainer
            } برگزار می‌شود.`,

        prerequisites:
            'طبق قوانین و شرایط ثبت‌نام باشگاه',

        features: [
            'برنامه تمرینی متناسب با دوره',
            'ثبت حضور در سامانه',
            'دسترسی به اطلاعات زمان‌بندی کلاس',
            'پیگیری وضعیت ظرفیت',
        ],

        price: matchedPackage
            ? formatMoney(
                  matchedPackage.price,
              )
            : 'قیمت در پکیج',

        location:
            'طبق اطلاعات ثبت‌شده در باشگاه',
    }
}

/* =========================
   Course Reservation Page
   برای جلوگیری از خطای
   Cannot find name 'CourseReservationPage'
========================= */

interface CourseReservationPageProps {
    course: Course
    memberId: number
    packages: PackageItem[]
    onBack: () => void
    onCompleted: () => void
}

function CourseReservationPage({
    course,
    memberId,
    packages,
    onBack,
    onCompleted,
}: CourseReservationPageProps) {
    const [submitting, setSubmitting] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const handleReserve = async () => {
        try {
            setSubmitting(true)
            setMessage('')

            /*
             * اگر endpoint رزرو شما متفاوت است،
             * فقط همین قسمت را با endpoint واقعی
             * رزرو خودت جایگزین کن.
             */

            await ApiService.post(
                '/enrollments',
                {
                    memberId,
                    classId: course.id,
                },
            )

            setMessage(
                'رزرو کلاس با موفقیت انجام شد.',
            )

            onCompleted()
        } catch (error: any) {
            setMessage(
                error?.response?.data
                    ?.message ||
                    error?.response?.data
                        ?.detail ||
                    error?.message ||
                    'رزرو کلاس با خطا مواجه شد.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            dir="rtl"
            className="min-h-screen bg-white p-4 sm:p-6"
        >
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="mb-5 flex items-center gap-2 text-sm font-bold text-[#1D3557] hover:text-[#E63946]"
                >
                    <HiOutlineChevronRight className="w-5 h-5" />
                    بازگشت به داشبورد
                </button>

                <div className="bg-white border border-[#A8DADC]/50 rounded-2xl shadow-sm overflow-hidden">
                    <div className="relative h-56">
                        <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="p-6 space-y-5">
                        <div>
                            <h1 className="text-2xl font-black text-[#1D3557]">
                                رزرو دوره
                            </h1>

                            <p className="text-sm text-[#457B9D] mt-2">
                                {course.title}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-xs text-[#457B9D]">
                                    مربی
                                </div>

                                <div className="font-bold text-[#1D3557] mt-1">
                                    {course.instructor}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-xs text-[#457B9D]">
                                    زمان
                                </div>

                                <div className="font-bold text-[#1D3557] mt-1">
                                    {course.time}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-xs text-[#457B9D]">
                                    ظرفیت
                                </div>

                                <div className="font-bold text-[#1D3557] mt-1">
                                    {
                                        course.capacityText
                                    }
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-xs text-[#457B9D]">
                                    شهریه
                                </div>

                                <div className="font-bold text-[#E63946] mt-1">
                                    {
                                        course.price
                                    }
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
                                {message}
                            </div>
                        )}

                        <div className="pt-4 border-t border-[#A8DADC]/40 flex gap-3">
                            <button
                                onClick={
                                    handleReserve
                                }
                                disabled={
                                    submitting ||
                                    Number(
                                        course.remainingCapacity ??
                                            0,
                                    ) <= 0
                                }
                                className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm"
                            >
                                {submitting
                                    ? 'در حال ثبت رزرو...'
                                    : 'تایید رزرو'}
                            </button>

                            <button
                                onClick={onBack}
                                className="px-6 bg-gray-100 hover:bg-gray-200 text-[#1D3557] font-bold py-3 rounded-xl text-sm"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* =========================
   Main Dashboard
========================= */

export default function MemberDashboard() {
    const router = useRouter()

    const sliderRef =
        useRef<HTMLDivElement>(null)

    const [
        identity,
        setIdentity,
    ] = useState<UserIdentity | null>(
        null,
    )

    const [
        member,
        setMember,
    ] = useState<MemberDetails | null>(
        null,
    )

    const [
        memberProfile,
        setMemberProfile,
    ] = useState<MemberProfile | null>(
        null,
    )

    const [
        courses,
        setCourses,
    ] = useState<Course[]>([])

    const [
        packages,
        setPackages,
    ] = useState<PackageItem[]>([])

    const [
        payments,
        setPayments,
    ] = useState<Payment[]>([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState('')

    const [
        selectedCourse,
        setSelectedCourse,
    ] = useState<Course | null>(null)

    const [
        activeBookingCourse,
        setActiveBookingCourse,
    ] = useState<Course | null>(null)

    const [
        isDragging,
        setIsDragging,
    ] = useState(false)

    const [
        startX,
        setStartX,
    ] = useState(0)

    const [
        scrollLeft,
        setScrollLeft,
    ] = useState(0)

    /* =========================
       Load Dashboard
    ========================= */

    const loadDashboard = async () => {
        try {
            setLoading(true)
            setError('')

            /*
             * اول ID و Role را از JWT پیدا می‌کنیم
             */

            const currentIdentity =
                getIdentityFromToken()

            if (!currentIdentity) {
                setError(
                    'اطلاعات ورود کاربر پیدا نشد. لطفاً دوباره وارد حساب شوید.',
                )

                setLoading(false)
                return
            }

            setIdentity(currentIdentity)

            if (
                currentIdentity.role !==
                'MEMBER'
            ) {
                setError(
                    `این صفحه برای عضو طراحی شده است. نقش فعلی شما: ${currentIdentity.role}`,
                )

                setLoading(false)
                return
            }

            /*
             * اینجا ID پیدا شده.
             *
             * سپس:
             *
             * GET /members/{id}
             *
             * برای گرفتن firstName و lastName
             */

            const [
                memberProfileResponse,
                memberDetailsResponse,
                courseResponse,
                packageResponse,
                paymentResponse,
            ] = await Promise.all([
                ApiService.get<MemberProfile>(
                    `/members/${currentIdentity.id}`,
                ),

                ApiService.get<MemberDetails>(
                    `/members/${currentIdentity.id}/details`,
                ),

                ApiService.get<ApiCourse[]>(
                    '/gym-classes',
                ),

                ApiService.get<PackageItem[]>(
                    '/packages',
                ),

                ApiService.get<Payment[]>(
                    `/members/${currentIdentity.id}/payments`,
                ),
            ])

            /*
             * اطلاعات اصلی کاربر
             */

            const apiMemberProfile =
                getData<MemberProfile>(
                    memberProfileResponse,
                )

            /*
             * اطلاعات کامل داشبورد
             */

            const memberDetails =
                getData<MemberDetails>(
                    memberDetailsResponse,
                )

            const apiCourses =
                getArray<ApiCourse>(
                    courseResponse,
                )

            const apiPackages =
                getArray<PackageItem>(
                    packageResponse,
                )

            const apiPayments =
                getArray<Payment>(
                    paymentResponse,
                )

            if (!apiMemberProfile) {
                throw new Error(
                    'اطلاعات کاربر از API دریافت نشد.',
                )
            }

            /*
             * ذخیره اطلاعات اصلی کاربر
             */

            setMemberProfile(
                apiMemberProfile,
            )

            /*
             * ذخیره اطلاعات کامل Member
             */

            if (memberDetails) {
                setMember({
                    ...memberDetails,

                    firstName:
                        apiMemberProfile.firstName,

                    lastName:
                        apiMemberProfile.lastName,

                    id: apiMemberProfile.id,

                    subscriptions:
                        memberDetails.subscriptions ||
                        [],

                    courses:
                        memberDetails.courses ||
                        [],
                })
            } else {
                /*
                 * اگر details موجود نبود،
                 * حداقل اطلاعات profile را نگه می‌داریم.
                 */

                setMember({
                    ...apiMemberProfile,
                    subscriptions: [],
                    courses: [],
                })
            }

            setPackages(apiPackages)
            setPayments(apiPayments)

            setCourses(
                apiCourses.map(
                    (
                        course,
                        index,
                    ) =>
                        mapCourse(
                            course,
                            index,
                            apiPackages,
                        ),
                ),
            )
        } catch (err: any) {
            const status =
                err?.response?.status

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
                    err?.response?.data
                        ?.detail ||
                        err?.response?.data
                            ?.message ||
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

    /* =========================
       Active Subscription
    ========================= */

    const activeSubscription =
        useMemo(() => {
            if (
                !member?.subscriptions
                    ?.length
            ) {
                return null
            }

            return (
                member.subscriptions.find(
                    (item) => {
                        const status =
                            item.status?.toLowerCase()

                        return (
                            status !==
                                'expired' &&
                            status !==
                                'cancelled'
                        )
                    },
                ) ||
                member.subscriptions[0]
            )
        }, [member])

    /* =========================
       Days Remaining
    ========================= */

    const daysRemaining =
        useMemo(() => {
            if (
                !activeSubscription?.endDate
            ) {
                return 0
            }

            const end = new Date(
                activeSubscription.endDate,
            )

            if (
                Number.isNaN(
                    end.getTime(),
                )
            ) {
                return 0
            }

            const diff =
                end.getTime() -
                Date.now()

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

    /* =========================
       Booking
    ========================= */

    const handleStartBooking = (
        course?: Course,
    ) => {
        const targetCourse =
            course || courses[0]

        if (!targetCourse) {
            return
        }

        setSelectedCourse(null)
        setActiveBookingCourse(
            targetCourse,
        )
    }

    /* =========================
       Slider
    ========================= */

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

    const handleMouseLeaveOrUp = () => {
        setIsDragging(false)
    }

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
        direction:
            | 'left'
            | 'right',
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

    /* =========================
       Full Name
    ========================= */

    const fullName =
        memberProfile?.firstName ||
        memberProfile?.lastName
            ? `${memberProfile?.firstName || ''} ${
                  memberProfile?.lastName || ''
              }`.trim()
            : 'کاربر'

    /* =========================
       Reservation Page
    ========================= */

    if (activeBookingCourse) {
        return (
            <CourseReservationPage
                course={
                    activeBookingCourse
                }
                memberId={
                    memberProfile?.id ||
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
                onCompleted={async () => {
                    await loadDashboard()
                    setActiveBookingCourse(
                        null,
                    )
                }}
            />
        )
    }

    /* =========================
       Dashboard
    ========================= */

    return (
        <div
            dir="rtl"
            className="p-4 sm:p-6 space-y-6  min-h-screen text-[#1D3557]"
        >
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Error */}

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
                                loadDashboard()
                            }
                        }}
                        className="mr-3 font-bold underline"
                    >
                        تلاش مجدد
                    </button>
                </div>
            )}

            {/* =========================
                Header
            ========================= */}

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
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#1D3557]">
                            خوش آمدی،

                            <span className="text-[#E63946]">
                                {loading
                                    ? '...'
                                    : fullName}
                            </span>
                        </h1>

                        <p className="text-xs sm:text-sm text-[#457B9D] mt-1">
                            امروز برای رسیدن به اهدافت آماده‌ای؟
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-[#A8DADC] text-[#1D3557] px-4 py-3 rounded-xl self-start md:self-auto w-full md:w-auto">
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

            {/* =========================
                Stats
            ========================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#457B9D] flex items-center justify-center shrink-0">
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

                <div className="relative bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                        <span className="bg-[#1D3557] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md">
                            به‌زودی
                        </span>
                    </div>

                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0 filter blur-sm">
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="#f3f4f6"
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
                                strokeDashoffset={60}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>

                        <span className="absolute text-xs font-bold text-[#1D3557]">
                            ۵۰٪
                        </span>
                    </div>

                    <div className="filter blur-sm">
                        <span className="text-xs text-[#457B9D] font-semibold">
                            میزان حضور
                        </span>

                        <div className="text-2xl font-black text-[#1D3557]">
                            ۵۰٪
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4 sm:col-span-2 md:col-span-1">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#457B9D] flex items-center justify-center shrink-0">
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

            {/* =========================
                Subscription
            ========================= */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <div className="text-xs font-bold text-[#457B9D] mb-4">
                            اشتراک فعال
                        </div>

                        {activeSubscription ? (
                            <div className="flex flex-col sm:flex-row gap-5 items-center bg-gray-50 p-4 rounded-xl border border-[#A8DADC]/30">
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
                            <div className="bg-gray-50 border border-[#A8DADC]/40 rounded-xl p-6 text-center text-sm text-[#457B9D]">
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
                            className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-[#1D3557] font-bold py-3 px-4 rounded-xl transition-all text-sm"
                        >
                            مشاهده پروفایل و اشتراک
                        </button>
                    </div>
                </div>

                {/* Recent Attendance */}

                <div className="relative lg:col-span-5 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                        <span className="bg-[#1D3557] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md">
                            به‌زودی
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4 filter blur-sm">
                            <span className="text-xs font-bold text-[#457B9D]">
                                سوابق اخیر حضور
                            </span>
                        </div>

                        <div className="space-y-3 filter blur-sm">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20">
                                <div>
                                    <div className="text-xs font-bold text-[#1D3557]">
                                        کلاس بدنسازی عمومی
                                    </div>

                                    <div className="text-[11px] text-[#457B9D] mt-1">
                                        ۱۴۰۵/۰۶/۱۵ • مربی نمونه
                                    </div>
                                </div>

                                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20">
                                <div>
                                    <div className="text-xs font-bold text-[#1D3557]">
                                        کلاس بدنسازی عمومی
                                    </div>

                                    <div className="text-[11px] text-[#457B9D] mt-1">
                                        ۱۴۰۵/۰۶/۱۲ • مربی نمونه
                                    </div>
                                </div>

                                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                Courses
            ========================= */}

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
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() =>
                                scrollByButtons(
                                    'left',
                                )
                            }
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1D3557] border border-[#A8DADC]/40"
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
                                    className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] bg-gray-50 border border-[#A8DADC]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between shrink-0 group cursor-pointer"
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
                                                    <HiOutlineUserGroup className="w-4 h-4 text-[#E63946] shrink-0" />

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

            {/* =========================
                Payments
            ========================= */}

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
                            <div className="grid grid-cols-5 gap-3 bg-gray-50 rounded-xl p-3 text-[11px] font-bold text-[#457B9D]">
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

            {/* =========================
                Course Details Modal
            ========================= */}

            {selectedCourse && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedCourse(
                            null,
                        )
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-[#A8DADC]/60 text-xs text-[#1D3557]">
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

                                <p className="text-xs text-[#457B9D] leading-relaxed text-justify bg-gray-50 p-3 rounded-xl">
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
                                                className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-[#A8DADC]/30"
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
                                        ) <= 0
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
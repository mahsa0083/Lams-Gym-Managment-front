'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
    HiOutlineCalendar,
    HiOutlineBadgeCheck,
    HiOutlineCheckCircle,
    HiOutlineRefresh,
    HiOutlineLockClosed,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineClock,
    HiOutlineX,
    HiOutlineUserGroup,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineInformationCircle,
    HiOutlineCheck,
} from 'react-icons/hi'
import { BiDumbbell } from 'react-icons/bi'

// ساختار داده‌های دریافتی از API کاربر
interface MemberDto {
    id: number
    fullName: string
    nationalCode?: string
    avatarUrl?: string
    remainingDays?: number
    attendanceRate?: number
    activeClassesCount?: number
    activeSubscriptionName?: string
}

// ساختار داده‌های دوره
interface CourseDto {
    id: number
    title: string
    instructor: string
    time: string
    price: string
    capacity: string
    location?: string
    description: string
    tag: string
    image: string
    features: string[]
    prerequisites: string
}

// دیتای نمونه دوره‌ها جهت رندر موقت کاروسل
const MOCK_COURSES: CourseDto[] = [
    {
        id: 1,
        title: 'دوره فیتنس و آمادگی جسمانی',
        instructor: 'استاد علی محمدی',
        time: 'روزهای زوج • ۱۸:۰۰ - ۱۹:۳۰',
        price: '۱,۲۰۰,۰۰۰ تومان',
        capacity: '۵ نفر باقی‌مانده',
        location: 'سالن شماره ۱',
        description: 'این دوره شامل تمرینات هوازی، چربی‌سوزی و تقویت عضلات پایه به همراه برنامه تغذیه اختصاصی است.',
        tag: 'ویژه آقایان',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
        features: ['برنامه تغذیه رایگان', 'آنالیز ترکیب بدن (InBody)', 'مربی اختصاصی'],
        prerequisites: 'داشتن سلامت عمومی بدن',
    },
    {
        id: 2,
        title: 'کلاس تخصصی کراس‌فیت',
        instructor: 'کاپیتان رضا حسینی',
        time: 'روزهای فرد • ۱۹:۳۰ - ۲۱:۰۰',
        price: '۱,۵۰۰,۰۰۰ تومان',
        capacity: '۲ نفر باقی‌مانده',
        location: 'سالن کراس‌فیت',
        description: 'تمرینات شدید استقامتی و قدرتی مناسب برای افرادی که به دنبال افزایش توان بالاتنه و پایین‌تنه هستند.',
        tag: 'پرفروش',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
        features: ['تجهیزات مدرن', 'سنجش ضربان قلب آنلاین', 'رژیم ورزشی'],
        prerequisites: 'حداقل ۳ ماه سابقه تمرین ورزشی',
    },
    {
        id: 3,
        title: 'یوگا و اصلاح وضعیت بدنی',
        instructor: 'سرکار خانم سمیرا راد',
        time: 'روزهای زوج • ۰۸:۰۰ - ۰۹:۳۰',
        price: '۹۵۰,۰۰۰ تومان',
        capacity: 'ظرفیت کامل',
        location: 'سالن آرامش',
        description: 'تمرکز بر تمرینات کششی، انعطاف‌پذیری، کاهش استرس و اصلاح فرم ستون فقرات.',
        tag: 'بانوان',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600',
        features: ['محیط آرامش‌بخش', 'تشک یوگای اختصاصی', 'تمرینات تنفسی'],
        prerequisites: 'بدون پیش‌نیاز خاص',
    },
]

// تابع کمکی برای پارس کردن JWT Token
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch (e) {
        console.error('Invalid JWT token', e)
        return null
    }
}

export default function MemberDashboard() {
    const [memberData, setMemberData] = useState<MemberDto | null>(null)
    const [availableCourses, setAvailableCourses] = useState<CourseDto[]>(MOCK_COURSES)
    const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [apiError, setApiError] = useState<string | null>(null)

    // Refs برای اسکرول کاروسل لمسی
    const coursesSectionRef = useRef<HTMLDivElement>(null)
    const sliderRef = useRef<HTMLDivElement>(null)
    const isMouseDown = useRef<boolean>(false)
    const startX = useRef<number>(0)
    const scrollLeft = useRef<number>(0)

    // دریافت اطلاعات کاربر بر اساس JWT Token
    const fetchDashboardData = async () => {
        setIsLoading(true)
        setApiError(null)

        try {
            const token = localStorage.getItem('token') || ''
            let userId: string | number | null = null

            if (token) {
                const decodedToken = parseJwt(token)
                userId = decodedToken?.userId || decodedToken?.sub || decodedToken?.id || decodedToken?.user_id
            }

            if (!userId) {
                userId = 'me'
            }

            const memberRes = await fetch(`/api/members/${userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (memberRes.ok) {
                const memberInfo = await memberRes.json()
                setMemberData(memberInfo)
            } else {
                setApiError('خطا در دریافت اطلاعات کاربر از سرور.')
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setApiError('خطا در ارتباط با سرور. لطفاً اتصال شبکه را بررسی کنید.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // توابع اسکرول و کشیدن کاروسل با ماوس/لمس
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!sliderRef.current) return
        isMouseDown.current = true
        startX.current = e.pageX - sliderRef.current.offsetLeft
        scrollLeft.current = sliderRef.current.scrollLeft
    }

    const handleMouseLeaveOrUp = () => {
        isMouseDown.current = false
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isMouseDown.current || !sliderRef.current) return
        e.preventDefault()
        const x = e.pageX - sliderRef.current.offsetLeft
        const walk = (x - startX.current) * 1.5
        sliderRef.current.scrollLeft = scrollLeft.current - walk
    }

    const scrollByButtons = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    const handleStartBooking = (course: CourseDto) => {
        alert(`دوره "${course.title}" انتخاب شد. (منتظر اتصال به API)`)
        setSelectedCourse(null)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F1FAEE] flex flex-col items-center justify-center space-y-3 text-[#1D3557]">
                <HiOutlineRefresh className="w-10 h-10 animate-spin text-[#E63946]" />
                <p className="text-sm font-bold">در حال دریافت اطلاعات داشبورد...</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 dir-rtl bg-[#F1FAEE] min-h-screen text-[#1D3557]">
            {/* پیغام خطا */}
            {apiError && (
                <div className="bg-rose-100 border border-rose-300 text-rose-800 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
                    <span>{apiError}</span>
                    <button onClick={fetchDashboardData} className="bg-rose-600 text-white px-3 py-1 rounded-lg text-xs">
                        تلاش مجدد
                    </button>
                </div>
            )}

            {/* ۱. هدر خوش‌آمدگویی */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E63946] shrink-0">
                        <Image
                            src={memberData?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                            alt="تصویر کاربر"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1D3557]">
                            خوش آمدی، <span className="text-[#E63946]">{memberData?.fullName || 'کاربر گرامی'}</span>!
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#A8DADC]/30 border border-[#A8DADC] text-[#1D3557] px-4 py-3 rounded-xl self-start md:self-auto">
                    <HiOutlineBadgeCheck className="w-6 h-6 shrink-0 text-[#E63946]" />
                    <div>
                        <div className="text-sm font-bold">وضعیت حساب</div>
                        <div className="text-xs text-[#457B9D]">اشتراک فعال در سامانه</div>
                    </div>
                </div>
            </div>

            {/* ۲. کارت‌های آمار داشبورد */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* روزهای باقی‌مانده */}
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center shrink-0">
                        <HiOutlineCalendar className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold uppercase">روزهای باقی‌مانده</span>
                        <div className="text-2xl font-black text-[#1D3557]">
                            {memberData?.remainingDays ?? 0} روز
                        </div>
                    </div>
                </div>

                {/* میزان حضور (بلور شده و غیرفعال) */}
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm relative overflow-hidden flex items-center gap-4">
                    <div className="flex items-center gap-4 filter blur-sm select-none opacity-40 w-full">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="#F1FAEE" strokeWidth="4" fill="transparent" />
                                <circle cx="24" cy="24" r="20" stroke="#457B9D" strokeWidth="4" strokeDasharray={125} strokeDashoffset={25} strokeLinecap="round" fill="transparent" />
                            </svg>
                            <span className="absolute text-xs font-bold text-[#1D3557]">۸۰٪</span>
                        </div>
                        <div>
                            <span className="text-xs text-[#457B9D] font-semibold uppercase">میزان حضور</span>
                            <div className="text-2xl font-black text-[#1D3557]">۸۰٪</div>
                        </div>
                    </div>

                    {/* کاور بلور روی کارت میزان حضور */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center gap-2 z-10 px-3 text-center">
                        <HiOutlineLockClosed className="w-4 h-4 text-[#1D3557] shrink-0" />
                        <span className="text-xs font-bold text-[#1D3557]">میزان حضور به زودی فعال می‌شود</span>
                    </div>
                </div>

                {/* کلاس‌های فعال */}
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center shrink-0">
                        <BiDumbbell className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold uppercase">کلاس‌های فعال</span>
                        <div className="text-2xl font-black text-[#1D3557]">
                            {memberData?.activeClassesCount ?? 0} کلاس
                        </div>
                    </div>
                </div>
            </div>

            {/* ۳. اشتراک فعلی پویا + سوابق حضور بلور شده */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <div className="text-xs font-bold text-[#457B9D] uppercase mb-4">اشتراک فعلی شما</div>
                        <div className="flex flex-col sm:flex-row gap-5 items-center bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/30">
                            <div className="relative w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 bg-[#1D3557] flex items-center justify-center text-white font-bold">
                                <BiDumbbell className="w-10 h-10 text-[#E63946]" />
                            </div>
                            <div className="space-y-2 w-full">
                                <h3 className="text-lg font-black text-[#1D3557]">
                                    {memberData?.activeSubscriptionName || 'هیچ اشتراک فعالی یافت نشد'}
                                </h3>
                                {memberData?.activeSubscriptionName ? (
                                    <div className="text-xs text-[#E63946] font-bold">★ فعال بر روی حساب شما</div>
                                ) : (
                                    <div className="text-xs text-gray-400 font-medium">جهت فعال‌سازی اشتراک با مدیریت تماس بگیرید</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* سوابق حضور (بلور شده) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm relative overflow-hidden min-h-[220px]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[#457B9D] uppercase">سوابق اخیر حضور</span>
                    </div>

                    <div className="space-y-3 filter blur-sm select-none opacity-40">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20">
                            <div>
                                <div className="text-xs font-bold text-[#1D3557]">تمرین قدرت</div>
                                <div className="text-[11px] text-[#457B9D]">۰۳ خرداد • ۰۶:۴۵ - ۰۷:۴۵</div>
                            </div>
                            <HiOutlineCheckCircle className="w-5 h-5 text-[#457B9D]" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20">
                            <div>
                                <div className="text-xs font-bold text-[#1D3557]">کلاس HIIT</div>
                                <div className="text-[11px] text-[#457B9D]">۰۱ خرداد • ۰۷:۰۰ - ۰۸:۰۰</div>
                            </div>
                            <HiOutlineCheckCircle className="w-5 h-5 text-[#457B9D]" />
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-10">
                        <div className="w-10 h-10 rounded-full bg-[#1D3557]/10 flex items-center justify-center text-[#1D3557] mb-2">
                            <HiOutlineLockClosed className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-[#1D3557]">سوابق حضور و غیاب</span>
                        <p className="text-xs text-[#457B9D] mt-1 font-medium">
                            این بخش به زودی در آپدیت‌های آینده فعال خواهد شد.
                        </p>
                    </div>
                </div>
            </div>

            {/* ۴. کاروسل لمسی دوره‌ها */}
            <div ref={coursesSectionRef} className="bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#1D3557]">رزرو دوره‌ها و کلاس‌های باشگاه</h2>
                        <p className="text-xs text-[#457B9D] mt-0.5">برای مشاهده جزئیات کامل دوره، روی کارت کلیک کنید یا آن را بکشید</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => scrollByButtons('right')}
                            className="p-2 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/40 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollByButtons('left')}
                            className="p-2 rounded-xl bg-[#F1FAEE] hover:bg-[#A8DADC]/40 text-[#1D3557] border border-[#A8DADC]/40"
                        >
                            <HiOutlineChevronLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={sliderRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    className="flex gap-5 overflow-x-auto py-2 px-1 cursor-grab active:cursor-grabbing select-none no-scrollbar"
                    style={{ touchAction: 'pan-x' }}
                >
                    {availableCourses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] bg-[#F1FAEE] border border-[#A8DADC]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between shrink-0 group cursor-pointer"
                        >
                            <div>
                                <div className="relative w-full h-36 overflow-hidden">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                    />
                                    <span className="absolute top-3 right-3 bg-[#E63946] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                        {course.tag}
                                    </span>
                                </div>

                                <div className="p-4 space-y-2">
                                    <h3 className="font-black text-sm text-[#1D3557] line-clamp-1">{course.title}</h3>
                                    <p className="text-xs text-[#457B9D]">{course.instructor}</p>
                                    <div className="pt-2 border-t border-[#A8DADC]/40 space-y-1.5 text-xs text-[#1D3557]">
                                        <div className="flex items-center gap-1.5 text-[#457B9D]">
                                            <HiOutlineClock className="w-4 h-4 text-[#E63946]" />
                                            <span>{course.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 pt-0">
                                <button className="w-full bg-[#1D3557] text-white font-bold py-2 rounded-xl text-xs">
                                    مشاهده جزئیات کامل
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ۵. مدال جامع اطلاعات کامل دوره ورزشی */}
            {selectedCourse && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedCourse(null)}
                >
                    <div
                        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#A8DADC] space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-56 w-full">
                            <Image src={selectedCourse.image} alt={selectedCourse.title} fill className="object-cover" />
                            <button
                                onClick={() => setSelectedCourse(null)}
                                className="absolute top-3 left-3 bg-white/90 hover:bg-white text-[#1D3557] p-2 rounded-full transition-colors shadow-md"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                            <span className="absolute bottom-3 right-3 bg-[#E63946] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {selectedCourse.tag}
                            </span>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <h3 className="text-2xl font-black text-[#1D3557]">{selectedCourse.title}</h3>
                                <p className="text-xs text-[#457B9D] mt-1 font-semibold">مربی رسمی: {selectedCourse.instructor}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/60 text-xs text-[#1D3557]">
                                <div className="flex items-center gap-2">
                                    <HiOutlineClock className="text-[#E63946] w-4 h-4 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">زمان برگزاری:</div>
                                        <div className="font-bold">{selectedCourse.time}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HiOutlineUserGroup className="text-[#457B9D] w-4 h-4 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">وضعیت ظرفیت:</div>
                                        <div className="font-bold">{selectedCourse.capacity}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-[#A8DADC]/40">
                                    <HiOutlineLocationMarker className="text-[#457B9D] w-4 h-4 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">محل برگزاری:</div>
                                        <div className="font-bold">{selectedCourse.location || 'سالن اصلی'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-[#A8DADC]/40">
                                    <HiOutlineCreditCard className="text-emerald-600 w-4 h-4 shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-[#457B9D]">شهریه دوره:</div>
                                        <div className="font-bold text-[#E63946]">{selectedCourse.price}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
                                    <HiOutlineInformationCircle className="w-4 h-4 text-[#457B9D]" />
                                    درباره این رشته ورزشی:
                                </h4>
                                <p className="text-xs text-[#457B9D] leading-relaxed text-justify bg-[#F1FAEE]/50 p-3 rounded-xl">
                                    {selectedCourse.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[#1D3557]">مزایا و خدمات اختصاصی دوره:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1D3557]">
                                    {selectedCourse.features.map((feat, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[#F1FAEE] p-2 rounded-lg border border-[#A8DADC]/30">
                                            <HiOutlineCheck className="text-emerald-600 w-4 h-4 shrink-0" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                                <strong>پیش‌نیاز شرکت در دوره:</strong> {selectedCourse.prerequisites}
                            </div>

                            <div className="pt-4 border-t border-[#A8DADC]/40 flex gap-3">
                                <button
                                    onClick={() => handleStartBooking(selectedCourse)}
                                    className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md text-center"
                                >
                                    تایید و انتقال به رزرو دوره
                                </button>
                                <button
                                    onClick={() => setSelectedCourse(null)}
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
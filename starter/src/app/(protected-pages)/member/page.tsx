'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineBadgeCheck,
    HiOutlineCheck,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineUserGroup,
    HiOutlineX,
    HiOutlineInformationCircle,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineLocationMarker,
    HiOutlineAcademicCap,
    HiOutlineCreditCard,
    HiOutlineTicket,
    HiOutlineArrowRight,
    HiOutlineGlobeAlt,
    HiOutlineSwitchHorizontal,
    HiOutlineHashtag,
    HiOutlineExclamationCircle,
} from 'react-icons/hi'
import { BiDumbbell } from 'react-icons/bi'

interface Course {
    id: number
    title: string
    instructor: string
    time: string
    capacity: string
    image: string
    tag: string
    description: string
    prerequisites: string
    features: string[]
    price: string
    location?: string
    startDate?: string
}

// لیست سانس‌های نمونه برای کامپوننت رزرو
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

export default function MemberDashboard() {
    const sliderRef = useRef<HTMLDivElement>(null)
    const coursesSectionRef = useRef<HTMLDivElement>(null)

    // مدیریت وضعیت Drag / Touch
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    // مدیریت وضعیت مدال و صفحه رزرو
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [activeBookingCourse, setActiveBookingCourse] = useState<Course | null>(null)

    const availableCourses: Course[] = [
        {
            id: 1,
            title: 'دوره جامع کراس‌فیت',
            instructor: 'استاد علی رضایی',
            time: 'روزهای زوج - ۱۷:۰۰ الی ۱۸:۳۰',
            capacity: 'ظرفیت ۴ نفر',
            image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
            tag: 'پرطرفدار',
            description: 'دوره تخصصی کراس‌فیت ترکیبی از تمرینات وزنه‌برداری، آمادگی جسمانی، هوازی و ژیمناستیک برای افزایش قدرت، استقامت و توان متقاطع بدن می‌باشد.',
            prerequisites: 'حداقل ۳ ماه سابقه بدنسازی عمومی یا آمادگی اولیه',
            features: ['برنامه رژیم غذایی اختصاصی', 'آنالیز ترکیب بدن (InBody) رایگان', 'اصلاح تکنیک‌های حرکتی تخصصی', 'پشتیبانی مستقیم مربی'],
            price: '۱,۲۰۰,۰۰۰ تومان',
            location: 'سالن شماره ۱ (مرکزی)',
            startDate: '۰۱ تیر ۱۴۰۴',
        },
        {
            id: 2,
            title: 'کلاس تخصصی یوگا و تمرکز',
            instructor: 'مربی سارا محمدی',
            time: 'یکشنبه و سه شنبه - ۰۹:۰۰ الی ۱۰:۳۰',
            capacity: 'ظرفیت ۲ نفر',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400',
            tag: 'آرامش بخش',
            description: 'تمرینات ساختاریافته برای افزایش انعطاف‌پذیری، کاهش استرس کاری، بهبود کیفیت خواب و تمرکز ذهن همراه با تکنیک‌های تنفسی پرانایاما.',
            prerequisites: 'بدون نیاز به پیش‌نیاز (مناسب تمامی سطوح)',
            features: ['تمرینات مدیتیشن پایان جلسه', 'اصلاح الگوی قامت و ستون فقرات', 'محیط کاملاً آرام و استاندارد'],
            price: '۹۵۰,۰۰۰ تومان',
            location: 'استودیو آرامش (طبقه ۲)',
            startDate: '۰۵ تیر ۱۴۰۴',
        },
        {
            id: 3,
            title: 'تمرینات چربی‌سوزی HIIT',
            instructor: 'استاد کامران حسینی',
            time: 'روزهای فرد - ۱۸:۳۰ الی ۲۰:۰۰',
            capacity: 'تکمیل ظرفیت',
            image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&q=80&w=400',
            tag: 'شدت بالا',
            description: 'تمرینات اینتروال پرشدت (HIIT) طراحی شده جهت حداکثر کالری‌سوزی در کوتاه‌ترین زمان، تقویت سیستم قلبی عروقی و چربی‌سوزی پایدار.',
            prerequisites: 'سلامت کامل سیستم قلبی-عروقی',
            features: ['پایش ضربان قلب در حین تمرین', 'کالری‌سوزی تا ۲۴ ساعت پس از تمرین', 'تمرینات گروهی پرانرژی'],
            price: '۱,۱۰۰,۰۰۰ تومان',
            location: 'سالن اصلی',
            startDate: '۰۲ تیر ۱۴۰۴',
        },
        {
            id: 4,
            title: 'آمادگی جسمانی و بدنسازی',
            instructor: 'مربی رضا کاظمی',
            time: 'همه روزه - ۰۸:۰۰ الی ۲۰:۰۰',
            capacity: 'ظرفیت آزاد',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
            tag: 'عمومی',
            description: 'تمرینات استاندارد بدنسازی، هایپرتروفی و افزایش حجم عضلانی تحت نظر مستقیم مربیان ارشد همراه با برنامه‌ریزی ماهانه.',
            prerequisites: 'بدون پیش‌نیاز',
            features: ['طراحی برنامه اختصاصی ماهانه', 'پشتیبانی و رفع اشکال حضوری', 'دسترسی به کلیه دستگاه‌ها'],
            price: '۱,۵۰۰,۰۰۰ تومان',
            location: 'سالن بدنسازی آقایان/بانوان',
            startDate: 'هر روز هفته',
        },
    ]

    const recentAttendance = [
        { id: 1, date: '۰۳ خرداد', day: 'جمعه', time: '۰۶:۴۵ - ۰۷:۴۵', class: 'تمرین قدرت', location: 'سالن اصلی', status: 'present' },
        { id: 2, date: '۰۱ خرداد', day: 'چهارشنبه', time: '۰۷:۰۰ - ۰۸:۰۰', class: 'کلاس HIIT', location: 'استودیو ۱', status: 'present' },
        { id: 3, date: '۲۹ اردیبهشت', day: 'دوشنبه', time: '۱۸:۳۰ - ۱۹:۳۰', class: 'تمرین هوازی', location: 'سالن اصلی', status: 'present' },
    ]

    // شروع فرایند رزرو دوره و ورود به کامپوننت رزرو
    const handleStartBooking = (course?: Course) => {
        const targetCourse = course || availableCourses[0]
        setSelectedCourse(null)
        setActiveBookingCourse(targetCourse)
    }

    // کنترل سواپ / Drag کاروسل
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!sliderRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - sliderRef.current.offsetLeft)
        setScrollLeft(sliderRef.current.scrollLeft)
    }

    const handleMouseLeaveOrUp = () => setIsDragging(false)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return
        e.preventDefault()
        const x = e.pageX - sliderRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        sliderRef.current.scrollLeft = scrollLeft - walk
    }

    const scrollByButtons = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const amount = 300
            sliderRef.current.scrollTo({
                left: direction === 'right' ? sliderRef.current.scrollLeft + amount : sliderRef.current.scrollLeft - amount,
                behavior: 'smooth',
            })
        }
    }

    // اگر دوره جهت رزرو انتخاب شده باشد، کامپوننت رزرو ۳ مرحله‌ای رندر می‌شود
    if (activeBookingCourse) {
        return (
            <CourseReservationPage 
                course={activeBookingCourse} 
                onBack={() => setActiveBookingCourse(null)} 
            />
        )
    }

    return (
        <div className="p-6 space-y-6 dir-rtl bg-[#F1FAEE] min-h-screen text-[#1D3557]">
            {/* کلاس‌های CSS برای مخفی کردن کامل اسکرول‌بار */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* 1. هدر خوش‌آمدگویی */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E63946] shrink-0">
                        <Image
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                            alt="تصویر کاربر"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1D3557]">
                            خوش آمدی، <span className="text-[#E63946]">الکس!</span>
                        </h1>
                        <p className="text-sm text-[#457B9D] mt-1">
                            امروز برای رسیدن به اهدافت آماده‌ای؟
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#A8DADC]/30 border border-[#A8DADC] text-[#1D3557] px-4 py-3 rounded-xl self-start md:self-auto">
                    <HiOutlineBadgeCheck className="w-6 h-6 shrink-0 text-[#E63946]" />
                    <div>
                        <div className="text-sm font-bold">اشتراک فعال</div>
                        <div className="text-xs text-[#457B9D]">همه سیستم‌ها آماده‌اند! ادامه بده!</div>
                    </div>
                </div>
            </div>

            {/* 2. کارت‌های آمار سریع */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center shrink-0">
                        <HiOutlineCalendar className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold uppercase">روزهای باقی‌مانده</span>
                        <div className="text-2xl font-black text-[#1D3557]">۲۸ روز</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#F1FAEE" strokeWidth="4" fill="transparent" />
                            <circle cx="24" cy="24" r="20" stroke="#457B9D" strokeWidth="4" strokeDasharray={125} strokeDashoffset={125 - (125 * 82) / 100} strokeLinecap="round" fill="transparent" />
                        </svg>
                        <span className="absolute text-xs font-bold text-[#1D3557]">۸۲٪</span>
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold uppercase">میزان حضور</span>
                        <div className="text-2xl font-black text-[#1D3557]">۸۲٪</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A8DADC]/30 text-[#457B9D] flex items-center justify-center shrink-0">
                        <BiDumbbell className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#457B9D] font-semibold uppercase">کلاس‌های رزرو شده</span>
                        <div className="text-2xl font-black text-[#1D3557]">۳ کلاس</div>
                    </div>
                </div>
            </div>

            {/* 3. جزئیات اشتراک + سوابق حضور */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <div className="text-xs font-bold text-[#457B9D] uppercase mb-4">اشتراک فعال</div>
                        <div className="flex flex-col sm:flex-row gap-5 items-center bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/30">
                            <div className="relative w-full sm:w-36 h-32 rounded-lg overflow-hidden shrink-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300"
                                    alt="برنامه بدنسازی"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-2 w-full">
                                <h3 className="text-xl font-black text-[#1D3557]">برنامه بدنسازی ویژه (Premium)</h3>
                                <div className="text-xs text-[#E63946] font-bold">★ دسترسی نامحدود به تمام امکانات</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#A8DADC]/40">
                        {/* کلیک مستقیم جهت اتصال به کامپوننت رزرو دوره */}
                        <button 
                            onClick={() => handleStartBooking()}
                            className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm text-center"
                        >
                            تمدید اشتراک برای رزرو دوره
                        </button>

                        <button 
                            onClick={() => setSelectedCourse(availableCourses[0])}
                            className="flex-1 bg-[#A8DADC]/30 hover:bg-[#A8DADC]/50 active:scale-[0.98] text-[#1D3557] font-bold py-3 px-4 rounded-xl transition-all text-sm text-center"
                        >
                            مشاهده جزئیات کامل اشتراک
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[#457B9D] uppercase">سوابق اخیر حضور</span>
                    </div>
                    <div className="space-y-3">
                        {recentAttendance.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-[#A8DADC]/20">
                                <div>
                                    <div className="text-xs font-bold text-[#1D3557]">{item.class}</div>
                                    <div className="text-[11px] text-[#457B9D]">{item.date} • {item.time}</div>
                                </div>
                                <HiOutlineCheckCircle className="w-5 h-5 text-[#457B9D]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. کاروسل لمسی دوره‌ها (مخفی بودن اسکرول بار) */}
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

            {/* 5. مدال جامع اطلاعات کامل دوره ورزشی */}
            {selectedCourse && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedCourse(null)}
                >
                    <div 
                        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#A8DADC] space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* تصویر و بنر دوره */}
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

                        {/* اطلاعات تفصیلی ورزش */}
                        <div className="p-6 space-y-5">
                            <div>
                                <h3 className="text-2xl font-black text-[#1D3557]">{selectedCourse.title}</h3>
                                <p className="text-xs text-[#457B9D] mt-1 font-semibold">مربی رسمی: {selectedCourse.instructor}</p>
                            </div>

                            {/* شبکه‌بندی خلاصه مشخصات اصلی */}
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

                            {/* توضیحات جامع دوره */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[#1D3557] flex items-center gap-1.5">
                                    <HiOutlineInformationCircle className="w-4 h-4 text-[#457B9D]" />
                                    درباره این رشته ورزشی:
                                </h4>
                                <p className="text-xs text-[#457B9D] leading-relaxed text-justify bg-[#F1FAEE]/50 p-3 rounded-xl">
                                    {selectedCourse.description}
                                </p>
                            </div>

                            {/* امكانات و خدمات ویژه */}
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

                            {/* پیش‌نیاز دوره */}
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                                <strong>پیش‌نیاز شرکت در دوره:</strong> {selectedCourse.prerequisites}
                            </div>

                            {/* اکشن‌های مدال */}
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

{/* 6. کامپوننت رزرو دوره (CourseReservationPage) با مراحل ۳ گانه کامل */}
function CourseReservationPage({ course, onBack }: { course: Course; onBack: () => void }) {
    const router = useRouter()
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
    const [serverDateTime, setServerDateTime] = useState<string>('در حال دریافت...')
    const [cardToCardData, setCardToCardData] = useState({
        trackingCode: '',
        userCardNumber: '',
    })

    // مودال هشدار و پیام‌ها
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
        const now = new Date()
        const formattedDate = new Intl.DateTimeFormat('fa-IR', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(now)

        setServerDateTime(formattedDate)
    }, [])

    // محاسبه قیمت‌ها
    const rawPrice = parseInt(course.price.replace(/[^0-9]/g, '')) || 0
    const discountAmount = (rawPrice * appliedDiscount) / 100
    const finalPrice = rawPrice - discountAmount

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
            {/* هدر رزرو */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#A8DADC] shadow-sm">
                <button
                    onClick={() => (step > 1 ? setStep((prev) => (prev - 1) as 1 | 2 | 3) : onBack())}
                    className="flex items-center gap-2 text-xs font-bold text-[#457B9D] hover:text-[#1D3557] transition-colors"
                >
                    <HiOutlineArrowRight className="w-4 h-4" />
                    <span>{step > 1 ? 'مرحله قبل' : 'بازگشت به داشبورد'}</span>
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

            {/* مرحله ۱: اطلاعات شخصی */}
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

            {/* مرحله ۲: سانس و دوره */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-start border-b border-[#A8DADC]/40 pb-4">
                            <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                <Image src={course.image} alt={course.title} fill className="object-cover" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-[#1D3557]">{course.title}</h2>
                                <p className="text-xs text-[#457B9D] leading-relaxed">{course.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-[#1D3557] pt-1">
                                    <span className="flex items-center gap-1">
                                        <HiOutlineAcademicCap className="w-4 h-4 text-[#457B9D]" /> مربی: {course.instructor}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HiOutlineLocationMarker className="w-4 h-4 text-[#457B9D]" /> سالن: {course.location || 'سالن اصلی'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HiOutlineCalendar className="w-4 h-4 text-[#457B9D]" /> شروع: {course.startDate || 'هفته جاری'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F1FAEE] p-4 rounded-xl border border-[#A8DADC]/60 space-y-2 text-xs">
                            <p className="font-bold text-[#1D3557]">پیش‌نیاز دوره:</p>
                            <p className="text-[#457B9D]">{course.prerequisites}</p>
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

            {/* مرحله ۳: کد تخفیف و انتخاب درگاه */}
            {step === 3 && (
                <div className="bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm space-y-6">
                    <div className="border-b border-[#A8DADC]/40 pb-3">
                        <h2 className="text-base font-bold text-[#1D3557] flex items-center gap-2">
                            <HiOutlineCreditCard className="w-5 h-5 text-[#E63946]" />
                            خلاصه فاکتور و انتخاب روش پرداخت
                        </h2>
                    </div>

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

                    <div className="space-y-2 text-xs text-[#1D3557] border-t border-[#A8DADC]/40 pt-4">
                        <div className="flex justify-between py-1">
                            <span className="text-[#457B9D]">عنوان دوره:</span>
                            <span className="font-bold">{course.title}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-[#457B9D]">ورزشکار:</span>
                            <span className="font-bold">{userInfo.fullName} ({userInfo.phone})</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-[#457B9D]">قیمت دوره:</span>
                            <span>{course.price}</span>
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
                                            تاریخ ثبت سرور:
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

            {/* پاپ‌آپ مدال پیغام‌ها */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in dir-rtl">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#A8DADC] space-y-4 text-center transform transition-all scale-100 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HiOutlineX className="w-5 h-5" />
                        </button>

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

                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-[#1D3557]">{modalConfig.title}</h3>
                            <p className="text-xs text-[#457B9D] leading-relaxed">{modalConfig.message}</p>
                        </div>

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
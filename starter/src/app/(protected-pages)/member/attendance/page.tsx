'use client'

import React, { useState } from 'react'
import Select from '@/components/ui/Select'
import {
    HiOutlineClipboardCheck,
    HiCheck,
    HiX,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineUserCircle,
    HiOutlineAcademicCap,
} from 'react-icons/hi'

export interface OptionType {
    value: string
    label: string
}

interface AttendanceRecord {
    id: number
    sessionNumber: number
    date: string
    dayOfWeek: string
    time: string
    isPresent: boolean
}

interface CourseAttendance {
    courseId: number
    courseTitle: string
    instructor: string
    totalSessions: number
    records: AttendanceRecord[]
}

const mockAttendanceData: CourseAttendance[] = [
    {
        courseId: 1,
        courseTitle: 'دوره تخصصی بدنسازی و فرم‌دهی بدنی',
        instructor: 'استاد علی رضایی',
        totalSessions: 12,
        records: [
            {
                id: 101,
                sessionNumber: 1,
                date: '۱۴۰۵/۰۶/۰۱',
                dayOfWeek: 'پنج‌شنبه',
                time: '۱۶:۰۰ - ۱۷:۳۰',
                isPresent: true,
            },
            {
                id: 102,
                sessionNumber: 2,
                date: '۱۴۰۵/۰۶/۰۴',
                dayOfWeek: 'یکشنبه',
                time: '۱۶:۰۰ - ۱۷:۳۰',
                isPresent: true,
            },
            {
                id: 103,
                sessionNumber: 3,
                date: '۱۴۰۵/۰۶/۰۶',
                dayOfWeek: 'سه‌شنبه',
                time: '۱۶:۰۰ - ۱۷:۳۰',
                isPresent: false,
            },
            {
                id: 104,
                sessionNumber: 4,
                date: '۱۴۰۵/۰۶/۰۸',
                dayOfWeek: 'پنج‌شنبه',
                time: '۱۶:۰۰ - ۱۷:۳۰',
                isPresent: true,
            },
            {
                id: 105,
                sessionNumber: 5,
                date: '۱۴۰۵/۰۶/۱۱',
                dayOfWeek: 'یکشنبه',
                time: '۱۶:۰۰ - ۱۷:۳۰',
                isPresent: true,
            },
        ],
    },
    {
        courseId: 2,
        courseTitle: 'دوره آرامش و انعطاف‌پذیری یوگا',
        instructor: 'استاد مریم امیری',
        totalSessions: 8,
        records: [
            {
                id: 201,
                sessionNumber: 1,
                date: '۱۴۰۵/۰۶/۱۰',
                dayOfWeek: 'شنبه',
                time: '۱۷:۰۰ - ۱۸:۳۰',
                isPresent: true,
            },
            {
                id: 202,
                sessionNumber: 2,
                date: '۱۴۰۵/۰۶/۱۲',
                dayOfWeek: 'دوشنبه',
                time: '۱۷:۰۰ - ۱۸:۳۰',
                isPresent: true,
            },
            {
                id: 203,
                sessionNumber: 3,
                date: '۱۴۰۵/۰۶/۱۴',
                dayOfWeek: 'چهارشنبه',
                time: '۱۷:۰۰ - ۱۸:۳۰',
                isPresent: false,
            },
        ],
    },
]

const filterOptions: OptionType[] = [
    { value: 'all', label: 'همه کلاس‌ها' },
    ...mockAttendanceData.map((course) => ({
        value: String(course.courseId),
        label: course.courseTitle,
    })),
]

export default function AttendanceHistoryPage() {
    const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(
        filterOptions[0],
    )

    const displayedCourses =
        !selectedCategory || selectedCategory.value === 'all'
            ? mockAttendanceData
            : mockAttendanceData.filter(
                  (c) => String(c.courseId) === selectedCategory.value,
              )

    return (
        <div className="p-6 space-y-8 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl max-w-6xl mx-auto">
            {/* هدر صفحه */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#A8DADC] shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#1D3557]/10 rounded-xl text-[#1D3557]">
                        <HiOutlineClipboardCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-[#1D3557]">
                            سوابق حضور و غیاب
                        </h1>
                        <p className="text-xs md:text-sm text-[#457B9D] mt-1">
                            جدول وضعیت حضور در جلسات تمرینی به تفکیک هر کلاس
                        </p>
                    </div>
                </div>

                {/* فیلتر کلاس‌ها */}
                <div className="w-full md:w-64">
                    <Select<OptionType>
                        options={filterOptions}
                        value={selectedCategory}
                        onChange={(option) => setSelectedCategory(option)}
                        placeholder="انتخاب کلاس"
                    />
                </div>
            </div>

            {/* جداول حضور و غیاب */}
            <div className="space-y-8">
                {displayedCourses.length > 0 ? (
                    displayedCourses.map((course) => {
                        const remainingCount =
                            course.totalSessions - course.records.length

                        return (
                            <div
                                key={course.courseId}
                                className="bg-white rounded-2xl border border-[#A8DADC] shadow-sm overflow-hidden space-y-4 p-6"
                            >
                                {/* هدر کلاس */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A8DADC]/50 pb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineAcademicCap className="w-5 h-5 text-[#E63946]" />
                                            <h2 className="text-base md:text-lg font-bold text-[#1D3557]">
                                                {course.courseTitle}
                                            </h2>
                                        </div>
                                        <p className="text-xs text-[#457B9D] flex items-center gap-1">
                                            <HiOutlineUserCircle className="w-4 h-4" />
                                            مربی: {course.instructor}
                                        </p>
                                    </div>

                                    {/* تنها نمایش تعداد جلسات باقیمانده */}
                                    <div className="text-xs font-bold text-[#457B9D] bg-[#F1FAEE] border border-[#A8DADC] px-3 py-1.5 rounded-xl">
                                        جلسات باقیمانده: {remainingCount} جلسه
                                    </div>
                                </div>

                                {/* جدول */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-xs">
                                        <thead>
                                            <tr className="bg-[#F1FAEE] text-[#1D3557] border-b border-[#A8DADC]">
                                                <th className="py-3.5 px-4 font-bold rounded-r-xl">
                                                    جلسه
                                                </th>
                                                <th className="py-3.5 px-4 font-bold">
                                                    تاریخ
                                                </th>
                                                <th className="py-3.5 px-4 font-bold">
                                                    ساعت
                                                </th>
                                                <th className="py-3.5 px-4 font-bold rounded-l-xl text-center">
                                                    وضعیت
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#A8DADC]/40">
                                            {course.records.map((record) => (
                                                <tr
                                                    key={record.id}
                                                    className="hover:bg-[#F1FAEE]/50 transition-colors"
                                                >
                                                    <td className="py-3.5 px-4 font-bold text-[#1D3557]">
                                                        جلسه{' '}
                                                        {record.sessionNumber}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-[#457B9D]">
                                                        <span className="flex items-center gap-1.5">
                                                            <HiOutlineCalendar className="w-4 h-4 text-[#1D3557]" />
                                                            {record.dayOfWeek}{' '}
                                                            {record.date}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-[#457B9D]">
                                                        <span className="flex items-center gap-1.5">
                                                            <HiOutlineClock className="w-4 h-4 text-[#1D3557]" />
                                                            {record.time}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        {record.isPresent ? (
                                                            <HiCheck className="w-4 h-4 text-emerald-600 inline-block stroke-[3]" />
                                                        ) : (
                                                            <HiX className="w-4 h-4 text-[#E63946] inline-block stroke-[3]" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-[#A8DADC] text-center space-y-3">
                        <p className="text-[#1D3557] font-bold">
                            هیچ سابقه حضور و غیابی برای این کلاس یافت نشد.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

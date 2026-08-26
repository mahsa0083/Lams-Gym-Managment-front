'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import {
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineExclamation,
  HiOutlineTag,
  HiOutlineCheckCircle
} from 'react-icons/hi'

export interface OptionType {
  value: string
  label: string
}

export interface Course {
  id: number
  title: string
  trainerName: string
  trainerAvatar: string
  specialty: string
  capacity: number
  enrolledCount: number
  price: string
  status: 'active' | 'full' | 'completed' | 'suspended'
  schedule: {
    days: string
    time: string
    location: string
  }
  registeredStudents: {
    id: number
    name: string
    phone: string
  }[]
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: 'دوره جامع بدنسازی و فیتنس',
    trainerName: 'امیر رضایی',
    trainerAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    specialty: 'bodybuilding',
    capacity: 15,
    enrolledCount: 12,
    price: '۱,۲۰۰,۰۰۰ تومان',
    status: 'active',
    schedule: {
      days: 'شنبه، چهارشنبه',
      time: '15:00 الی 18:00',
      location: 'سالن وزنه - اصلی',
    },
    registeredStudents: [
      { id: 101, name: 'رضا محمدی', phone: '۰۹۱۲۱۱۱۲۲۳۳' },
      { id: 102, name: 'سارا کاویانی', phone: '۰۹۱۹۲۲۲۳۳۴۴' },
      { id: 103, name: 'علی نوری', phone: '۰۹۳۵۳۳۳۴۴۵۵' },
    ],
  },
  {
    id: 2,
    title: 'کلاس تخصصی هاتایوگا و تمرکز',
    trainerName: 'مریم کاظمی',
    trainerAvatar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300',
    specialty: 'yoga',
    capacity: 10,
    enrolledCount: 10,
    price: '۹۵۰,۰۰۰ تومان',
    status: 'full',
    schedule: {
      days: 'یکشنبه، سه‌شنبه',
      time: '10:00 الی 12:00',
      location: 'سالن یوگا - طبقه ۲',
    },
    registeredStudents: [
      { id: 201, name: 'مهتاب علوی', phone: '۰۹۱۲۴۴۴۵۵۶۶' },
      { id: 202, name: 'الناز صبوری', phone: '۰۹۱۹۵۵۵۶۶۷۷' },
    ],
  },
]

const filterOptions: OptionType[] = [
  { value: 'all', label: 'همه رشته‌های ورزشی' },
  { value: 'bodybuilding', label: 'بدنسازی و پرورشی' },
  { value: 'fitness', label: 'فیتنس و کراس‌فیت' },
  { value: 'yoga', label: 'یوگا و مدیتیشن' },
]

const trainerOptions: OptionType[] = [
  { value: 'امیر رضایی', label: 'امیر رضایی (بدنسازی)' },
  { value: 'مریم کاظمی', label: 'مریم کاظمی (یوگا)' },
]

const specialtyOptions: OptionType[] = [
  { value: 'bodybuilding', label: 'بدنسازی و پرورشی' },
  { value: 'fitness', label: 'فیتنس و کراس‌فیت' },
  { value: 'yoga', label: 'یوگا و مدیتیشن' },
]

const locationOptions: OptionType[] = [
  { value: 'سالن وزنه - اصلی', label: 'سالن وزنه - اصلی' },
  { value: 'سالن یوگا - طبقه ۲', label: 'سالن یوگا - طبقه ۲' },
  { value: 'سالن کراس‌فیت', label: 'سالن کراس‌فیت' },
  { value: 'سالن هوازی', label: 'سالن هوازی' },
]

const hourOptions: OptionType[] = Array.from({ length: 24 }, (_, i) => {
  const hour = (i + 1).toString().padStart(2, '0')
  return { value: hour, label: hour }
})

const minuteOptions: OptionType[] = Array.from({ length: 60 }, (_, i) => {
  const min = (i + 1).toString().padStart(2, '0')
  return { value: min, label: min }
})

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'دوشنبه']

export default function AdminCoursesListPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>(initialCourses)

  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(filterOptions[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState<OptionType[]>([])
  const [isPending, startTransition] = useTransition()

  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null)
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)

  const [selectedDays, setSelectedDays] = useState<string[]>([])
  
  const [startHour, setStartHour] = useState<OptionType | null>(hourOptions[14])
  const [startMinute, setStartMinute] = useState<OptionType | null>(minuteOptions[59])
  const [endHour, setEndHour] = useState<OptionType | null>(hourOptions[17])
  const [endMinute, setEndMinute] = useState<OptionType | null>(minuteOptions[59])
  
  const [selectedLocation, setSelectedLocation] = useState<OptionType | null>(locationOptions[0])
  const [selectedTrainer, setSelectedTrainer] = useState<OptionType | null>(trainerOptions[0])

  const [formData, setFormData] = useState({
    title: '',
    specialty: specialtyOptions[0],
    capacity: 15,
    price: '',
  })

  // خواندن دوره‌های اضافه شده از صفحه افزودن دوره
  useEffect(() => {
    const stored = localStorage.getItem('app_courses')
    if (stored) {
      try {
        const parsedStored = JSON.parse(stored)
        // تبدیل فرمت ذخیره‌شده به فرمت کارت‌های شما در صورت لزوم
        const formattedStored: Course[] = parsedStored.map((c: any) => ({
          id: c.id || Date.now(),
          title: c.title || 'دوره بدون عنوان',
          trainerName: c.trainerName || 'مربی تعیین نشده',
          trainerAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
          specialty: c.specialty || 'bodybuilding',
          capacity: Number(c.capacity) || 10,
          enrolledCount: 0,
          price: c.fullCoursePrice ? `${c.fullCoursePrice} تومان` : '۰ تومان',
          status: c.status === 'suspended' ? 'suspended' : 'active',
          schedule: {
            days: c.schedule?.days || 'تعیین نشده',
            time: c.schedule?.time || '۰۰:۰۰ الی ۰۰:۰۰',
            location: c.location || 'سالن اصلی',
          },
          registeredStudents: [],
        }))
        setCourses([...formattedStored, ...initialCourses])
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSearchInputChange = (value: string) => {
    const trimmed = value.trim().toLowerCase()
    setSearchQuery(value)

    if (!trimmed) {
      setSearchOptions([])
      return
    }

    startTransition(() => {
      const matches = courses
        .filter((c) => c.title.toLowerCase().includes(trimmed) || c.trainerName.toLowerCase().includes(trimmed))
        .map((c) => ({
          value: c.title,
          label: `${c.title} (${c.trainerName})`,
        }))
      setSearchOptions(matches)
    })
  }

  const toggleExpand = (id: number) => {
    setExpandedCourseId((prev) => (prev === id ? null : id))
  }

  // هدایت مستقیم به صفحه افزودن دوره
  const handleOpenAddModal = () => {
    router.push('/admin/course/add-course')
  }

  const handleOpenEditModal = (course: Course) => {
    setEditingCourseId(course.id)

    const currentSpecialty = specialtyOptions.find((opt) => opt.value === course.specialty) || specialtyOptions[0]
    const currentTrainer = trainerOptions.find((opt) => opt.value === course.trainerName) || trainerOptions[0]

    setFormData({
      title: course.title,
      specialty: currentSpecialty,
      capacity: course.capacity,
      price: course.price.replace(' تومان', ''),
    })

    setSelectedTrainer(currentTrainer)

    if (course.schedule) {
      const daysArr = course.schedule.days ? course.schedule.days.split('، ') : []
      setSelectedDays(daysArr)

      if (course.schedule.time) {
        const [startStr, endStr] = course.schedule.time.split(' الی ')
        if (startStr) {
          const [h, m] = startStr.split(':')
          setStartHour(hourOptions.find((o) => o.value === h) || hourOptions[0])
          setStartMinute(minuteOptions.find((o) => o.value === m) || minuteOptions[0])
        }
        if (endStr) {
          const [h, m] = endStr.split(':')
          setEndHour(hourOptions.find((o) => o.value === h) || hourOptions[0])
          setEndMinute(minuteOptions.find((o) => o.value === m) || minuteOptions[0])
        }
      }

      const matchedLoc = locationOptions.find((l) => l.value === course.schedule.location) || locationOptions[0]
      setSelectedLocation(matchedLoc)
    }

    setShowFormModal(true)
  }

  const handleCancelForm = () => {
    setShowFormModal(false)
  }

  const confirmDelete = () => {
    if (deleteCourseId !== null) {
      setCourses((prev) => prev.filter((c) => c.id !== deleteCourseId))
      setDeleteCourseId(null)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedScheduleDays = selectedDays.length > 0 ? selectedDays.join('، ') : 'تعیین نشده'
    const startTimeString = startHour && startMinute ? `${startHour.value}:${startMinute.value}` : '00:00'
    const endTimeString = endHour && endMinute ? `${endHour.value}:${endMinute.value}` : '00:00'
    const formattedTimeString = `${startTimeString} الی ${endTimeString}`
    const formattedLocation = selectedLocation ? selectedLocation.value : 'سالن اصلی'

    if (editingCourseId) {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === editingCourseId) {
            return {
              ...c,
              title: formData.title,
              specialty: formData.specialty ? formData.specialty.value : c.specialty,
              trainerName: selectedTrainer ? selectedTrainer.value : c.trainerName,
              capacity: Number(formData.capacity) || 0,
              price: formData.price ? `${formData.price} تومان` : c.price,
              schedule: {
                days: formattedScheduleDays,
                time: formattedTimeString,
                location: formattedLocation,
              },
            }
          }
          return c
        })
      )
    } else {
      const newCourse: Course = {
        id: Date.now(),
        title: formData.title,
        trainerName: selectedTrainer ? selectedTrainer.value : 'مربی تعیین نشده',
        trainerAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
        specialty: formData.specialty ? formData.specialty.value : 'bodybuilding',
        capacity: Number(formData.capacity) || 10,
        enrolledCount: 0,
        price: formData.price ? `${formData.price} تومان` : '۰ تومان',
        status: 'active',
        schedule: {
          days: formattedScheduleDays,
          time: formattedTimeString,
          location: formattedLocation,
        },
        registeredStudents: [],
      }
      setCourses([newCourse, ...courses])
    }

    setShowFormModal(false)
  }

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      !selectedCategory || selectedCategory.value === 'all' || c.specialty === selectedCategory.value
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.trainerName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-6 bg-[var(--primary-subtle)] min-h-screen text-[var(--primary)] dir-rtl" data-role="ADMIN">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar,
        body::-webkit-scrollbar,
        html::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .no-scrollbar,
        body,
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* هدر اصلی */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">مدیریت دوره‌ها و کلاس‌ها</h1>
          <p className="text-sm text-[var(--primary-mild)] mt-1">
            تعریف دوره‌های آموزشی، تخصیص مربی، برنامه‌ریزی سانس‌ها و مدیریت اعضا
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* اتصال مستقیم دکمه تعریف دوره به صفحه افزودن دوره */}
          <Link
            href="/admin/course/add-course"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-mild)] text-white font-medium text-xs px-5 py-3 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <span>تعریف دوره جدید</span>
          </Link>

          <div className="w-full sm:w-60">
            <Select<OptionType>
              isSearchable
              isLoading={isPending}
              placeholder="جستجوی عنوان یا مربی..."
              noOptionsMessage={() => (isPending ? 'در حال جستجو...' : 'دوره‌ای یافت نشد')}
              options={searchOptions}
              onInputChange={handleSearchInputChange}
              onChange={(opt) => setSearchQuery(opt?.value || '')}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select<OptionType>
              options={filterOptions}
              value={selectedCategory}
              onChange={(option) => setSelectedCategory(option)}
              placeholder="دسته‌بندی ورزشی"
            />
          </div>
        </div>
      </div>

      {/* لیست کارت‌های دوره‌ها */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--primary-mild)]/40 shrink-0 shadow-inner bg-[var(--primary-subtle)]">
                      <Image
                        src={course.trainerAvatar}
                        alt={course.trainerName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[var(--primary)]">{course.title}</h3>
                        
                        {/* بج وضعیت تعلیق */}
                        {course.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            در تعلیق
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--primary-mild)] flex items-center gap-1.5 mt-1">
                        <HiOutlineUser className="w-4 h-4 text-[var(--primary-mild)]" />
                        <span>مربی: {course.trainerName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[var(--primary-mild)]/20">
                    <button
                      type="button"
                      onClick={() => toggleExpand(course.id)}
                      className="text-xs font-semibold text-[var(--primary-mild)] hover:text-[var(--primary)] bg-[var(--primary-subtle)] hover:bg-[var(--primary-subtle)]/80 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-[var(--primary-mild)]/30"
                    >
                      <span>{isExpanded ? 'بستن جزئیات' : 'جزئیات تکمیلی'}</span>
                      {isExpanded ? (
                        <HiOutlineChevronUp className="w-4 h-4 text-[var(--primary-deep)]" />
                      ) : (
                        <HiOutlineChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(course)}
                      className="p-2.5 text-[var(--primary-mild)] hover:text-[var(--primary)] bg-[var(--primary-subtle)] hover:bg-[var(--primary-subtle)]/80 border border-[var(--primary-mild)]/30 rounded-xl transition-all"
                      title="ویرایش"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteCourseId(course.id)}
                      className="p-2.5 text-[var(--primary-deep)] bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                      title="حذف"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--primary-mild)]/30 p-6 bg-[var(--primary-subtle)]/40 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineAcademicCap className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">رشته دوره:</span>
                          <span className="font-semibold text-[var(--primary)]">{course.specialty}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineUsers className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">ظرفیت دوره:</span>
                          <span className="font-semibold text-[var(--primary)]">
                            {course.enrolledCount} از {course.capacity} نفر
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineTag className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">شهریه دوره:</span>
                          <span className="font-semibold text-[var(--primary)]">{course.price}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineCheckCircle className="w-6 h-6 text-[var(--primary-deep)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">وضعیت دوره:</span>
                          <span className="font-bold text-[var(--primary-deep)]">
                            {course.status === 'active'
                              ? 'در حال ثبت‌نام'
                              : course.status === 'full'
                              ? 'تکمیل ظرفیت'
                              : course.status === 'suspended'
                              ? 'در تعلیق'
                              : 'پایان‌یافته'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* زمان‌بندی و سالن */}
                    <div className="bg-white p-4 rounded-xl border border-[var(--primary-mild)]/30 space-y-2">
                      <h4 className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                        <HiOutlineClock className="w-4 h-4 text-[var(--primary-mild)]" />
                        <span>زمان‌بندی و سالن برگزاری:</span>
                      </h4>
                      <div className="bg-[var(--primary-subtle)]/60 p-3 rounded-lg border border-[var(--primary-mild)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-semibold flex items-center gap-1">
                          <HiOutlineCalendar className="w-4 h-4 text-[var(--primary-mild)]" />
                          روزها: {course.schedule.days}
                        </span>
                        <span className="text-[var(--primary-mild)] font-mono">ساعت: {course.schedule.time}</span>
                        <span className="text-[11px] text-[var(--primary-mild)] flex items-center gap-1">
                          <HiOutlineOfficeBuilding className="w-4 h-4" />
                          مکان: {course.schedule.location}
                        </span>
                      </div>
                    </div>

                    {/* اعضای ثبت‌نام شده */}
                    <div className="bg-white p-4 rounded-xl border border-[var(--primary-mild)]/30 space-y-2">
                      <h4 className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                        <HiOutlineUsers className="w-4 h-4 text-[var(--primary-mild)]" />
                        <span>لیست اعضای ثبت‌نام‌شده:</span>
                      </h4>
                      {course.registeredStudents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                          {course.registeredStudents.map((student) => (
                            <div
                              key={student.id}
                              className="bg-[var(--primary-subtle)]/40 p-2.5 rounded-lg border border-[var(--primary-mild)]/20 flex items-center justify-between"
                            >
                              <span className="font-semibold text-[var(--primary)]">{student.name}</span>
                              <span className="text-[var(--primary-mild)] font-mono text-[11px]">
                                {student.phone}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--primary-mild)] pt-1">هنوز هیچ عضوی ثبت‌نام نکرده است.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-[var(--primary-mild)]/30 text-center space-y-3">
            <p className="text-[var(--primary)] font-bold">دوره‌ای با این مشخصات یافت نشد.</p>
            <p className="text-xs text-[var(--primary-mild)]">لطفاً عبارت جستجو یا دسته‌بندی ورزشی را تغییر دهید.</p>
          </div>
        )}
      </div>

      {/* مودال ویرایش دوره */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-[var(--primary-mild)]/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[var(--primary-mild)]/20 pb-3">
              <h3 className="text-base font-bold text-[var(--primary)]">
                {editingCourseId ? 'ویرایش اطلاعات دوره' : 'تعریف دوره جدید'}
              </h3>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-[var(--primary-mild)] hover:text-[var(--primary)] p-1 rounded-lg transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--primary)] mb-1">عنوان دوره/کلاس</label>
                <input
                  type="text"
                  required
                  placeholder="مثلا: بدنسازی پیشرفته ترم بهار"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--primary)] mb-1">رشته ورزشی</label>
                  <Select<OptionType>
                    options={specialtyOptions}
                    value={formData.specialty}
                    onChange={(option) => setFormData({ ...formData, specialty: option || specialtyOptions[0] })}
                    placeholder="انتخاب رشته"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--primary)] mb-1">مربی دوره</label>
                  <Select<OptionType>
                    options={trainerOptions}
                    value={selectedTrainer}
                    onChange={(option) => setSelectedTrainer(option)}
                    placeholder="انتخاب مربی..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--primary)] mb-1">ظرفیت دوره (نفر)</label>
                  <input
                    type="number"
                    required
                    placeholder="مثلا: ۱۵"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--primary)] mb-1">شهریه دوره (تومان)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلا: ۱,۲۰۰,۰۰۰"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
                  />
                </div>
              </div>

              <div className="p-4 bg-[var(--primary-subtle)]/60 rounded-xl border border-[var(--primary-mild)]/30 space-y-3">
                <span className="block font-bold text-[var(--primary)] flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-[var(--primary-mild)]" />
                  برنامه زمان‌بندی و سانس دوره:
                </span>

                <div>
                  <label className="block text-[11px] text-[var(--primary-mild)] mb-1.5 font-medium">
                    روزهای برگزاری کلاس:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEK_DAYS.map((day) => {
                      const isSelected = selectedDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                              : 'bg-white text-[var(--primary-mild)] border-[var(--primary-mild)]/30 hover:border-[var(--primary)]'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] text-[var(--primary-mild)] font-medium">زمان شروع کلاس</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Select<OptionType>
                        options={hourOptions}
                        value={startHour}
                        onChange={(option) => setStartHour(option)}
                        placeholder="ساعت (۱ تا ۲۴)"
                      />
                    </div>
                    <div>
                      <Select<OptionType>
                        options={minuteOptions}
                        value={startMinute}
                        onChange={(option) => setStartMinute(option)}
                        placeholder="دقیقه (۱ تا ۶۰)"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] text-[var(--primary-mild)] font-medium">زمان پایان کلاس</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Select<OptionType>
                        options={hourOptions}
                        value={endHour}
                        onChange={(option) => setEndHour(option)}
                        placeholder="ساعت (۱ تا ۲۴)"
                      />
                    </div>
                    <div>
                      <Select<OptionType>
                        options={minuteOptions}
                        value={endMinute}
                        onChange={(option) => setEndMinute(option)}
                        placeholder="دقیقه (۱ تا ۶۰)"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] text-[var(--primary-mild)] mb-1 font-medium">انتخاب سالن / مکان برگزاری</label>
                  <Select<OptionType>
                    options={locationOptions}
                    value={selectedLocation}
                    onChange={(option) => setSelectedLocation(option)}
                    placeholder="انتخاب سالن..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--primary-mild)]/20">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2.5 rounded-xl border border-[var(--primary-mild)]/40 text-[var(--primary-mild)] font-semibold hover:bg-[var(--primary-subtle)] transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[var(--primary)] hover:bg-[var(--primary-mild)] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  {editingCourseId ? 'ثبت تغییرات' : 'ثبت دوره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* دیالوگ تأیید حذف */}
      {deleteCourseId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[var(--primary-mild)]/30 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-[var(--primary-deep)] rounded-full flex items-center justify-center mx-auto">
              <HiOutlineExclamation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--primary)]">حذف دوره</h3>
              <p className="text-xs text-[var(--primary-mild)] mt-1">
                آیا از حذف این دوره اطمینان دارید؟ این عملیات قابل بازگشت نیست.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCourseId(null)}
                className="px-4 py-2 rounded-xl border border-[var(--primary-mild)]/40 text-[var(--primary-mild)] font-medium text-xs hover:bg-[var(--primary-subtle)] transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-[var(--primary-deep)] hover:opacity-90 text-white font-medium text-xs transition-colors"
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
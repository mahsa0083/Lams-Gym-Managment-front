'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import ApiService from '@/services/client/ApiService'
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
  HiOutlineExclamation,
  HiOutlineCheckCircle
} from 'react-icons/hi'

export interface OptionType {
  value: string
  label: string
}

export interface ScheduleItem {
  id?: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface Course {
  id: number
  title: string
  groupName: string
  trainerName: string
  sportName: string
  capacity: number
  remainingCapacity: number
  startDate: string
  isActive?: boolean
  schedules: ScheduleItem[]
  registeredStudents: {
    id: number
    name: string
    phone: string
  }[]
}

const hourOptions: OptionType[] = Array.from({ length: 24 }, (_, i) => {
  const hour = (i + 1).toString().padStart(2, '0')
  return { value: hour, label: hour }
})

const minuteOptions: OptionType[] = Array.from({ length: 60 }, (_, i) => {
  const min = (i + 1).toString().padStart(2, '0')
  return { value: min, label: min }
})

const WEEK_DAYS = [
  { value: 'Saturday', label: 'شنبه' },
  { value: 'Sunday', label: 'یکشنبه' },
  { value: 'Monday', label: 'دوشنبه' },
  { value: 'Tuesday', label: 'سه‌شنبه' },
  { value: 'Wednesday', label: 'چهارشنبه' },
  { value: 'Thursday', label: 'پنج‌شنبه' },
  { value: 'Friday', label: 'جمعه' },
]

export default function AdminCoursesListPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)

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

  const [formData, setFormData] = useState({
    title: '',
    groupName: '',
    capacity: 15,
  })

  // دریافت لیست کلاس‌ها از طریق ApiService
  const fetchGymClasses = async () => {
    try {
      setLoading(true)
      const data = await ApiService.get<any[]>('/gym-classes')
      const formatted: Course[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        groupName: item.groupName || 'گروه اصلی',
        trainerName: item.trainerName || 'مربی تعیین نشده',
        sportName: item.sportName || 'ورزش عمومی',
        capacity: item.capacity,
        remainingCapacity: item.remainingCapacity,
        startDate: item.startDate,
        schedules: item.schedules || [],
        registeredStudents: [],
      }))
      setCourses(formatted)
    } catch (error) {
      console.error('Error fetching gym classes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGymClasses()
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

  // دریافت جزئیات تکمیلی کلاس از طریق ApiService
  const toggleExpand = async (id: number) => {
    if (expandedCourseId === id) {
      setExpandedCourseId(null)
      return
    }

    setExpandedCourseId(id)

    try {
      const detailData = await ApiService.get<any>(`/gym-classes/${id}`)
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...detailData, schedules: detailData.schedules || c.schedules } : c))
      )
    } catch (error) {
      console.error('Error fetching course details:', error)
    }
  }

  const handleOpenEditModal = (course: Course) => {
    setEditingCourseId(course.id)
    setFormData({
      title: course.title,
      groupName: course.groupName,
      capacity: course.capacity,
    })

    if (course.schedules && course.schedules.length > 0) {
      setSelectedDays(course.schedules.map((s) => s.dayOfWeek))
      const firstSchedule = course.schedules[0]
      if (firstSchedule?.startTime) {
        const [h, m] = firstSchedule.startTime.split(':')
        setStartHour(hourOptions.find((o) => o.value === h) || hourOptions[0])
        setStartMinute(minuteOptions.find((o) => o.value === m) || minuteOptions[0])
      }
      if (firstSchedule?.endTime) {
        const [h, m] = firstSchedule.endTime.split(':')
        setEndHour(hourOptions.find((o) => o.value === h) || hourOptions[0])
        setEndMinute(minuteOptions.find((o) => o.value === m) || minuteOptions[0])
      }
    }

    setShowFormModal(true)
  }

  const handleCancelForm = () => {
    setShowFormModal(false)
  }

  // حذف یا غیرفعال‌سازی کلاس از طریق ApiService
  const confirmDelete = async () => {
    if (deleteCourseId !== null) {
      try {
        await ApiService.delete(`/gym-classes/${deleteCourseId}`)
        setCourses((prev) => prev.filter((c) => c.id !== deleteCourseId))
      } catch (error) {
        console.error('Error deleting gym class:', error)
      } finally {
        setDeleteCourseId(null)
      }
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCourseId) {
      try {
        const body = {
          sportId: 1,
          trainerId: 1,
          packageId: 1,
          title: formData.title,
          groupName: formData.groupName,
          capacity: Number(formData.capacity),
        }
        await ApiService.put(`/gym-classes/${editingCourseId}`, body)
        fetchGymClasses()
        setShowFormModal(false)
      } catch (error) {
        console.error('Error updating gym class:', error)
      }
    }
  }

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.trainerName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    return matchesSearch
  })

  return (
    <div className="p-6 bg-[var(--primary-subtle)] min-h-screen text-[var(--primary)] dir-rtl" data-role="ADMIN">
      {/* هدر اصلی */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">مدیریت دوره‌ها و کلاس‌ها</h1>
          <p className="text-sm text-[var(--primary-mild)] mt-1">
            تعریف دوره‌های آموزشی، تخصیص مربی، برنامه‌ریزی سانس‌ها و مدیریت اعضا
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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
        </div>
      </div>

      {/* لیست کارت‌های دوره‌ها */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[var(--primary-mild)]/30 text-center">
            <p className="text-[var(--primary)] font-bold">در حال بارگذاری اطلاعات...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--primary-mild)]/40 shrink-0 shadow-inner bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)] font-bold text-lg">
                      {course.title.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[var(--primary)]">{course.title}</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {course.groupName}
                        </span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineAcademicCap className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">رشته ورزشی:</span>
                          <span className="font-semibold text-[var(--primary)]">{course.sportName}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineUsers className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">ظرفیت دوره:</span>
                          <span className="font-semibold text-[var(--primary)]">
                            {course.capacity - course.remainingCapacity} از {course.capacity} نفر (خالی: {course.remainingCapacity})
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                        <HiOutlineCheckCircle className="w-6 h-6 text-[var(--primary-deep)] shrink-0" />
                        <div>
                          <span className="text-[var(--primary-mild)] block text-[11px]">تاریخ شروع:</span>
                          <span className="font-bold text-[var(--primary-deep)]">{course.startDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* زمان‌بندی */}
                    <div className="bg-white p-4 rounded-xl border border-[var(--primary-mild)]/30 space-y-2">
                      <h4 className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                        <HiOutlineClock className="w-4 h-4 text-[var(--primary-mild)]" />
                        <span>زمان‌بندی کلاس:</span>
                      </h4>
                      <div className="space-y-2">
                        {course.schedules && course.schedules.length > 0 ? (
                          course.schedules.map((sch, idx) => (
                            <div key={idx} className="bg-[var(--primary-subtle)]/60 p-3 rounded-lg border border-[var(--primary-mild)]/20 flex items-center justify-between text-xs">
                              <span className="font-semibold flex items-center gap-1 text-[#4B5694]">
                                <HiOutlineCalendar className="w-4 h-4 text-[#111844]" />
                                روز: {sch.dayOfWeek}
                              </span>
                              <span className="text-[var(--primary)] font-semibold">ساعت: {sch.startTime} الی {sch.endTime}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-[var(--primary-mild)]">برنامه زمانی ثبت نشده است.</p>
                        )}
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
          </div>
        )}
      </div>

      {/* مودال ویرایش دوره */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-[var(--primary-mild)]/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--primary-mild)]/20 pb-3">
              <h3 className="text-base font-bold text-[var(--primary)]">ویرایش اطلاعات دوره</h3>
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--primary)] mb-1">نام گروه</label>
                <input
                  type="text"
                  required
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--primary)] mb-1">ظرفیت دوره (نفر)</label>
                <input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
                />
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
                      const isSelected = selectedDays.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDaySelection(day.value)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                              : 'bg-white text-[var(--primary-mild)] border-[var(--primary-mild)]/30 hover:border-[var(--primary)]'
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
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
                  ثبت تغییرات
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
              <h3 className="text-base font-bold text-[var(--primary)]">غیرفعال‌سازی دوره</h3>
              <p className="text-xs text-[var(--primary-mild)] mt-1">
                آیا از غیرفعال‌سازی این دوره اطمینان دارید؟
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
                تأیید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
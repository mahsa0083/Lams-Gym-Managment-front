'use client'
import React, {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from 'react'
import Image from 'next/image'
import Select from '@/components/ui/Select'


import TrainerFormModal, {
  type CreateTrainerDto,
} from './addcoach/Insertcoach'
import {
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCash,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePlusCircle,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineExclamation
} from 'react-icons/hi'

export interface OptionType {
  value: string
  label: string
}
type GenderType = 0 | 1



interface CreateTrainerFormData {
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  gender: GenderType | null
  specialty: OptionType | null
  baseSalary: number | ''
  commissionPercentage: number | ''
}

interface TrainerFormModalProps {
  isOpen: boolean
  onClose: () => void

  /**
   * بعد از ثبت موفق، payload نهایی اینجا برمی‌گردد.
   * در صفحه‌ی والد می‌توانی API Call اصلی را انجام دهی.
   */
  onSubmit: (data: CreateTrainerDto) => Promise<void> | void
}

export interface Trainer {
  id: number
  firstName: string
  lastName: string
  phone: string
  specialty: string
  subSpecialty: string
  studentCount: number
  percentage: string
  monthlySalary: string
  avatar: string
  schedule: {
    days: string
    time: string
    location: string
  }[]
}

interface TrainerApiDto {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  userActive: boolean
  trainerActive: boolean
  specialty: string | null
  baseSalary: number
  commissionPercentage: number
}
interface TrainerApiDto {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  gender: number | null
  specialty: string | null
  baseSalary: number
  commissionPercentage: number
}

const initialTrainers: Trainer[] = [
  {
    id: 1,
    firstName: 'امیر',
    lastName: 'رضایی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    specialty: 'bodybuilding',
    subSpecialty: 'پرورشی و تناسب اندام',
    studentCount: 18,
    percentage: '۶۰٪',
    monthlySalary: '۱۵,۴۰۰,۰۰۰ تومان',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    schedule: [
      { days: 'شنبه، چهارشنبه', time: '15:00 الی 18:00', location: 'سالن وزنه - اصلی' },
      { days: 'دوشنبه', time: '17:00 الی 20:00', location: 'سالن وزنه - اصلی' },
    ],
  },
  {
    id: 2,
    firstName: 'مریم',
    lastName: 'کاظمی',
    phone: '۰۹۱۹۸۷۶۵۴۳۲',
    specialty: 'yoga',
    subSpecialty: 'هاتایوگا و مدیتیشن',
    studentCount: 12,
    percentage: '۵۰٪',
    monthlySalary: '۹,۸۰۰,۰۰۰ تومان',
    avatar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300',
    schedule: [
      { days: 'یکشنبه، سه‌شنبه', time: '10:00 الی 12:00', location: 'سالن یوگا - طبقه ۲' },
    ],
  },
]

const filterOptions: OptionType[] = [
  { value: 'all', label: 'همه رشته‌های ورزشی' },
  { value: 'bodybuilding', label: 'بدنسازی و پرورشی' },
  { value: 'fitness', label: 'فیتنس و کراس‌فیت' },
  { value: 'yoga', label: 'یوگا و مدیتیشن' },
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
  { value: 'استخر و اسپا', label: 'استخر و اسپا' },
]

// تولید لیست ساعت‌ها از ۱ تا ۲۴
const hourOptions: OptionType[] = Array.from({ length: 24 }, (_, i) => {
  const hour = (i + 1).toString().padStart(2, '0')
  return { value: hour, label: hour }
})

// تولید لیست دقیقه‌ها از ۱ تا ۶۰
const minuteOptions: OptionType[] = Array.from({ length: 60 }, (_, i) => {
  const min = (i + 1).toString().padStart(2, '0')
  return { value: min, label: min }
})

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'دوشنبه']


const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300'

const toPersianNumber = (value: number) => {
  return new Intl.NumberFormat('fa-IR').format(value)
}

const mapTrainerFromApi = (trainer: TrainerApiDto): Trainer => {
  return {
    id: trainer.id,
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    phone: trainer.phoneNumber,

    specialty: trainer.specialty ?? 'نامشخص',

    // این موارد فعلاً در خروجی API وجود ندارند
    subSpecialty: trainer.specialty ?? 'ثبت نشده',
    studentCount: 0,
    avatar: DEFAULT_AVATAR,
    schedule: [],

    percentage: `${toPersianNumber(trainer.commissionPercentage)}٪`,
    monthlySalary: `${toPersianNumber(trainer.baseSalary)} تومان`,
  }
}


export default function AdminTrainersListPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true)
  const [apiError, setApiError] = useState('')


  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(filterOptions[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState<OptionType[]>([])
  const [isPending, startTransition] = useTransition()

  const [expandedTrainerId, setExpandedTrainerId] = useState<number | null>(null)
  const [deleteTrainerId, setDeleteTrainerId] = useState<number | null>(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(null)

  const [selectedDays, setSelectedDays] = useState<string[]>([])

  // استیت‌های ساعت و دقیقه شروع و پایان
  const [startHour, setStartHour] = useState<OptionType | null>(hourOptions[14]) // 15
  const [startMinute, setStartMinute] = useState<OptionType | null>(minuteOptions[59]) // 60
  const [endHour, setEndHour] = useState<OptionType | null>(hourOptions[17]) // 18
  const [endMinute, setEndMinute] = useState<OptionType | null>(minuteOptions[59]) // 60

  const [selectedLocation, setSelectedLocation] = useState<OptionType | null>(locationOptions[0])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    specialty: specialtyOptions[0],
    subSpecialty: '',
    studentCount: 0,
    percentage: '',
  })
  //واکشی اطلاعات

  const fetchTrainers = useCallback(async () => {
    try {
      setIsLoadingTrainers(true)
      setApiError('')

      const baseUrl = process.env.NEXT_PUBLIC_API_URL

      if (!baseUrl) {
        throw new Error(
          'آدرس API تنظیم نشده است. فایل .env.local را بررسی کن.'
        )
      }

      const response = await fetch(`${baseUrl}/api/trainers`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('دریافت لیست مربی‌ها ناموفق بود.')
      }

      const apiTrainers: TrainerApiDto[] = await response.json()

      setTrainers(apiTrainers.map(mapTrainerFromApi))
    } catch (error) {
      console.error(error)

      setApiError(
        error instanceof Error
          ? error.message
          : 'خطایی در دریافت اطلاعات رخ داد.'
      )
    } finally {
      setIsLoadingTrainers(false)
    }
  }, [])
  useEffect(() => {
    fetchTrainers()
  }, [fetchTrainers])

  //افزودن مربی
  const handleCreateTrainer = async (data: CreateTrainerDto) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trainers/Add`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => null)

      throw new Error(error?.message ?? 'ثبت مربی ناموفق بود.')
    }

    // اینجا در صورت نیاز لیست مربی‌ها را دوباره fetch کن.
  }
  // کنترل ورود شماره تلفن (فقط عدد و حداکثر ۱۱ رقم)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      setFormData({ ...formData, phone: value })
    }
  }

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
      const matches = trainers
        .filter((t) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(trimmed))
        .map((t) => ({
          value: `${t.firstName} ${t.lastName}`,
          label: `${t.firstName} ${t.lastName}`,
        }))
      setSearchOptions(matches)
    })
  }

  const toggleExpand = (id: number) => {
    setExpandedTrainerId((prev) => (prev === id ? null : id))
  }

  const handleOpenAddModal = () => {
    setEditingTrainerId(null)
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      specialty: specialtyOptions[0],
      subSpecialty: '',
      studentCount: 0,
      percentage: '',
    })
    setSelectedDays(['شنبه', 'چهارشنبه'])
    setStartHour(hourOptions[14])
    setStartMinute(minuteOptions[59])
    setEndHour(hourOptions[17])
    setEndMinute(minuteOptions[59])
    setSelectedLocation(locationOptions[0])
    setShowFormModal(true)
  }

  const handleOpenEditModal = (trainer: Trainer) => {
    setEditingTrainerId(trainer.id)

    const currentSpecialty = specialtyOptions.find((opt) => opt.value === trainer.specialty) || specialtyOptions[0]
    const cleanPercentage = trainer.percentage ? trainer.percentage.replace('٪', '') : ''
    const firstSchedule = trainer.schedule[0]

    setFormData({
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      phone: trainer.phone,
      specialty: currentSpecialty,
      subSpecialty: trainer.subSpecialty,
      studentCount: trainer.studentCount,
      percentage: cleanPercentage,
    })

    if (firstSchedule) {
      const daysArr = firstSchedule.days ? firstSchedule.days.split('، ') : []
      setSelectedDays(daysArr)

      if (firstSchedule.time) {
        const [startStr, endStr] = firstSchedule.time.split(' الی ')
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

      const matchedLoc = locationOptions.find((l) => l.value === firstSchedule.location) || locationOptions[0]
      setSelectedLocation(matchedLoc)
    }

    setShowFormModal(true)
  }

  const handleCancelForm = () => {
    setShowFormModal(false)
  }

  const confirmDelete = () => {
    if (deleteTrainerId !== null) {
      setTrainers((prev) => prev.filter((t) => t.id !== deleteTrainerId))
      setDeleteTrainerId(null)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedScheduleDays = selectedDays.length > 0 ? selectedDays.join('، ') : 'تعیین نشده'

    const startTimeString = startHour && startMinute ? `${startHour.value}:${startMinute.value}` : '00:00'
    const endTimeString = endHour && endMinute ? `${endHour.value}:${endMinute.value}` : '00:00'
    const formattedTimeString = `${startTimeString} الی ${endTimeString}`

    const formattedLocation = selectedLocation ? selectedLocation.value : 'سالن اصلی'

    if (editingTrainerId) {
      setTrainers((prev) =>
        prev.map((t) => {
          if (t.id === editingTrainerId) {
            return {
              ...t,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              specialty: formData.specialty ? formData.specialty.value : t.specialty,
              subSpecialty: formData.subSpecialty,
              studentCount: Number(formData.studentCount) || 0,
              percentage: formData.percentage ? `${formData.percentage}٪` : t.percentage,
              schedule: [
                {
                  days: formattedScheduleDays,
                  time: formattedTimeString,
                  location: formattedLocation,
                },
              ],
            }
          }
          return t
        })
      )
    } else {
      const newTrainer: Trainer = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        specialty: formData.specialty ? formData.specialty.value : 'bodybuilding',
        subSpecialty: formData.subSpecialty,
        studentCount: Number(formData.studentCount) || 0,
        percentage: formData.percentage ? `${formData.percentage}٪` : '۰٪',
        monthlySalary: '۰ تومان',
        avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
        schedule: [
          {
            days: formattedScheduleDays,
            time: formattedTimeString,
            location: formattedLocation,
          },
        ],
      }
      setTrainers([newTrainer, ...trainers])
    }

    setShowFormModal(false)
  }

  const filteredTrainers = trainers.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase()
    const matchesCategory =
      !selectedCategory || selectedCategory.value === 'all' || t.specialty === selectedCategory.value
    const matchesSearch = !searchQuery || fullName.includes(searchQuery.toLowerCase().trim())
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
          <h1 className="text-2xl font-bold text-[var(--primary)]">مدیریت مربیان باشگاه</h1>
          <p className="text-sm text-[var(--primary-mild)] mt-1">
            لیست کامل مربیان، اطلاعات قرارداد، برنامه‌های کلاسی و عملکرد مالی
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-mild)] text-white font-medium text-xs px-5 py-3 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <HiOutlinePlusCircle className="w-5 h-5 text-white" />
            <span>افزودن مربی جدید</span>
          </button>

          <div className="w-full sm:w-60">
            <Select<OptionType>
              isSearchable
              isLoading={isPending}
              placeholder="جستجوی نام مربی..."
              noOptionsMessage={() => (isPending ? 'در حال جستجو...' : 'مربی یافت نشد')}
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
     
      {isLoadingTrainers && (
        <div className="rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-8 text-center">
          <p className="text-sm text-[var(--primary-mild)]">
            در حال دریافت لیست مربیان...
          </p>
        </div>
      )}

      {apiError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {apiError}
        </div>
      )}
      {!isLoadingTrainers && !apiError && (
        <div className="space-y-4">
          {/* لیست کارت‌های مربیان */}
          <div className="space-y-4">
            {filteredTrainers.length > 0 ? (
              filteredTrainers.map((trainer) => {
                const isExpanded = expandedTrainerId === trainer.id
                const fullName = `${trainer.firstName} ${trainer.lastName}`

                return (
                  <div
                    key={trainer.id}
                    className="bg-white rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--primary-mild)]/40 shrink-0 shadow-inner bg-[var(--primary-subtle)]">
                          <Image
                            src={trainer.avatar}
                            alt={fullName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[var(--primary)]">{fullName}</h3>
                          <p className="text-xs text-[var(--primary-mild)] flex items-center gap-1 mt-1">
                            <HiOutlinePhone className="w-4 h-4 text-[var(--primary-mild)]" />
                            <span>{trainer.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[var(--primary-mild)]/20">
                        <button
                          type="button"
                          onClick={() => toggleExpand(trainer.id)}
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
                          onClick={() => handleOpenEditModal(trainer)}
                          className="p-2.5 text-[var(--primary-mild)] hover:text-[var(--primary)] bg-[var(--primary-subtle)] hover:bg-[var(--primary-subtle)]/80 border border-[var(--primary-mild)]/30 rounded-xl transition-all"
                          title="ویرایش"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTrainerId(trainer.id)}
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
                              <span className="text-[var(--primary-mild)] block text-[11px]">رشته / زیرمجموعه:</span>
                              <span className="font-semibold text-[var(--primary)]">
                                {trainer.subSpecialty || trainer.specialty}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                            <HiOutlineUsers className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                            <div>
                              <span className="text-[var(--primary-mild)] block text-[11px]">تعداد شاگردان:</span>
                              <span className="font-semibold text-[var(--primary)]">{trainer.studentCount} نفر</span>
                            </div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                            <HiOutlineCash className="w-6 h-6 text-[var(--primary-mild)] shrink-0" />
                            <div>
                              <span className="text-[var(--primary-mild)] block text-[11px]">درصد قرارداد:</span>
                              <span className="font-semibold text-[var(--primary)]">{trainer.percentage}</span>
                            </div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-[var(--primary-mild)]/30 flex items-center gap-3">
                            <HiOutlineCash className="w-6 h-6 text-[var(--primary-deep)] shrink-0" />
                            <div>
                              <span className="text-[var(--primary-mild)] block text-[11px]">حقوق/کارکرد ماه جاری:</span>
                              <span className="font-bold text-[var(--primary-deep)]">{trainer.monthlySalary}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-[var(--primary-mild)]/30 space-y-2">
                          <h4 className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                            <HiOutlineClock className="w-4 h-4 text-[var(--primary-mild)]" />
                            <span>ساعات و سانس‌های کلاسی مربی:</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            {trainer.schedule.map((sch, idx) => (
                              <div
                                key={idx}
                                className="bg-[var(--primary-subtle)]/60 p-2.5 rounded-lg border border-[var(--primary-mild)]/20 flex flex-col gap-1 text-[var(--primary)]"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold flex items-center gap-1">
                                    <HiOutlineCalendar className="w-3.5 h-3.5 text-[var(--primary-mild)]" />
                                    {sch.days}
                                  </span>
                                  <span className="text-[var(--primary-mild)] font-mono">{sch.time}</span>
                                </div>
                                <span className="text-[11px] text-[var(--primary-mild)] flex items-center gap-1">
                                  <HiOutlineOfficeBuilding className="w-3.5 h-3.5" />
                                  {sch.location}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-[var(--primary-mild)]/30 text-center space-y-3">
                <p className="text-[var(--primary)] font-bold">مربی با این مشخصات یافت نشد.</p>
                <p className="text-xs text-[var(--primary-mild)]">لطفاً عبارت جستجو یا دسته‌بندی ورزشی را تغییر دهید.</p>
              </div>
            )}
          </div>
        </div>
      )}



      {/* مودال افزودن / ویرایش مربی */}
      <TrainerFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleCreateTrainer}
      />

      {/* دیالوگ تأیید حذف */}
      {deleteTrainerId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[var(--primary-mild)]/30 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-[var(--primary-deep)] rounded-full flex items-center justify-center mx-auto">
              <HiOutlineExclamation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--primary)]">حذف مربی</h3>
              <p className="text-xs text-[var(--primary-mild)] mt-1">
                آیا از حذف این مربی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTrainerId(null)}
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
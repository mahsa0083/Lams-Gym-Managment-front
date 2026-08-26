'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import {
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineX
} from 'react-icons/hi'

export interface OptionType {
  value: string
  label: string
}

const specialtyOptions: OptionType[] = [
  { value: 'bodybuilding', label: 'بدنسازی و پرورشی' },
  { value: 'fitness', label: 'فیتنس و کراس‌فیت' },
  { value: 'yoga', label: 'یوگا و مدیتیشن' },
  { value: 'pilates', label: 'پیلاتس' },
]

const trainerOptions: OptionType[] = [
  { value: 'امیر رضایی', label: 'امیر رضایی (بدنسازی)' },
  { value: 'مریم کاظمی', label: 'مریم کاظمی (یوگا)' },
]

const locationOptions: OptionType[] = [
  { value: 'سالن وزنه - اصلی', label: 'سالن وزنه - اصلی (طبقه همکف)' },
  { value: 'سالن یوگا - طبقه ۲', label: 'سالن یوگا - طبقه ۲' },
  { value: 'سالن کراس‌فیت', label: 'سالن کراس‌فیت (سوله B)' },
  { value: 'سالن هوازی', label: 'سالن هوازی (طبقه ۱)' },
]

const statusOptions: OptionType[] = [
  { value: 'suspended', label: 'در حالت تعلیق (عدم نمایش در پنل اعضا)' },
  { value: 'published', label: 'انتشار و نمایش در پنل اعضا' },
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

// تابع کمکی برای ۳ رقم ۳ رقم جدا کردن اعداد
const formatNumberWithCommas = (val: string) => {
  const cleanNum = val.replace(/\D/g, '')
  if (!cleanNum) return ''
  return new Intl.NumberFormat('en-US').format(Number(cleanNum))
}

export default function CreateCoursePage() {
  const router = useRouter()

  // استیت دیالوگ موفقیت
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // کادر اول: اطلاعات عمومی دوره
  const [title, setTitle] = useState('')
  const [specialty, setSpecialty] = useState<OptionType | null>(specialtyOptions[0])
  const [trainer, setTrainer] = useState<OptionType | null>(trainerOptions[0])
  const [capacity, setCapacity] = useState<number | ''>('')
  const [selectedDays, setSelectedDays] = useState<string[]>(['شنبه', 'چهارشنبه'])
  const [startHour, setStartHour] = useState<OptionType | null>(hourOptions[14])
  const [startMinute, setStartMinute] = useState<OptionType | null>(minuteOptions[59])
  const [endHour, setEndHour] = useState<OptionType | null>(hourOptions[17])
  const [endMinute, setEndMinute] = useState<OptionType | null>(minuteOptions[59])

  // کادر دوم: اطلاعات تخصصی و شهریه دوره
  const [hasPrerequisite, setHasPrerequisite] = useState<boolean>(false)
  const [prerequisiteDetails, setPrerequisiteDetails] = useState('')
  const [fullCoursePrice, setFullCoursePrice] = useState('')
  const [isSingleSessionAllowed, setIsSingleSessionAllowed] = useState<boolean>(false)
  const [singleSessionPrice, setSingleSessionPrice] = useState('')

  // کادر سوم: آدرس، انتخاب سالن و وضعیت انتشار
  const [location, setLocation] = useState<OptionType | null>(locationOptions[0])
  const [addressDetails, setAddressDetails] = useState('')
  const [publicationStatus, setPublicationStatus] = useState<OptionType | null>(statusOptions[0])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const formatted = formatNumberWithCommas(e.target.value)
    setter(formatted)
  }

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // ریست کردن ورودی‌های فرم بعد از ثبت موفق
  const resetForm = () => {
    setTitle('')
    setSpecialty(specialtyOptions[0])
    setTrainer(trainerOptions[0])
    setCapacity('')
    setSelectedDays(['شنبه', 'چهارشنبه'])
    setStartHour(hourOptions[14])
    setStartMinute(minuteOptions[59])
    setEndHour(hourOptions[17])
    setEndMinute(minuteOptions[59])

    setHasPrerequisite(false)
    setPrerequisiteDetails('')
    setFullCoursePrice('')
    setIsSingleSessionAllowed(false)
    setSingleSessionPrice('')

    setLocation(locationOptions[0])
    setAddressDetails('')
    setPublicationStatus(statusOptions[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const startTime = startHour && startMinute ? `${startHour.value}:${startMinute.value}` : '00:00'
    const endTime = endHour && endMinute ? `${endHour.value}:${endMinute.value}` : '00:00'

    const newCourse = {
      id: Date.now(),
      title,
      specialty: specialty?.value,
      trainerName: trainer?.value,
      capacity: Number(capacity) || 0,
      schedule: {
        days: selectedDays.join('، '),
        time: `${startTime} الی ${endTime}`,
      },
      hasPrerequisite,
      prerequisiteDetails: hasPrerequisite ? prerequisiteDetails : null,
      fullCoursePrice,
      isSingleSessionAllowed,
      singleSessionPrice: isSingleSessionAllowed ? singleSessionPrice : null,
      location: location?.value,
      addressDetails,
      status: publicationStatus?.value,
      showInMemberPanel: publicationStatus?.value === 'published',
    }

    // ذخیره در localStorage برای انتقال به لیست دوره‌ها
    const existingCourses = JSON.parse(localStorage.getItem('app_courses') || '[]')
    localStorage.setItem('app_courses', JSON.stringify([newCourse, ...existingCourses]))

    // نمایش دیالوگ به‌جای هدایت صفحه
    setShowSuccessDialog(true)
  }

  const handleCloseDialog = () => {
    setShowSuccessDialog(false)
    resetForm()
  }

  return (
    <div className="p-6 bg-[var(--primary-subtle)] min-h-screen text-[var(--primary)] dir-rtl text-xs">
      <style jsx global>{`
        .custom-radio {
          accent-color: #0f172a;
        }
      `}</style>

      {/* هدر */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.replace('/admin')}
            className="p-2.5 rounded-xl border border-[var(--primary-mild)]/30 text-[var(--primary-mild)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-colors"
          >
            <HiOutlineArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--primary)]">افزودن دوره جدید</h1>
            <p className="text-xs text-[var(--primary-mild)] mt-0.5">
              تنظیم اطلاعات عمومی، تخصصی، شهریه و مکان برگزاری
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* ================= کادر اول: اطلاعات عمومی دوره ================= */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--primary-mild)]/20 text-sm font-bold text-[var(--primary)]">
            <HiOutlineAcademicCap className="w-5 h-5 text-[var(--primary-mild)]" />
            <span>اطلاعات عمومی دوره</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--primary)] mb-1">نام و عنوان دوره *</label>
              <input
                type="text"
                required
                placeholder="مثلاً: دوره جامع بدنسازی ترم بهار"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--primary)] mb-1">نام رشته ورزشی *</label>
              <Select<OptionType>
                options={specialtyOptions}
                value={specialty}
                onChange={(opt) => setSpecialty(opt)}
                placeholder="انتخاب رشته..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--primary)] mb-1">نام مربی *</label>
              <Select<OptionType>
                options={trainerOptions}
                value={trainer}
                onChange={(opt) => setTrainer(opt)}
                placeholder="انتخاب مربی..."
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--primary)] mb-1">تعداد ظرفیت ثبت‌نام (نفر) *</label>
              <input
                type="number"
                required
                min={1}
                placeholder="مثلاً: ۱۵"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
              />
            </div>
          </div>

          {/* روزها و ساعت کلاسی */}
          <div className="p-4 bg-[var(--primary-subtle)]/60 rounded-xl border border-[var(--primary-mild)]/30 space-y-3 mt-2">
            <span className="block font-bold text-[var(--primary)] flex items-center gap-1.5">
              <HiOutlineClock className="w-4 h-4 text-[var(--primary-mild)]" />
              برنامه زمانی و ساعت کلاسی:
            </span>

            <div>
              <label className="block text-[11px] text-[var(--primary-mild)] mb-1.5 font-medium">
                روزهای برگزاری:
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
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                          : 'bg-white text-[var(--primary-mild)] border-[var(--primary-mild)]/30 hover:border-[var(--primary)]'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] text-[var(--primary-mild)] font-medium">ساعت شروع</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select<OptionType> options={hourOptions} value={startHour} onChange={(opt) => setStartHour(opt)} />
                  <Select<OptionType> options={minuteOptions} value={startMinute} onChange={(opt) => setStartMinute(opt)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-[var(--primary-mild)] font-medium">ساعت پایان</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select<OptionType> options={hourOptions} value={endHour} onChange={(opt) => setEndHour(opt)} />
                  <Select<OptionType> options={minuteOptions} value={endMinute} onChange={(opt) => setEndMinute(opt)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= کادر دوم: اطلاعات تخصصی و شهریه دوره ================= */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--primary-mild)]/20 text-sm font-bold text-[var(--primary)]">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-[var(--primary-mild)]" />
            <span>اطلاعات تخصصی و شهریه دوره</span>
          </div>

          <div className="p-4 bg-[var(--primary-subtle)]/40 rounded-xl border border-[var(--primary-mild)]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--primary)]">نیازمند پیش‌نیاز:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="prerequisite"
                    checked={hasPrerequisite === true}
                    onChange={() => setHasPrerequisite(true)}
                    className="custom-radio w-4 h-4 cursor-pointer"
                  />
                  <span>بله</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="prerequisite"
                    checked={hasPrerequisite === false}
                    onChange={() => setHasPrerequisite(false)}
                    className="custom-radio w-4 h-4 cursor-pointer"
                  />
                  <span>خیر</span>
                </label>
              </div>
            </div>

            {hasPrerequisite && (
              <input
                type="text"
                placeholder="توضیحات پیش‌نیاز را وارد کنید..."
                value={prerequisiteDetails}
                onChange={(e) => setPrerequisiteDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-white mt-2"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-[var(--primary)] mb-1">شهریه کل دوره (تومان) *</label>
            <input
              type="text"
              required
              placeholder="مثلاً: ۱,۵۰۰,۰۰۰"
              value={fullCoursePrice}
              onChange={(e) => handlePriceChange(e, setFullCoursePrice)}
              className="w-full px-3.5 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30 text-left dir-ltr font-mono text-sm"
            />
          </div>

          <div className="p-4 bg-[var(--primary-subtle)]/40 rounded-xl border border-[var(--primary-mild)]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--primary)]">امکان ثبت‌نام تک‌جلسه‌ای:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="singleSession"
                    checked={isSingleSessionAllowed === true}
                    onChange={() => setIsSingleSessionAllowed(true)}
                    className="custom-radio w-4 h-4 cursor-pointer"
                  />
                  <span>بله</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="singleSession"
                    checked={isSingleSessionAllowed === false}
                    onChange={() => setIsSingleSessionAllowed(false)}
                    className="custom-radio w-4 h-4 cursor-pointer"
                  />
                  <span>خیر</span>
                </label>
              </div>
            </div>

            {isSingleSessionAllowed && (
              <div>
                <label className="block text-[11px] font-semibold text-[var(--primary-mild)] mb-1">شهریه هر تک‌جلسه (تومان)</label>
                <input
                  type="text"
                  placeholder="مثلاً: ۱۵۰,۰۰۰"
                  value={singleSessionPrice}
                  onChange={(e) => handlePriceChange(e, setSingleSessionPrice)}
                  className="w-full px-3.5 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-white text-left dir-ltr font-mono text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* ================= کادر سوم: آدرس، انتخاب سالن و وضعیت انتشار ================= */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--primary-mild)]/20 text-sm font-bold text-[var(--primary)]">
            <HiOutlineOfficeBuilding className="w-5 h-5 text-[var(--primary-mild)]" />
            <span>جزئیات آدرس و وضعیت انتشار</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--primary)] mb-1">انتخاب سالن *</label>
              <Select<OptionType>
                options={locationOptions}
                value={location}
                onChange={(opt) => setLocation(opt)}
                placeholder="انتخاب سالن..."
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--primary)] mb-1">جزئیات آدرس / توضیحات ورودی</label>
              <input
                type="text"
                placeholder="مثلاً: طبقه همکف، رختکن A"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[var(--primary-mild)]/40 rounded-xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] bg-[var(--primary-subtle)]/30"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block font-semibold text-[var(--primary)] mb-1">وضعیت انتشار *</label>
            <Select<OptionType>
              options={statusOptions}
              value={publicationStatus}
              onChange={(opt) => setPublicationStatus(opt)}
              placeholder="انتخاب وضعیت..."
            />

            {publicationStatus?.value === 'suspended' ? (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-[11px]">
                <HiOutlineExclamationCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>
                  <strong>حالت تعلیق:</strong> دوره در لیست مدیریت ذخیره می‌شود و نشان آیکون سبز «در تعلیق» می‌گیرد، اما در پنل اعضا نمایش داده نخواهد شد.
                </span>
              </div>
            ) : (
              <div className="mt-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2 text-[11px]">
                <HiOutlineCheckCircle className="w-5 h-5 shrink-0 text-blue-600" />
                <span>
                  <strong>حالت انتشار:</strong> دوره در پنل اعضا و لیست مدیریت نمایش داده خواهد شد.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-[var(--primary-mild)]/40 text-[var(--primary-mild)] font-semibold hover:bg-white transition-colors"
          >
            انصراف
          </button>

          <button
            type="submit"
            className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span>ثبت نهایی دوره</span>
          </button>
        </div>
      </form>

      {/* ================= دیالوگ / مودال موفقیت ================= */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[var(--primary-mild)]/30 shadow-2xl text-center space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="text-[var(--primary-mild)] hover:text-[var(--primary)] transition-colors p-1"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
              <HiOutlineCheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--primary)]">ثبت موفقیت‌آمیز</h3>
              <p className="text-xs text-[var(--primary-mild)] mt-1.5 leading-relaxed">
                دوره جدید با موفقیت ثبت شد و به لیست دوره‌ها اضافه گردید.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="w-full py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm text-xs"
              >
                تأیید و متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
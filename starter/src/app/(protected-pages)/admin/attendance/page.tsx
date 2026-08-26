'use client'

import React, { useState, useMemo } from 'react'
import {
  HiOutlineCheck,
  HiOutlineUsers,
  HiOutlineShieldCheck
} from 'react-icons/hi'
import DatePicker from '@/components/ui/DatePicker'
import moment from 'jalali-moment'

export interface AttendanceHistoryDto {
  attendanceDate: string
  isPresent: boolean
}

export interface MemberAttendanceRow {
  memberId: number
  fullName: string
  attendanceMap: Record<string, boolean>
}

// مقدار اولیه اشخاص با attendanceMap خالی (بدون تیک پیش‌فرض / همه غایب)
const initialMembersAttendance: MemberAttendanceRow[] = [
  {
    memberId: 1,
    fullName: 'علی محمدی',
    attendanceMap: {},
  },
  {
    memberId: 2,
    fullName: 'سارا احمدی',
    attendanceMap: {},
  },
  {
    memberId: 3,
    fullName: 'رضا کریمی',
    attendanceMap: {},
  },
]

export default function AdminAttendanceMatrixPage() {
  const [rows, setRows] = useState<MemberAttendanceRow[]>(initialMembersAttendance)
  // مقدار پیش‌فرض تاریخ روی امروز تنظیم شده است
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  // تولید داینامیک روزهای هفته از شنبه تا پنج‌شنبه بر اساس هفته‌ی تاریخ انتخابی
  const attendanceColumns = useMemo(() => {
    const baseMoment = selectedDate ? moment(selectedDate).locale('fa') : moment().locale('fa')
    
    // در تقویم شمسی moment، روزهای هفته از شنبه (0 یا بررسی بر اساس نام روز) شروع می‌شوند
    // برای اطمینان از پیدا کردن شنبه‌ی همان هفته:
    const dayName = baseMoment.format('dddd')
    const daysOrder = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']
    
    // پیدا کردن فاصله ایندکس روز جاری تا شنبه
    let dayIndex = daysOrder.indexOf(dayName)
    if (dayIndex === -1 || dayIndex === 6) {
      // اگر جمعه بود یا نامشکل، هفته را از شنبه جاری یا قبل حساب می‌کنیم
      dayIndex = dayIndex === 6 ? 6 : 0
    }

    // عقب رفتن تا روز شنبه‌ی همان هفته
    const saturdayMoment = baseMoment.clone().subtract(dayIndex, 'days')

    const columns = []
    // ساخت ۶ روز استاتیک از شنبه تا پنج‌شنبه
    for (let i = 0; i < 6; i++) {
      const currentDay = saturdayMoment.clone().add(i, 'days')
      columns.push({
        day: daysOrder[i], // به ترتیب: شنبه، یکشنبه، دوشنبه، سه‌شنبه، چهارشنبه، پنج‌شنبه
        date: currentDay.format('YYYY/MM/DD'), // تاریخ شمسی متناظر
      })
    }
    return columns
  }, [selectedDate])

  // تغییر وضعیت حضور/غیاب یک شخص در یک تاریخ خاص
  const handleToggleAttendance = (memberId: number, dateKey: string) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.memberId === memberId) {
          const currentStatus = row.attendanceMap[dateKey] ?? false
          return {
            ...row,
            attendanceMap: {
              ...row.attendanceMap,
              [dateKey]: !currentStatus,
            },
          }
        }
        return row
      })
    )
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfirmDialogOpen(true)
  }

  // ثبت و ارسال اطلاعات به سرور پس از تایید در دیالوگ
  const handleConfirmSave = () => {
    setIsConfirmDialogOpen(false)
    setIsSubmitting(true)

    const payload = rows.map(row => ({
      memberId: row.memberId,
      fullName: row.fullName,
      attendances: Object.entries(row.attendanceMap).map(([date, isPresent]) => ({
        attendanceDate: date,
        isPresent: isPresent,
      })) as AttendanceHistoryDto[],
    }))

    console.log('Admin Attendance Matrix Payload:', payload)

    setTimeout(() => {
      setIsSubmitting(false)
    }, 600)
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen text-slate-800 dir-rtl font-sans max-w-7xl mx-auto">
      {/* هدر صفحه به همراه دیت‌پیکر پرشین */}
      <div className="bg-white p-6 rounded-2xl border border-[#A8DADC]/40 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <h1 className="text-xl font-bold text-[#1D3557] flex items-center gap-2 font-sans">
            <HiOutlineUsers className="w-6 h-6 text-[#457B9D]" />
            <span>مدیریت حضور و غیاب هفتگی (پنل ادمین)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            با انتخاب تاریخ، جدول به‌صورت خودکار هفته‌ی مربوطه (از شنبه تا پنج‌شنبه) را نمایش می‌دهد.
          </p>
        </div>
        
        {/* دیت‌پیکر پرشین با مقدار پیش‌فرض روز جاری */}
        <div className="flex items-center gap-3 font-sans w-full md:w-auto">
          <div className="w-full md:w-56 font-sans">
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              inputFormat="YYYY/MM/DD"
              className="font-sans"
            />
          </div>
        </div>
      </div>

      {/* فرم جدول ماتریسی */}
      <form onSubmit={handleSaveClick} className="space-y-4 font-sans">
        <div className="bg-white rounded-2xl border border-[#A8DADC]/40 shadow-xl overflow-hidden font-sans">
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-right border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-[#1D3557] text-white font-sans">
                  <th className="p-4 font-bold min-w-[180px] sticky right-0 bg-[#1D3557] z-10 border-l border-white/10 font-sans">
                    نام ورزشکار
                  </th>
                  {attendanceColumns.map((col, index) => (
                    <th key={index} className="p-3 text-center min-w-[110px] border-l border-white/10 font-sans">
                      <div className="font-bold font-sans">{col.day}</div>
                      <div className="text-[10px] text-[#A8DADC] mt-0.5 font-mono font-semibold font-sans">{col.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {rows.map((row, rowIndex) => (
                  <tr key={row.memberId} className={`${rowIndex % 2 === 0 ? 'bg-white hover:bg-[#F1FAEE]/40' : 'bg-slate-50/50 hover:bg-[#F1FAEE]/40'} font-sans`}>
                    {/* ستون ثابت نام شخص */}
                    <td className="p-4 font-bold text-[#1D3557] sticky right-0 bg-inherit z-10 border-l border-slate-100 shadow-xs font-sans">
                      {row.fullName}
                    </td>

                    {/* ستون‌های داینامیک تاریخ و روزهای هفته (شنبه تا پنج‌شنبه) */}
                    {attendanceColumns.map((col, colIndex) => {
                      const isPresent = row.attendanceMap[col.date] ?? false
                      return (
                        <td key={colIndex} className="p-3 text-center border-l border-slate-100 font-sans">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(row.memberId, col.date)}
                            className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs font-sans ${
                              isPresent
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                : 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isPresent ? 'حاضر (کلیک برای تغییر)' : 'غایب (کلیک برای تغییر)'}
                          >
                            {isPresent ? (
                              <HiOutlineCheck className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <span className="text-[10px] font-bold font-sans">غایب</span>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* دکمه ذخیره نهایی قرمز رنگ */}
        <div className="flex justify-end pt-2 font-sans">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 font-sans"
          >
            <HiOutlineShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'در حال ثبت...' : 'ذخیره نهایی حضور و غیاب'}</span>
          </button>
        </div>
      </form>

      {/* دیالوگ تأیید سفارشی */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4 font-sans">
            <h3 className="font-bold text-sm text-[#1D3557] font-sans">تأیید ذخیره‌سازی اطلاعات</h3>
            <p className="text-xs text-slate-600 font-sans">
              آیا از ثبت و ذخیره نهایی اطلاعات حضور و غیاب ورزشکاران اطمینان دارید؟
            </p>
            <div className="flex justify-end gap-2 pt-2 font-sans">
              <button
                type="button"
                onClick={() => setIsConfirmDialogOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all font-sans cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs font-sans cursor-pointer"
              >
                تأیید و ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
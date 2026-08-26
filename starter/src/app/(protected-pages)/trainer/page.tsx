'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineChevronLeft,
  HiOutlineBookmark,
  HiOutlineCheckCircle
} from 'react-icons/hi'

interface CoachClassItem {
  id: number
  title: string
  sportField: string
  time: string
  studentCount: number
}

const initialClasses: CoachClassItem[] = [
  {
    id: 1,
    title: 'کلاس بدنسازی و پرورش اندام (گروه الف)',
    sportField: 'بدنسازی',
    time: '۱۵:۰۰ الی ۱۶:۳۰',
    studentCount: 12,
  },
  {
    id: 2,
    title: 'تمرین تخصصی فیتنس و هوازی',
    sportField: 'فیتنس',
    time: '۱۷:۰۰ الی ۱۸:۰۰',
    studentCount: 8,
  },
  {
    id: 3,
    title: 'سانس یوگا و مدیتیشن پیشرفته',
    sportField: 'یوگا',
    time: '۱۸:۳۰ الی ۲۰:۰۰',
    studentCount: 10,
  },
]

export default function CoachDashboardPage({ coachName = 'مربی عزیز' }: { coachName?: string }) {
  const [classes] = useState<CoachClassItem[]>(initialClasses)

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen text-[#161E54] font-semibold space-y-6 dir-rtl">
      
      {/* بخش خوش‌آمدگویی تمام‌عرض */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div>
          <h2 className="text-xl font-bold text-[#161E54]">صبح بخیر، {coachName}</h2>
          <p className="text-xs text-slate-500 mt-1">به پنل مدیریت تمرینات و باشگاه خوش آمدید.</p>
        </div>
        <div className="px-5 py-2.5 rounded-xl bg-[#161E54] text-white text-xs font-semibold shadow-sm">
          پنل مربی
        </div>
      </div>

      {/* بخش اول: کارت‌های آماری (۳ کارت اصلی) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        {/* کارت اول: تعداد کل شاگردان */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#161E54]">تعداد کل شاگردان</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#161E54]">
              <HiOutlineUsers className="w-5 h-5 text-[#F16D34]" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-3xl font-extrabold text-[#161E54]">۳۰</span>
            <span className="text-xs text-slate-500 mr-2">نفر شاگرد فعال</span>
          </div>
          <div className="text-[11px] text-[#F16D34] font-semibold flex items-center gap-1">
            <HiOutlineTrendingUp className="w-4 h-4 text-[#F16D34]" />
            <span>۴ نفر بیشتر از ماه قبل</span>
          </div>
        </div>

        {/* کارت دوم: روند رشد شاگردان */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#161E54]">روند رشد شاگردان</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#161E54]">
              <HiOutlineChartBar className="w-5 h-5 text-[#FF986A]" />
            </div>
          </div>
          <div className="my-4 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#161E54]">شاخص عملکرد</span>
              <p className="text-xs text-slate-500 mt-0.5">درصد جذب و تمدید دوره‌ها</p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-[#F16D34] flex items-center justify-center text-xs font-bold text-[#161E54] bg-blue-50/50">
              ۸۵٪
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            وضعیت جذب شاگردان در روند صعودی قرار دارد.
          </div>
        </div>

        {/* کارت سوم: اطلاعات امروز */}
        <div className="bg-[#161E54] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#BBE0EF]">امروز</h3>
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <HiOutlineCalendar className="w-5 h-5 text-[#FF986A]" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-xl font-bold">سه‌شنبه، ۲۸ مرداد</span>
            <p className="text-xs text-[#BBE0EF] mt-1">تعداد کلاس‌های امروز: ۳ سانس</p>
          </div>
          <div className="text-[11px] text-[#BBE0EF]">
            آماده مدیریت کلاس‌ها و برنامه‌ها
          </div>
        </div>

      </div>

      {/* بخش دوم: نمودار هفتگی بزرگ و جلسات پیش رو */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* نمودار جلسات هفتگی تمام‌عرض در بخش خود */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#161E54]">جلسات هفتگی</h3>
            <span className="text-xs text-slate-400">آمار فعالیت‌های هفتگی</span>
          </div>
          
          <div className="h-56 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100">
            {[40, 70, 50, 85, 45, 60, 75, 55, 90, 65, 80].map((h, idx) => (
              <div key={idx} className="w-full flex items-end justify-center gap-1.5 h-full">
                <div className="w-3.5 rounded-t-md bg-[#161E54]" style={{ height: `${h}%` }}></div>
                <div className="w-3.5 rounded-t-md bg-[#F16D34]" style={{ height: `${h * 0.75}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-3">
            <span>شنبه</span>
            <span>یکشنبه</span>
            <span>دوشنبه</span>
            <span>سه‌شنبه</span>
            <span>چهارشنبه</span>
            <span>پنجشنبه</span>
            <span>جمعه</span>
          </div>
        </div>

        {/* جلسات پیش رو */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#161E54]">جلسات پیش رو</h3>
            <span className="text-xs text-[#F16D34] font-semibold cursor-pointer">مشاهده همه</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161E54] text-white flex items-center justify-center font-bold text-xs">ع</div>
                <div>
                  <h4 className="text-xs font-bold text-[#161E54]">علی رضایی</h4>
                  <p className="text-[10px] text-slate-400">۱۰:۰۰ - ۱۵:۳۰</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">فعال</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161E54] text-white flex items-center justify-center font-bold text-xs">ر</div>
                <div>
                  <h4 className="text-xs font-bold text-[#161E54]">رضا کریمی</h4>
                  <p className="text-[10px] text-slate-400">۱۱:۰۰ - ۱۶:۰۰</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold">رزرو</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161E54] text-white flex items-center justify-center font-bold text-xs">م</div>
                <div>
                  <h4 className="text-xs font-bold text-[#161E54]">محمد مهدی‌زاده</h4>
                  <p className="text-[10px] text-slate-400">۱۶:۰۰ - ۱۷:۳۰</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-orange-50 text-[#F16D34] font-semibold">تایید شده</span>
            </div>
          </div>
        </div>

      </div>

      {/* بخش سوم: لیست کلاس‌های امروز (تمام‌عرض) */}
      <div className="space-y-4 w-full">
        <h2 className="text-lg font-bold text-[#161E54] flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-[#F16D34]" />
          <span>لیست کلاس‌های امروز</span>
        </h2>

        <div className="grid grid-cols-1 gap-3 w-full">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-[#161E54]">{cls.title}</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-[#161E54] border border-blue-100">
                    {cls.sportField}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <HiOutlineClock className="w-4 h-4 text-[#F16D34]" />
                    <span>ساعت: {cls.time}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HiOutlineUsers className="w-4 h-4 text-[#F16D34]" />
                    <span>تعداد شاگردها: {cls.studentCount} نفر</span>
                  </span>
                </p>
              </div>

              <Link
                href={`/dashboard/coach/classes/${cls.id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#161E54] text-white hover:bg-[#161E54]/90 transition-colors shadow-sm w-full sm:w-auto"
              >
                <HiOutlineBookmark className="w-4 h-4 text-[#FF986A]" />
                <span>نمایش جزئیات</span>
                <HiOutlineChevronLeft className="w-3.5 h-3.5 text-blue-200 mr-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* بخش چهارم: اعضای اخیر */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 w-full">
        <h3 className="text-sm font-bold text-[#161E54] flex items-center gap-2">
          <HiOutlineCheckCircle className="w-5 h-5 text-[#F16D34]" />
          <span>اعضای اخیر</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none">
            <div className="flex items-center gap-3 w-1/3 sm:w-1/4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#161E54]">ج</div>
              <span className="text-xs font-bold text-[#161E54]">جلیل استاوی</span>
            </div>
            <div className="w-2/3 sm:w-3/4 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#161E54] h-full w-3/4"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none">
            <div className="flex items-center gap-3 w-1/3 sm:w-1/4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#161E54]">م</div>
              <span className="text-xs font-bold text-[#161E54]">محسن موقر</span>
            </div>
            <div className="w-2/3 sm:w-3/4 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#F16D34] h-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineChevronLeft,
  HiOutlineBookmark,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
} from 'react-icons/hi';

// Import Centralized API Service
import ApiService from '@/services/client/ApiService';

// ----------------------------------------------------------------------
// Interfaces & DTOs
// ----------------------------------------------------------------------
interface TrainerProfile {
  id: number;
  firstName: string;
  lastName: string;
}

interface ScheduleDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface CourseDto {
  id: number;
  title: string;
  sportName?: string;
  sportCategory?: string;
  capacity?: number;
  schedules?: ScheduleDto[];
}

interface RecentSubscriptionDto {
  id: number;
  memberName: string;
  classTitle: string;
  startDate?: string;
}

interface CoachClassItem {
  id: number;
  title: string;
  sportField: string;
  time: string;
  studentCount: number;
}

// ----------------------------------------------------------------------
// لیست جملات انگیزشی مخصوص مربیان
// ----------------------------------------------------------------------
const MOTIVATIONAL_QUOTES = [
  'امروز روز فوق‌العاده‌ای برای تغییر زندگی شاگردانت است! 💪',
  'انرژی مثبت تو، انگیزه امروز شاگردان توست. 🔥',
  'هر تمرین کوچک، یک قدم بزرگ به سمت هدف است. 🏆',
  'با انگیزه و پرقدرت ادامه بده، تو بهترین مربی هستی! ⭐',
  'امروز هم قرار است با هم رکوردهای جدیدی بسازیم. 🏋️‍♂️',
  'موفقیت شاگردانت، حاصل تلاش و دلسوزی توست. ❤️',
];

// تابع محاسبه متن سلام بر اساس ساعت روز
const getGreetingMessage = (): string => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'صبح بخیر';
  if (currentHour >= 12 && currentHour < 16) return 'ظهر بخیر';
  if (currentHour >= 16 && currentHour < 20) return 'عصر بخیر';
  return 'شب بخیر';
};

// تابع تبدیل تاریخ امروز به شمسی
const getPersianTodayDate = (): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
  } catch {
    return 'امروز';
  }
};

export default function CoachDashboardPage({ trainerId = 1 }: { trainerId?: number }) {
  const [trainerName, setTrainerName] = useState<string>('مربی عزیز');
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [todayClasses, setTodayClasses] = useState<CoachClassItem[]>([]);
  const [recentMembers, setRecentMembers] = useState<RecentSubscriptionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // استیت‌های پیام سلام و جمله انگیزشی
  const [greeting, setGreeting] = useState<string>('روز بخیر');
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    // ۱. تنظیم متن سلام و جمله انگیزشی تصادفی
    setGreeting(getGreetingMessage());
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);

    // ۲. دریافت اطلاعات از APIها
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // دریافت پروفایل مربی
        const trainer = await ApiService.get<TrainerProfile>(`/trainers/${trainerId}`);
        if (trainer && trainer.firstName) {
          setTrainerName(`${trainer.firstName} ${trainer.lastName}`);
        }

        // دریافت دوره‌های مربی
        const courses = await ApiService.get<CourseDto[]>(`/trainers/${trainerId}/courses`);
        if (courses && Array.isArray(courses)) {
          const mappedClasses: CoachClassItem[] = courses.map((c) => ({
            id: c.id,
            title: c.title,
            sportField: c.sportName || c.sportCategory || 'عمومی',
            time: c.schedules && c.schedules.length > 0 
              ? `${c.schedules[0].startTime} الی ${c.schedules[0].endTime}`
              : 'ساعت تعیین‌نشده',
            studentCount: c.capacity || 0,
          }));
          setTodayClasses(mappedClasses);
        }

        // دریافت کل شاگردان
        const members = await ApiService.get<any[]>('/members');
        if (members && Array.isArray(members)) {
          setTotalStudentsCount(members.length);
        }

        // دریافت ثبت‌نام‌های اخیر
        const recent = await ApiService.get<RecentSubscriptionDto[]>('/admins/recent-subscriptions');
        if (recent && Array.isArray(recent)) {
          setRecentMembers(recent.slice(0, 5));
        }

      } catch (error) {
        console.error('خطا در دریافت اطلاعات داشبورد:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [trainerId]);

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen text-[#161E54] font-semibold space-y-6 dir-rtl">
      
      {/* بخش خوش‌آمدگویی پویا و انگیزشی */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div>
          <h2 className="text-xl font-bold text-[#161E54]">
            {greeting}، {trainerName}
          </h2>
          <p className="text-xs text-slate-500 mt-1 transition-all duration-300">
            {quote || 'به پنل مدیریت تمرینات و باشگاه خوش آمدید.'}
          </p>
        </div>
        <div className="px-5 py-2.5 rounded-xl bg-[#161E54] text-white text-xs font-semibold shadow-sm shrink-0">
          پنل مربی
        </div>
      </div>

      {/* بخش اول: کارت‌های آماری */}
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
            <span className="text-3xl font-extrabold text-[#161E54]">{totalStudentsCount}</span>
            <span className="text-xs text-slate-500 mr-2">نفر شاگرد فعال</span>
          </div>
          <div className="text-[11px] text-[#F16D34] font-semibold flex items-center gap-1">
            <HiOutlineTrendingUp className="w-4 h-4 text-[#F16D34]" />
            <span>بر اساس آخرین ثبت‌نام‌های سیستم</span>
          </div>
        </div>

        {/* کارت دوم: روند رشد شاگردان (بلور شده) */}
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
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

          <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-[#161E54] text-white flex items-center justify-center shadow-md">
              <HiOutlineLockClosed className="w-4 h-4 text-[#FF986A]" />
            </div>
            <span className="text-xs font-bold text-[#161E54]">به‌زودی</span>
            <span className="text-[10px] text-slate-500">این بخش نیازمند سرویس تحلیل داده است</span>
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
            <span className="text-xl font-bold">{getPersianTodayDate()}</span>
            <p className="text-xs text-[#BBE0EF] mt-1">تعداد کلاس‌های ثبت‌شده: {todayClasses.length} سانس</p>
          </div>
          <div className="text-[11px] text-[#BBE0EF]">
            آماده مدیریت کلاس‌ها و برنامه‌ها
          </div>
        </div>

      </div>

      {/* بخش دوم: نمودار هفتگی (بلور) و ثبت‌نام‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* نمودار هفتگی */}
        <div className="relative overflow-hidden lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#161E54]">جلسات هفتگی</h3>
            <span className="text-xs text-slate-400">آمار فعالیت‌های هفتگی</span>
          </div>
          
          <div className="h-56 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 opacity-30">
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

          <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#161E54] text-white flex items-center justify-center shadow-lg">
              <HiOutlineLockClosed className="w-5 h-5 text-[#FF986A]" />
            </div>
            <span className="text-sm font-bold text-[#161E54]">به‌زودی</span>
            <span className="text-xs text-slate-500 max-w-xs">نمودار تحلیلی فعالیت‌های هفتگی پس از فعال‌سازی API گزارشات نمایش داده خواهد شد.</span>
          </div>
        </div>

        {/* ثبت‌نام‌های اخیر */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#161E54]">ثبت‌نام‌های اخیر</h3>
            <span className="text-xs text-[#F16D34] font-semibold">تایید شده</span>
          </div>

          <div className="space-y-3">
            {recentMembers.length > 0 ? (
              recentMembers.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#161E54] text-white flex items-center justify-center font-bold text-xs">
                      {item.memberName?.charAt(0) || 'ش'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#161E54]">{item.memberName}</h4>
                      <p className="text-[10px] text-slate-400">{item.classTitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">فعال</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">ثبت‌نام جدیدی یافت نشد.</div>
            )}
          </div>
        </div>

      </div>

      {/* بخش سوم: لیست کلاس‌ها */}
      <div className="space-y-4 w-full">
        <h2 className="text-lg font-bold text-[#161E54] flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-[#F16D34]" />
          <span>لیست کلاس‌های مربی</span>
        </h2>

        <div className="grid grid-cols-1 gap-3 w-full">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">در حال دریافت کلاس‌ها...</div>
          ) : todayClasses.length > 0 ? (
            todayClasses.map((cls) => (
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
                      <span>ظرفیت: {cls.studentCount} نفر</span>
                    </span>
                  </p>
                </div>

                <Link
                  href={`/dashboard/coach/classes`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#161E54] text-white hover:bg-[#161E54]/90 transition-colors shadow-sm w-full sm:w-auto"
                >
                  <HiOutlineBookmark className="w-4 h-4 text-[#FF986A]" />
                  <span>نمایش جزئیات</span>
                  <HiOutlineChevronLeft className="w-3.5 h-3.5 text-blue-200 mr-1" />
                </Link>
              </div>
            ))
          ) : (
            <div className="p-8 bg-white rounded-2xl text-center text-xs text-slate-400">کلاسی برای این مربی یافت نشد.</div>
          )}
        </div>
      </div>

    </div>
  );
}
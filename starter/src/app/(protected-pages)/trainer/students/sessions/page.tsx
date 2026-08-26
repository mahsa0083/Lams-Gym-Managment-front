'use client';

import React, { useState } from 'react';
import {
  HiOutlineSearch as Search,
  HiOutlineUser as UserIcon,
  HiOutlinePhone as Phone,
  HiOutlineIdentification as Identification,
  HiOutlineCalendar as Calendar,
  HiOutlineEye as Eye,
  HiOutlineX as X,
  HiOutlineAcademicCap as AcademicCap,
  HiOutlineClock as Clock,
  HiOutlineBookmark as Bookmark,
} from 'react-icons/hi';
import { FaDumbbell as Dumbbell } from 'react-icons/fa';

// ----------------------------------------------------------------------
// Types & DTO Interfaces (تطبیق کامل با ActiveMemberDto و MemberCourseHistoryItemDto)
// ----------------------------------------------------------------------
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export interface CourseScheduleDto {
  dayOfWeek: string;
  time: string;
}

export interface AttendanceHistoryDto {
  date: string;
  isPresent: boolean;
}

export interface MemberCourseHistoryItemDto {
  enrollmentId: number;
  classId: number;
  classTitle: string;
  groupName?: string | null;
  sportName: string;
  trainerFullName: string;
  schedules: CourseScheduleDto[];
  attendances: AttendanceHistoryDto[];
}

export interface ActiveMemberDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: GenderType;
  birthDate: string; // DateOnly (YYYY-MM-DD)
  joinDate: string;  // DateTime
  courseHistory?: MemberCourseHistoryItemDto[];
}

// ----------------------------------------------------------------------
// Mock Data (داده‌های نمونه همراه با کلاس‌های ثبت‌نام شده)
// ----------------------------------------------------------------------
const MOCK_MEMBERS: ActiveMemberDto[] = [
  {
    id: 1,
    firstName: 'علی',
    lastName: 'محمدی',
    phoneNumber: '09121112233',
    nationalCode: '0012345678',
    gender: 'MALE',
    birthDate: '1375/06/15',
    joinDate: '1402/01/10',
    courseHistory: [
      {
        enrollmentId: 101,
        classId: 1,
        classTitle: 'کلاس بدنسازی پیشرفته',
        groupName: 'گروه A - عصر',
        sportName: 'بدنسازی',
        trainerFullName: 'استاد رضایی',
        schedules: [
          { dayOfWeek: 'زوج', time: '۱۸:۰۰ - ۱۹:۳۰' },
        ],
        attendances: [],
      },
      {
        enrollmentId: 102,
        classId: 2,
        classTitle: 'تمرینات آمادگی جسمانی',
        groupName: 'گروه عمومی',
        sportName: 'فیتنس',
        trainerFullName: 'کاپیتان احمدی',
        schedules: [
          { dayOfWeek: 'فرد', time: '۱۶:۰۰ - ۱۷:۳۰' },
        ],
        attendances: [],
      },
    ],
  },
  {
    id: 2,
    firstName: 'سارا',
    lastName: 'احمدی',
    phoneNumber: '09129876543',
    nationalCode: '0087654321',
    gender: 'FEMALE',
    birthDate: '1380/02/20',
    joinDate: '1402/05/18',
    courseHistory: [
      {
        enrollmentId: 103,
        classId: 3,
        classTitle: 'یوگا و مدیتیشن',
        groupName: 'سانس بانوان',
        sportName: 'یوگا',
        trainerFullName: 'خانم شریفی',
        schedules: [
          { dayOfWeek: 'روزهای زوج', time: '۱۰:۰۰ - ۱۱:۳۰' },
        ],
        attendances: [],
      },
    ],
  },
  {
    id: 3,
    firstName: 'رضا',
    lastName: 'کرمی',
    phoneNumber: '09355554433',
    nationalCode: '0055551234',
    gender: 'MALE',
    birthDate: '1370/11/05',
    joinDate: '1402/10/01',
    courseHistory: [],
  },
];

export default function ActiveMembersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<ActiveMemberDto | null>(null);

  // فیلتر کردن شاگردان بر اساس جستجو
  const filteredMembers = MOCK_MEMBERS.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    return (
      fullName.includes(searchTerm) ||
      member.phoneNumber.includes(searchTerm) ||
      member.nationalCode.includes(searchTerm)
    );
  });

  const getGenderLabel = (gender: GenderType) => {
    switch (gender) {
      case 'MALE':
        return 'آقا';
      case 'FEMALE':
        return 'خانم';
      default:
        return 'سایر';
    }
  };

  return (
    <div className="w-full space-y-4 font-semibold text-right rtl">
      {/* ۱. کارت سرچ بالای صفحه */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شماره تلفن یا کد ملی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F16D34]/20 focus:border-[#F16D34] transition-all"
          />
        </div>
      </div>

      {/* ۲. جدول نمایش شاگردان (بدون هاور جدول) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold">
                <th className="py-3.5 px-4">نام و نام خانوادگی</th>
                <th className="py-3.5 px-4">شماره همراه</th>
                <th className="py-3.5 px-4">تاریخ عضویت</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="transition-none">
                    {/* نام و آواتار */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100/70 border border-[#F16D34]/30 text-[#F16D34] flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    </td>

                    {/* شماره همراه */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {member.phoneNumber}
                    </td>

                    {/* تاریخ عضویت */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {member.joinDate}
                    </td>

                    {/* دکمه جزئیات با استایل Primary نارنجی و متن سفید */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-primary hover:bg-[#d95b23] rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>جزئیات</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    هیچ شاگردی با مشخصات وارد شده یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ۳. دیالوگ / مدال جزئیات اطلاعات (همراه با خط‌چین و اطلاعات کلاس‌ها) */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white w-lg max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر مدال */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#F16D34]" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  جزئیات اطلاعات
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 bg-transparent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* بخش ۱: اطلاعات فردی شاگرد */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5" /> نام کامل
                </span>
                <p className="font-semibold text-slate-800">
                  {selectedMember.firstName} {selectedMember.lastName}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> شماره همراه
                </span>
                <p className="font-mono font-semibold text-slate-800">
                  {selectedMember.phoneNumber}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Identification className="w-3.5 h-3.5" /> کد ملی
                </span>
                <p className="font-mono font-semibold text-slate-800">
                  {selectedMember.nationalCode || 'ثبت نشده'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  جنسیت
                </span>
                <p className="font-semibold text-slate-800">
                  {getGenderLabel(selectedMember.gender)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> تاریخ تولد
                </span>
                <p className="font-mono font-semibold text-slate-800">
                  {selectedMember.birthDate}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> تاریخ عضویت
                </span>
                <p className="font-mono font-semibold text-slate-800">
                  {selectedMember.joinDate}
                </p>
              </div>
            </div>

            {/* خط جداکننده خط‌چین (Dashed) */}
            <div className="border-b-2 border-dashed border-primary-deep my-4" />

            {/* بخش ۲: کلاس‌های ثبت‌نام شده (MemberCourseHistoryItemDto) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <AcademicCap className="w-4 h-4 text-[#F16D34]" />
                <span>کلاس‌های فعال / دوره ثبت‌نام شده</span>
              </div>

              {selectedMember.courseHistory && selectedMember.courseHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedMember.courseHistory.map((course) => (
                    <div
                      key={course.enrollmentId}
                      className="p-3 bg-orange-50/40 border border-orange-200/60 rounded-xl text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-[#F16D34]">
                          <Dumbbell className="w-3.5 h-3.5" />
                          {course.classTitle}
                        </span>
                        <span className="bg-primary px-2 py-0.5 rounded-md text-[11px] text-slate-50 border border-primary">
                          {course.sportName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-orange-100">
                        <div className="flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          <span>گروه:</span>
                          <span className="font-medium text-slate-700">
                            {course.groupName || 'عمومی'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <AcademicCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>مربی:</span>
                          <span className="font-medium text-slate-700">
                            {course.trainerFullName}
                          </span>
                        </div>
                      </div>

                      {/* برنامه زمان‌بندی کلاس */}
                      {course.schedules && course.schedules.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>زمان برگزاری:</span>
                          <span className="font-mono text-slate-700">
                            {course.schedules.map((s) => `${s.dayOfWeek} (${s.time})`).join('، ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                  این شاگرد در حال حاضر در هیچ کلاسی ثبت‌نام نکرده است.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
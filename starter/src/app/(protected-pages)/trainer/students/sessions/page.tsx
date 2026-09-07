'use client';

import React, { useState, useEffect } from 'react';
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

// Import Centralized ApiService
import ApiService from '@/services/client/ApiService';

// ----------------------------------------------------------------------
// Helper Function: تبدیل تاریخ میلادی ISO به شمسی (YYYY/MM/DD)
// ----------------------------------------------------------------------
const toPersianDate = (gregorianDateString?: string | null): string => {
  if (!gregorianDateString) return 'ثبت نشده';
  try {
    const date = new Date(gregorianDateString);
    if (isNaN(date.getTime())) return gregorianDateString;
    
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return gregorianDateString;
  }
};

// ----------------------------------------------------------------------
// Types & DTO Interfaces
// ----------------------------------------------------------------------
export type GenderType = 'Female' | 'Male' | string;

export interface CourseScheduleDto {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceHistoryDto {
  attendanceDate: string;
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
  birthDate: string; // ISO / Date
  joinDate: string;  // ISO / DateTime
  courseHistory?: MemberCourseHistoryItemDto[];
}

export interface MemberDetailsResponseDto extends ActiveMemberDto {
  medicalNotes?: string;
  emergencyPhone?: string;
  isActive?: boolean;
  courses?: MemberCourseHistoryItemDto[];
}

export default function ActiveMembersList() {
  const [members, setMembers] = useState<ActiveMemberDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedMember, setSelectedMember] = useState<ActiveMemberDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // ۱. دریافت لیست اعضای فعال پروژه با ApiService (GET /api/members)
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await ApiService.get<ActiveMemberDto[]>('/members');
        setMembers(data || []);
      } catch (error) {
        console.error('خطا در دریافت لیست شاگردان:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // ۲. دریافت جزئیات و دوره‌های عضو انتخابی با ApiService (GET /api/members/{id}/details یا /courses)
  const handleOpenDetailsModal = async (member: ActiveMemberDto) => {
    setSelectedMember(member);
    setLoadingDetails(true);

    try {
      const detailsData = await ApiService.get<MemberDetailsResponseDto>(`/members/${member.id}/details`);
      if (detailsData) {
        setSelectedMember({
          ...member,
          ...detailsData,
          courseHistory: detailsData.courses || [],
        });
      }
    } catch (error) {
      console.error('خطا در دریافت جزئیات عضو:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // فیلتر کردن شاگردان بر اساس جستجو
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
    const query = searchTerm.trim().toLowerCase();
    
    return (
      fullName.toLowerCase().includes(query) ||
      (member.phoneNumber && member.phoneNumber.includes(query)) ||
      (member.nationalCode && member.nationalCode.includes(query))
    );
  });

  const getGenderLabel = (gender: GenderType) => {
    if (!gender) return 'ثبت نشده';
    const normalized = gender.toString().toLowerCase();
    if (normalized === 'female' || normalized === 'خانم') return 'خانم';
    if (normalized === 'male' || normalized === 'آقا') return 'آقا';
    return gender;
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

      {/* ۲. جدول نمایش شاگردان */}
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    در حال دریافت اطلاعات شاگردان...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
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
                      {member.phoneNumber || '---'}
                    </td>

                    {/* تاریخ عضویت (تبدیل به شمسی) */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {toPersianDate(member.joinDate)}
                    </td>

                    {/* دکمه جزئیات */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetailsModal(member)}
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

      {/* ۳. دیالوگ / مدال جزئیات اطلاعات */}
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
                  جزئیات اطلاعات شاگرد
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 bg-transparent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                در حال دریافت جزئیات دوره‌ها و اطلاعات...
              </div>
            ) : (
              <>
                {/* بخش ۱: اطلاعات فردی شاگرد (با تاریخ‌های شمسی) */}
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
                      {selectedMember.phoneNumber || 'ثبت نشده'}
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
                      {toPersianDate(selectedMember.birthDate)}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> تاریخ عضویت
                    </span>
                    <p className="font-mono font-semibold text-slate-800">
                      {toPersianDate(selectedMember.joinDate)}
                    </p>
                  </div>
                </div>

                {/* خط جداکننده خط‌چین */}
                <div className="border-b-2 border-dashed border-primary-deep my-4" />

                {/* بخش ۲: کلاس‌های ثبت‌نام شده */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                    <AcademicCap className="w-4 h-4 text-[#F16D34]" />
                    <span>کلاس‌های فعال / دوره ثبت‌نام شده</span>
                  </div>

                  {selectedMember.courseHistory && selectedMember.courseHistory.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedMember.courseHistory.map((course) => (
                        <div
                          key={course.enrollmentId || course.classId}
                          className="p-3 bg-orange-50/40 border border-orange-200/60 rounded-xl text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="flex items-center gap-1.5 text-[#F16D34]">
                              <Dumbbell className="w-3.5 h-3.5" />
                              {course.classTitle}
                            </span>
                            <span className="bg-primary px-2 py-0.5 rounded-md text-[11px] text-slate-50 border border-primary">
                              {course.sportName || 'عمومی'}
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
                                {course.trainerFullName || 'تعیین نشده'}
                              </span>
                            </div>
                          </div>

                          {/* برنامه زمان‌بندی کلاس */}
                          {course.schedules && course.schedules.length > 0 && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>زمان برگزاری:</span>
                              <span className="font-mono text-slate-700">
                                {course.schedules
                                  .map((s) => `${s.dayOfWeek} (${s.startTime} - ${s.endTime})`)
                                  .join('، ')}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
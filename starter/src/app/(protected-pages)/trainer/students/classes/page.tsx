'use client';

import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSearch as Search, 
  HiOutlineClock as Clock, 
  HiOutlineUsers as Users, 
  HiOutlineX as X, 
  HiOutlinePhone as Phone 
} from 'react-icons/hi';

// Import UI Components from Design System
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

// Import Centralized API Service
import ApiService from '@/services/client/ApiService';

// ----------------------------------------------------------------------
// Interfaces & Types
// ----------------------------------------------------------------------
interface SelectOption {
  value: string;
  label: string;
}

interface Schedule {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface GymClass {
  id: number;
  title: string;
  groupName: string;
  trainerName: string;
  sportName: string;
  capacity: number;
  remainingCapacity: number;
  startDate: string;
  isActive: boolean;
  schedules: Schedule[];
}

interface ClassMember {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface Sport {
  id: number;
  name: string;
}

interface CourseItem {
  classId?: number;
  classTitle?: string;
}

interface MemberCoursesResponse {
  courses?: CourseItem[];
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function CoachClassesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sports, setSports] = useState<SelectOption[]>([]);
  const [selectedSportOption, setSelectedSportOption] = useState<SelectOption | null>(null);
  
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);

  const [selectedClassForMembers, setSelectedClassForMembers] = useState<GymClass | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  // ۱. دریافت لیست رشته‌های ورزشی برای Dropdown با ApiService
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await ApiService.get<Sport[]>('/sports');
        const options: SelectOption[] = [
          { value: 'ALL', label: 'همه رشته‌ها' },
          ...(data || []).map((sport) => ({
            value: sport.name,
            label: sport.name,
          })),
        ];
        setSports(options);
        setSelectedSportOption(options[0]);
      } catch (error) {
        console.error('خطا در دریافت لیست رشته‌ها:', error);
      }
    };

    fetchSports();
  }, []);

  // ۲. دریافت لیست کلاس‌ها با ApiService
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await ApiService.get<GymClass[]>('/gym-classes');
        setClasses(data || []);
      } catch (error) {
        console.error('خطا در دریافت لیست کلاس‌ها:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // ۳. دریافت اعضای کلاس انتخابی (راهکار الف) با ApiService
  const handleOpenMembersModal = async (gymClass: GymClass) => {
    setSelectedClassForMembers(gymClass);
    setLoadingMembers(true);
    setClassMembers([]);

    try {
      const allMembers = await ApiService.get<ClassMember[]>('/members');
      if (allMembers && Array.isArray(allMembers)) {
        const filteredMembers: ClassMember[] = [];

        for (const member of allMembers) {
          try {
            const coursesData = await ApiService.get<MemberCoursesResponse>(`/members/${member.id}/courses`);
            const hasCourse = coursesData?.courses?.some(
              (c) => c.classId === gymClass.id || c.classTitle === gymClass.title
            );
            if (hasCourse) {
              filteredMembers.push({
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                phoneNumber: member.phoneNumber,
              });
            }
          } catch (err) {
            console.error(`خطا در دریافت دوره‌های کاربر ${member.id}:`, err);
          }
        }
        setClassMembers(filteredMembers);
      }
    } catch (error) {
      console.error('خطا در دریافت اعضای کلاس:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // منطق فیلتر کردن لیست کلاس‌ها بر اساس جستجو و رشته
  const filteredClasses = classes.filter((cls) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = query === '' || cls.title?.toLowerCase().includes(query) || cls.sportName?.toLowerCase().includes(query);

    const selectedVal = selectedSportOption?.value || 'ALL';
    const matchesSport = selectedVal === 'ALL' || cls.sportName === selectedVal;

    return matchesSearch && matchesSport;
  });

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 flex flex-col gap-5 font-semibold text-slate-800 bg-slate-50/50">

      {/* ۱. کانتینر بالای صفحه (فیلترها و جستجو) */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#BBE0EF]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* باکس جستجو */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="جستجوی نام کلاس یا رشته..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-[#BBE0EF]/10 border border-[#BBE0EF]/50 rounded-xl text-xs text-[#161E54] placeholder-[#161E54]/50 focus:outline-none focus:border-[#F16D34] focus:ring-1 focus:ring-[#F16D34] transition-all"
          />
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#161E54]/60" />
        </div>

        {/* فیلتر دراپ‌داون رشته‌های ورزشی */}
        <div className="w-full sm:w-64">
          <Select<SelectOption>
            placeholder="انتخاب رشته ورزشی"
            options={sports}
            value={selectedSportOption}
            onChange={(option) => setSelectedSportOption(option as SelectOption)}
            className="font-semibold text-xs"
          />
        </div>
      </div>

      {/* ۲. کانتینر اصلی لیست کلاس‌ها */}
      <div className="w-full bg-white rounded-t-2xl rounded-b-none p-4 sm:p-5 shadow-sm border border-slate-200/80 flex-1 flex flex-col gap-3">
        {loadingClasses ? (
          <div className="w-full py-12 text-center text-xs text-slate-400">
            در حال دریافت اطلاعات کلاس‌ها...
          </div>
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => {
            const scheduleText = cls.schedules && cls.schedules.length > 0
              ? `${cls.schedules[0].startTime} - ${cls.schedules[0].endTime}`
              : 'زمان تعیین‌نشده';

            return (
              <div
                key={cls.id}
                className="w-full p-4 bg-[#F8FAFC] hover:bg-white border border-[#BBE0EF]/30 hover:border-[#F16D34]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-md"
              >
                {/* اطلاعات کلاس */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-[#161E54]">
                    {cls.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#161E54]/80">
                    <span className="bg-[#BBE0EF]/30 text-[#161E54] px-2.5 py-1 rounded-md font-semibold text-[11px]">
                      رشته: {cls.sportName || 'عمومی'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#F16D34]" />
                      {scheduleText}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#F16D34]" />
                      {cls.capacity - cls.remainingCapacity} / {cls.capacity} ورزشکار
                    </span>
                  </div>
                </div>

                {/* دکمه مشاهده اعضا */}
                <Button
                  onClick={() => handleOpenMembersModal(cls)}
                  className="text-xs px-4 py-2 rounded-xl border border-[#BBE0EF] bg-white text-[#161E54] hover:bg-[#F16D34] hover:text-white hover:border-[#F16D34] transition-colors self-start sm:self-auto cursor-pointer shadow-2xs font-bold"
                >
                  مشاهده اعضا
                </Button>
              </div>
            );
          })
        ) : (
          <div className="w-full py-12 text-center text-xs text-slate-400">
            هیچ کلاسی با مشخصات جستجو شده یافت نشد.
          </div>
        )}
      </div>

      {/* ۳. دیالوگ / مدال نمایش اعضای کلاس */}
      {selectedClassForMembers && (
        <div 
          onClick={() => setSelectedClassForMembers(null)}
          className="fixed inset-0 bg-[#161E54]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-lg max-w-lg bg-white rounded-2xl p-5 shadow-2xl border border-[#BBE0EF]/60 flex flex-col gap-4"
          >
            {/* هدر دیالوگ */}
            <div className="flex items-center justify-between border-b border-[#BBE0EF]/30 pb-3">
              <h4 className="text-sm font-bold text-[#161E54]">
                اعضای {selectedClassForMembers.title}
              </h4>
              <button 
                onClick={() => setSelectedClassForMembers(null)}
                className="p-1 hover:bg-[#BBE0EF]/20 rounded-lg text-[#161E54]/60 hover:text-[#161E54] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* لیست اعضا */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {loadingMembers ? (
                <div className="p-6 text-center text-xs text-[#161E54]/50">
                  در حال دریافت لیست اعضا...
                </div>
              ) : classMembers.length > 0 ? (
                classMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 border border-[#BBE0EF]/40 rounded-xl bg-[#F8FAFC] flex items-center justify-between gap-2 hover:border-[#F16D34]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-full bg-[#161E54] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        {member.firstName?.charAt(0) || 'ع'}
                      </div>
                      <span className="text-xs font-bold text-[#161E54] truncate">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#BBE0EF]/30 font-mono text-[11px] text-[#161E54] shrink-0">
                      <Phone className="w-3 h-3 text-[#F16D34]" />
                      <span>{member.phoneNumber}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#161E54]/50">
                  هیچ عضوی در این کلاس ثبت نشده است.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
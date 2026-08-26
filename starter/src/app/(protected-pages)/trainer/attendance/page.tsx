'use client';

import React, { useState, useMemo } from 'react';
import moment from 'jalali-moment';
import { 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineClock, 
  HiOutlineCalendar, 
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineSave,
  HiChevronDown,
  HiOutlineSearch
} from 'react-icons/hi';
import { FaDumbbell } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';

export interface AttendanceHistoryDto {
  attendanceDate: string;
  isPresent: boolean;
}

interface StudentAttendance {
  studentId: string;
  studentName: string;
}

interface TrainerClassRaw {
  id: string;
  className: string;
  sportType: string;
  classTime: string;
  daysOfWeek: string[];
  students: StudentAttendance[];
}

const getWeekDates = (daysOfWeek: string[]) => {
  const today = moment().locale('fa');
  
  const daysMap: Record<string, number> = {
    'شنبه': 0,
    'یکشنبه': 1,
    'دوشنبه': 2,
    'سه‌شنبه': 3,
    'سه شنبه': 3,
    'چهارشنبه': 4,
    'پنج‌شنبه': 5,
    'پنجشنبه': 5,
    'جمعه': 6
  };

  const dayName = today.format('dddd');
  const currentDayIndex = daysMap[dayName] ?? 0;

  let saturday = today.clone().subtract(currentDayIndex, 'days');

  if (currentDayIndex === 6) {
    saturday = today.clone().add(1, 'day');
  }

  return daysOfWeek.map((dName) => {
    const targetIndex = daysMap[dName] ?? 0;
    const sessionDate = saturday.clone().add(targetIndex, 'days');

    return {
      dayName: dName,
      dateStr: sessionDate.format('YYYY/MM/DD'),
    };
  });
};

const MOCK_RAW_CLASSES: TrainerClassRaw[] = [
  {
    id: 'c1',
    className: 'کلاس بدنسازی پیشرفته (سانس A)',
    sportType: 'بدنسازی',
    classTime: '۱۸:۰۰ - ۱۹:۳۰',
    daysOfWeek: ['شنبه', 'دوشنبه', 'چهارشنبه'],
    students: [
      { studentId: '1', studentName: 'علی محمدی' },
      { studentId: '2', studentName: 'رضا کرمی' },
      { studentId: '3', studentName: 'محمدحسین حسینی' },
      { studentId: '4', studentName: 'امیرحسین رضایی' },
    ],
  },
  {
    id: 'c2',
    className: 'کلاس فیتنس و چربی‌سوزی',
    sportType: 'فیتنس',
    classTime: '۱۶:۰۰ - ۱۷:۳۰',
    daysOfWeek: ['یکشنبه', 'سه‌شنبه'],
    students: [
      { studentId: '5', studentName: 'مهدی کشاورز' },
      { studentId: '6', studentName: 'سعید احمدی' },
    ],
  },
  {
    id: 'c3',
    className: 'کلاس تمرینات معلق TRX',
    sportType: 'آمادگی جسمانی',
    classTime: '۱۹:۳۰ - ۲۱:۰۰',
    daysOfWeek: ['شنبه', 'دوشنبه'],
    students: [
      { studentId: '7', studentName: 'کامران امیری' },
      { studentId: '8', studentName: 'امید نجفی' },
      { studentId: '9', studentName: 'حسین بابایی' },
    ],
  },
];

export default function TrainerAttendanceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [submittedClassName, setSubmittedClassName] = useState('');

  const allTrainerClasses = useMemo(() => {
    return MOCK_RAW_CLASSES.map((cls) => ({
      ...cls,
      sessions: getWeekDates(cls.daysOfWeek),
    }));
  }, []);

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return allTrainerClasses;
    const query = searchQuery.toLowerCase();
    return allTrainerClasses.filter(
      (cls) =>
        cls.className.toLowerCase().includes(query) ||
        cls.sportType.toLowerCase().includes(query)
    );
  }, [allTrainerClasses, searchQuery]);

  const handleToggleClass = (clsId: string) => {
    setOpenClassId((prev) => (prev === clsId ? null : clsId));
  };

  const toggleAttendance = (classId: string, studentId: string, dateStr: string) => {
    const key = `${classId}_${studentId}_${dateStr}`;
    setAttendanceState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmitAttendance = (cls: typeof allTrainerClasses[0]) => {
    setIsSubmitting(true);

    const payload = cls.students.map((student) => {
      const attendanceHistory: AttendanceHistoryDto[] = cls.sessions.map((session) => {
        const key = `${cls.id}_${student.studentId}_${session.dateStr}`;
        return {
          attendanceDate: session.dateStr,
          isPresent: !!attendanceState[key],
        };
      });

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        classId: cls.id,
        attendanceHistory,
      };
    });

    console.log('پای‌لود ارسال به بک‌اند:', payload);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedClassName(cls.className);
      setDialogIsOpen(true);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 dir-rtl font-samibold">
      
      {/* هدر اصلی */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--primary-mild)] flex items-center justify-center shrink-0 shadow-md">
            <HiOutlineUserGroup className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--primary)]">
              حضور و غیاب کلاس‌های مربی
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              برنامه‌ریزی و ثبت حضور و غیاب اعضا برای هفته جاری
            </p>
          </div>
        </div>

        {/* فیلد سرچ اختصاصی با هاور و فوکوس سایه‌دار نارنجی */}
        <div className="w-full md:w-80">
          <Input
            size="sm"
            placeholder="جستجوی کلاس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<HiOutlineSearch className="text-lg text-slate-400" />}
            className="rounded-xl border-slate-200 transition-all duration-200 
                       hover:border-primary-deep hover:shadow-primary-deep
                       focus:border-primary-deep focus:ring-0 focus:shadow-primary-deep"
          />
        </div>
      </div>

      {/* لیست کارت‌های کلاس */}
      <div className="space-y-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => {
            const isOpen = openClassId === cls.id;

            return (
              <div
                key={cls.id}
                className={`rounded-2xl border transition-all duration-300 transform overflow-hidden ${
                  isOpen 
                    ? 'border-[var(--primary-deep)] ring-2 ring-[var(--primary-subtle)]/40 shadow-lg bg-white' 
                    : 'bg-[#EBF5FA] border-[var(--primary-mild)] hover:-translate-y-1 hover:border-[var(--primary-deep)] hover:shadow-[0_10px_25px_-5px_rgba(241,109,52,0.25)]'
                }`}
              >
                <div
                  onClick={() => handleToggleClass(cls.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                      isOpen ? 'bg-[var(--primary-deep)] text-white' : 'bg-[var(--primary)] text-[var(--primary-mild)]'
                    }`}>
                      <FaDumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[var(--primary)]">
                        {cls.className}
                      </h3>
                      <span className="inline-block text-xs font-semibold text-[var(--primary-deep)] bg-white px-3 py-1 rounded-lg mt-1 border border-[var(--primary-subtle)]/40 shadow-2xs">
                        {cls.sportType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 text-slate-700 font-medium shadow-2xs">
                        <HiOutlineClock className="w-4 h-4 text-[var(--primary-deep)]" />
                        <span>ساعت: <strong>{cls.classTime}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 text-slate-700 font-medium shadow-2xs">
                        <HiOutlineUserGroup className="w-4 h-4 text-[var(--primary-deep)]" />
                        <span>اعضا: <strong>{cls.students.length} نفر</strong></span>
                      </div>
                    </div>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                      isOpen ? 'bg-[var(--primary-deep)] text-white rotate-180' : 'bg-white text-[var(--primary)] border border-slate-200/70'
                    }`}>
                      <HiChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-5 animate-fadeIn">
                    
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="bg-[var(--primary)] text-white text-xs font-semibold">
                              <th className="py-3.5 px-4 w-1/3 min-w-[160px]">نام و نام خانوادگی ورزشکار</th>
                              {cls.sessions.map((session, idx) => (
                                <th key={idx} className="py-3.5 px-4 text-center min-w-[100px]">
                                  <div className="font-bold text-[var(--primary-mild)]">{session.dayName}</div>
                                  <div className="text-[10px] opacity-80 font-normal">{session.dateStr}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {cls.students.map((student) => (
                              <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-[var(--primary)]">
                                  {student.studentName}
                                </td>

                                {cls.sessions.map((session, sIdx) => {
                                  const key = `${cls.id}_${student.studentId}_${session.dateStr}`;
                                  const isPresent = !!attendanceState[key];

                                  return (
                                    <td key={sIdx} className="py-2.5 px-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => toggleAttendance(cls.id, student.studentId, session.dateStr)}
                                        className={`w-10 h-10 mx-auto rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
                                          isPresent
                                            ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 scale-105'
                                            : 'bg-white border-rose-300 text-rose-500 hover:border-rose-400 hover:bg-rose-50'
                                        }`}
                                        title={isPresent ? 'حاضر' : 'غایب'}
                                      >
                                        {isPresent ? (
                                          <HiOutlineCheck className="w-6 h-6 stroke-[3]" />
                                        ) : (
                                          <HiOutlineX className="w-5 h-5 stroke-[2.5]" />
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[10px]">
                            <HiOutlineCheck className="w-3 h-3 stroke-[3]" />
                          </span>
                          حاضر
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-lg bg-white border border-rose-300 flex items-center justify-center text-rose-500 text-[10px]">
                            <HiOutlineX className="w-3 h-3 stroke-[2.5]" />
                          </span>
                          غایب (پیش‌فرض)
                        </span>
                      </div>

                      <Button
                        onClick={() => handleSubmitAttendance(cls)}
                        disabled={isSubmitting}
                        className="bg-[var(--primary-deep)] hover:bg-[#d95b25] text-white text-xs px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
                      >
                        <HiOutlineSave className="w-4 h-4" />
                        {isSubmitting ? 'در حال ثبت...' : 'ثبت حضور و غیاب این کلاس'}
                      </Button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            هیچ کلاسی با این عنوان یافت نشد.
          </div>
        )}
      </div>

      {/* مودال دیالوگ */}
      <Dialog
        isOpen={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        <div className="text-center p-2 font-samibold dir-rtl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">
            ثبت با موفقیت انجام شد
          </h4>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            اطلاعات حضور و غیاب مربوط به <strong className="text-[var(--primary)]">{submittedClassName}</strong> با موفقیت ذخیره شد.
          </p>
          <div className="flex justify-center">
            <Button
              variant="solid"
              className="bg-[var(--primary-deep)] hover:bg-[#d95b25] text-white px-8 py-2 rounded-xl text-xs font-bold"
              onClick={() => setDialogIsOpen(false)}
            >
              متوجه شدم
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
'use client';

import React from 'react';
import { HiOutlineClock, HiOutlineSparkles } from 'react-icons/hi';

/*
================================================================================
  کدهای اصلی صفحه حضور و غیاب مربی (غیرفعال‌شده جهت نمایش پیام «به‌زودی»)
================================================================================

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
*/

export default function TrainerAttendanceManagement() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-[75vh] flex items-center justify-center dir-rtl font-semibold">
      
      {/* کارت شیک «به‌زودی» */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6 w-full max-w-lg relative overflow-hidden">
        
        {/* نور تزئینی پس‌زمینه */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F16D34]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#161E54]/10 rounded-full blur-2xl pointer-events-none" />

        {/* آیکون اصلی */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
          <div className="w-14 h-14 rounded-xl bg-[#161E54] text-white flex items-center justify-center shadow-md">
            <HiOutlineClock className="w-8 h-8 text-[#FF986A] animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F16D34] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F16D34]"></span>
          </span>
        </div>

        {/* متون توضیحات */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-[#F16D34] px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
            <HiOutlineSparkles className="w-4 h-4" />
            <span>ویژگی در حال توسعه</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#161E54]">
            این صفحه به‌زودی برای شما باز می‌شود
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            بخش ثبت و مدیریت آنلاین حضور و غیاب اعضای کلاس در حال آماده‌سازی نهایی است و به‌زودی در دسترس شما قرار خواهد گرفت.
          </p>
        </div>

        {/* نشان وضعیت */}
        <div className="pt-2">
          <div className="inline-block bg-slate-100 text-slate-600 text-[11px] font-mono px-4 py-1.5 rounded-xl border border-slate-200">
            Status: Coming Soon
          </div>
        </div>

      </div>

    </div>
  );
}
"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { HiOutlineCalendar } from "react-icons/hi";

// غیرفعال کردن SSR جهت جلوگیری از خطای Hydration در Next.js
const MultiDatePicker = dynamic(() => import("react-multi-date-picker"), {
  ssr: false,
});

export interface CustomDatePickerProps {
  value?: string | null; // تاریخ میلادی ورودی (مثلاً "2024-05-15")
  onChange?: (gregorianDate: string) => void; // خروجی میلادی ("2024-05-15")
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  calendarPosition?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  className = "",
  calendarPosition = "bottom-right",
}: CustomDatePickerProps) {
  // تبدیل ورودی میلادی به DateObject شمسی جهت نمایش در Picker
  const dateValue = useMemo(() => {
    if (!value) return null;
    try {
      return new DateObject({
        date: value,
        format: "YYYY-MM-DD",
        calendar: gregorian,
        locale: gregorian_en,
      }).convert(persian, persian_fa);
    } catch {
      return null;
    }
  }, [value]);

  // تبدیل تاریخ انتخابی شمسی به فرمت میلادی استاندارد YYYY-MM-DD
  const handleDateChange = (date: DateObject | null) => {
    if (!onChange) return;

    if (!date) {
      onChange("");
      return;
    }

    const gregorianDate = new DateObject(date)
      .convert(gregorian, gregorian_en)
      .format("YYYY-MM-DD");

    onChange(gregorianDate);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <MultiDatePicker
        calendar={persian}
        locale={persian_fa}
        calendarPosition={calendarPosition}
        value={dateValue}
        onChange={handleDateChange}
        disabled={disabled}
        placeholder={placeholder}
        format="YYYY/MM/DD"
        inputClass={`w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pr-10 pl-4 py-2.5 text-sm text-[#1D3557] focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        containerStyle={{ width: "100%" }}
      />
      <HiOutlineCalendar className="absolute right-3 top-3.5 h-5 w-5 text-[#457B9D] pointer-events-none z-10" />
    </div>
  );
}
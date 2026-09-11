"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Select from "@/components/ui/Select";
import ApiService from "@/services/client/ApiService";
import {
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCalendar,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
} from "react-icons/hi";

export interface OptionType {
  value: string;
  label: string;
}

export interface ScheduleItem {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface GymClassItem {
  gymClassId: number;
  title: string;
  capacity: number;
  startDate: string;
  remainingSessions: number;
  trainerFullName: string;
  schedules: ScheduleItem[];
}

export interface PackageItem {
  id: number;
  title: string;
  trainerName: string;
  durationDays: number;
  totalSessions: number;
  price: number;
  // جزئیات تکمیلی پکیج
  isActive?: boolean;
  trainerId?: number;
  classes?: GymClassItem[];
  isLoadingClasses?: boolean;
}

const WEEK_DAYS_MAP: Record<string, string> = {
  Saturday: "شنبه",
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنج‌شنبه",
  Friday: "جمعه",
};

const getArrayFromResponse = <T,>(res: any): T[] => {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
};

export default function AdminPackagesListPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOptions, setSearchOptions] = useState<OptionType[]>([]);
  const [isPending, startTransition] = useTransition();

  const [expandedPackageId, setExpandedPackageId] = useState<number | null>(null);

  // دریافت لیست پکیج‌های فعال
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await ApiService.get<any>("/packages");
      const data = getArrayFromResponse<PackageItem>(res);
      setPackages(data);
    } catch (err) {
      console.error("خطا در دریافت لیست پکیج‌ها:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // هندلر جستجو
  const handleSearchInputChange = (inputValue: string) => {
    setSearchQuery(inputValue);

    startTransition(() => {
      if (!inputValue.trim()) {
        setSearchOptions([]);
        return;
      }

      const filtered = packages.filter(
        (pkg) =>
          pkg.title?.toLowerCase().includes(inputValue.toLowerCase()) ||
          pkg.trainerName?.toLowerCase().includes(inputValue.toLowerCase())
      );

      const options: OptionType[] = filtered.map((pkg) => ({
        value: String(pkg.id),
        label: `${pkg.title} - ${pkg.trainerName || "بدون مربی"}`,
      }));

      setSearchOptions(options);
    });
  };

  // باز و بسته کردن و لود کلاس‌های مربوط به پکیج
  const toggleExpand = async (packageId: number) => {
    if (expandedPackageId === packageId) {
      setExpandedPackageId(null);
      return;
    }

    setExpandedPackageId(packageId);

    // بررسی اینکه آیا اطلاعات قبلاً لود شده است یا خیر
    const currentPkg = packages.find((p) => p.id === packageId);
    if (!currentPkg?.classes) {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === packageId ? { ...pkg, isLoadingClasses: true } : pkg
        )
      );

      try {
        const [classesRes, detailRes] = await Promise.all([
          ApiService.get<any>(`/gym-classes/${packageId}/classes`),
          ApiService.get<any>(`/packages/${packageId}`),
        ]);

        const classesData = getArrayFromResponse<GymClassItem>(classesRes);
        const detailData = detailRes?.data || detailRes || {};

        setPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === packageId
              ? {
                  ...pkg,
                  ...detailData,
                  classes: classesData,
                  isLoadingClasses: false,
                }
              : pkg
          )
        );
      } catch (err) {
        console.error("خطا در دریافت کلاس‌های پکیج:", err);
        setPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === packageId ? { ...pkg, isLoadingClasses: false, classes: [] } : pkg
          )
        );
      }
    }
  };

  // فیلتر نهایی لیست پکیج‌ها
  const filteredPackages = packages.filter((pkg) => {
    if (!searchQuery) return true;
    return (
      pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.trainerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      dir="rtl"
      data-role="ADMIN"
      className="flex min-h-screen flex-col space-y-6 bg-slate-50 p-4 font-semibold text-[var(--primary)] md:p-8"
    >
      {/* هدر صفحه */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            مدیریت دوره ها و کلاس‌ها
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            مشاهده، جستجو و بررسی کلاس‌های متصل به هر دوره
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <Select
              options={searchOptions}
              value={
                searchQuery
                  ? { value: searchQuery, label: searchQuery }
                  : null
              }
              onChange={(opt) => {
                if (opt) {
                  const selectedPkg = packages.find((p) => String(p.id) === opt.value);
                  setSearchQuery(selectedPkg ? selectedPkg.title : opt.label);
                } else {
                  setSearchQuery("");
                }
              }}
              onInputChange={handleSearchInputChange}
              isSearchable
              isLoading={isPending}
              placeholder="جستجوی دورهیا مربی..."
            />
          </div>

          <Link
            href="/admin/course/add-course"
            className="flex items-center justify-center gap-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[var(--primary-mild)]"
          >
            <span>+ تعریف دوره جدید</span>
          </Link>
        </div>
      </div>

      {/* لیست پکیج‌ها */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-[var(--primary-mild)]/20 bg-white">
            <p className="text-xs text-slate-500">در حال بارگذاری اطلاعات دوره ها...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--primary-mild)]/20 bg-white text-slate-500">
            <HiOutlineExclamation className="h-8 w-8 text-amber-500" />
            <p className="text-xs">دوره ای یافت نشد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPackages.map((pkg) => {
              const isExpanded = expandedPackageId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className="overflow-hidden rounded-2xl border border-[var(--primary-mild)]/30 bg-white shadow-sm transition-all hover:border-[var(--primary-mild)]/60"
                >
                  {/* اطلاعات اصلی کارت دوره*/}
                  <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-lg font-bold text-[var(--primary)]">
                        {pkg.title ? pkg.title.charAt(0) : "P"}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--primary)] md:text-base">
                            {pkg.title}
                          </h3>
                          {pkg.durationDays > 0 && (
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                              {pkg.durationDays} روزه
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <HiOutlineUser className="h-3.5 w-3.5 text-[var(--primary-mild)]" />
                            مربی: {pkg.trainerName || "عمومی / تعریف نشده"}
                          </span>
                          <span className="flex items-center gap-1">
                            <HiOutlineAcademicCap className="h-3.5 w-3.5 text-[var(--primary-mild)]" />
                            تعداد جلسات: {pkg.totalSessions} جلسه
                          </span>
                          <span className="font-semibold text-slate-700">
                            مبلغ: {Number(pkg.price || 0).toLocaleString()} تومان
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(pkg.id)}
                        className="flex items-center gap-1 rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary-subtle)]"
                      >
                        <span>{isExpanded ? "بستن جزئیات" : "مشاهده کلاس‌ها و جزئیات"}</span>
                        {isExpanded ? (
                          <HiOutlineChevronUp className="h-4 w-4" />
                        ) : (
                          <HiOutlineChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* بخش بازشونده (جزئیات و لیست کلاس‌های این پکیج) */}
                  {isExpanded && (
                    <div className="border-t border-[var(--primary-mild)]/20 bg-slate-50/60 p-5">
                      {pkg.isLoadingClasses ? (
                        <p className="text-xs text-slate-500">در حال دریافت کلاس‌های دوره...</p>
                      ) : !pkg.classes || pkg.classes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
                          هیچ کلاسی برای این دوره تعریف نشده است.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
                            <HiOutlineAcademicCap className="h-4 w-4" />
                            <span>کلاس‌های متصل به این دوره({pkg.classes.length} کلاس)</span>
                          </h4>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {pkg.classes.map((cls) => (
                              <div
                                key={cls.gymClassId}
                                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[var(--primary)] text-xs">
                                      {cls.title}
                                    </span>
                                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                                      ظرفیت: {cls.capacity} نفر
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                    <HiOutlineUser className="h-3.5 w-3.5 text-slate-400" />
                                    <span>مربی: {cls.trainerFullName}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                    <HiOutlineCheckCircle className="h-3.5 w-3.5 text-slate-400" />
                                    <span>جلسات باقیمانده: {cls.remainingSessions} جلسه</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                    <HiOutlineCalendar className="h-3.5 w-3.5 text-slate-400" />
                                    <span>شروع دوره: {cls.startDate || "-"}</span>
                                  </div>

                                  {/* زمان‌بندی جلسات */}
                                  {cls.schedules && cls.schedules.length > 0 && (
                                    <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-[10px] text-slate-600">
                                      <span className="font-bold text-[var(--primary)] block">
                                        برنامه سانس‌ها:
                                      </span>
                                      {cls.schedules.map((sch, sIdx) => {
                                        const dayLabel =
                                          WEEK_DAYS_MAP[sch.dayOfWeek] || sch.dayOfWeek;
                                        return (
                                          <div
                                            key={sIdx}
                                            className="flex items-center gap-1"
                                          >
                                            <HiOutlineClock className="h-3 w-3 text-slate-400" />
                                            <span>
                                              {dayLabel}: {sch.startTime?.slice(0, 5)} الی{" "}
                                              {sch.endTime?.slice(0, 5)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

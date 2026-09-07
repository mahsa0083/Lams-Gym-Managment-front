'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Collapsible from '@/components/ui/Collapsible'
import ApiService from '@/services/client/ApiService'
import DatePicker from '@/components/ui/DatePicker'
import {
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineHashtag,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineExclamationCircle as AlertCircle,
  HiOutlineShieldCheck,
  HiOutlineSearch,
  HiOutlineFilter
} from 'react-icons/hi'

export interface SubscriptionItem {
  id: number
  memberName: string
  packageName: string
  trainerName: string
  startDate: string
  endDate: string
  totalSessions: number
  remainingSessions: number
  status: string
}

const formatToShamsi = (dateStr: string) => {
  try {
    const dateObj = new Date(dateStr)
    if (isNaN(dateObj.getTime())) return dateStr
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj)
  } catch {
    return dateStr
  }
}

export default function StudentsSettlementsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCourseInfo, setSelectedCourseInfo] = useState<any | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null)
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await ApiService.get<SubscriptionItem[]>('/subscriptions')
      setSubscriptions(data || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleApprovePayment = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSubscriptions(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'Active' } : item))
    )
  }

  const handleOpenCourseModal = (packageName: string, trainerName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCourseInfo({
      title: packageName,
      trainer: trainerName || 'مربی مسئول',
      schedule: 'طبق برنامه مصوب باشگاه',
      salon: 'سالن ورزشی اصلی'
    })
  }

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(item => {
      const matchesSearch =
        item.memberName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.packageName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.trainerName.toLowerCase().includes(searchQuery.toLowerCase().trim())

      let matchesDate = true
      const itemDate = new Date(item.startDate).getTime()
      
      if (startDateFilter && itemDate < startDateFilter.getTime()) {
        matchesDate = false
      }
      if (endDateFilter && itemDate > endDateFilter.getTime()) {
        matchesDate = false
      }

      return matchesSearch && matchesDate
    })
  }, [subscriptions, searchQuery, startDateFilter, endDateFilter])

  return (
    <div className="p-6 min-h-screen text-slate-800 dir-rtl font-semibold" data-role="ADMIN">
      <div className="p-6 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/60 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">وضعیت تسویه‌حساب و اشتراک شاگردان</h1>
          <p className="text-xs text-slate-600 mt-1">
            مدیریت وضعیت پرداخت‌ها و اشتراک اعضا بر اساس داده‌های سامانه
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200/60">
          <HiOutlineDocumentText className="w-4 h-4 text-slate-600" />
          <span>تعداد کل سوابق: {filteredSubscriptions.length} مورد</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 mb-6 shadow-2xs space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-3">
          <HiOutlineFilter className="w-4 h-4 text-blue-600" />
          <span>جستجو و فیلتر پیشرفته سوابق</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-600 font-medium block">جستجوی نام عضو یا پکیج:</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <HiOutlineSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 font-medium block">از تاریخ:</label>
            <DatePicker
              value={startDateFilter}
              onChange={setStartDateFilter}
              placeholder="انتخاب تاریخ شروع"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 font-medium block">تا تاریخ:</label>
            <DatePicker
              value={endDateFilter}
              onChange={setEndDateFilter}
              placeholder="انتخاب تاریخ پایان"
            />
          </div>
        </div>

        {(searchQuery || startDateFilter || endDateFilter) && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStartDateFilter(null)
                setEndDateFilter(null)
              }}
              className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
            >
              حذف فیلترها و پاک‌سازی جستجو
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 max-w-5xl mx-auto">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 text-center">
            <p className="text-slate-700 font-bold text-sm">در حال بارگذاری اطلاعات اشتراک‌ها...</p>
          </div>
        ) : filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((item) => {
            const isPending = item.status === 'PendingPayment'
            return (
              <Collapsible
                key={item.id}
                className="bg-white border border-slate-200/60 rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                <Collapsible.Trigger className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                      <HiOutlineUser className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.memberName}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">پکیج:</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleOpenCourseModal(item.packageName, item.trainerName, e)}
                            className="font-bold text-slate-700 hover:underline hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <HiOutlineAcademicCap className="w-3.5 h-3.5 text-blue-500" />
                            <span>{item.packageName}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-slate-600 text-[11px]">
                      مربی: <strong className="text-slate-900">{item.trainerName}</strong>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isPending ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                          تسویه شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          در انتظار پرداخت
                        </span>
                      )}

                      <div className="text-left font-mono text-xs text-slate-700">
                        جلسات: <strong>{item.remainingSessions}</strong> / {item.totalSessions}
                      </div>
                    </div>
                  </div>
                </Collapsible.Trigger>

                <Collapsible.Content className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                    
                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                      <span className="text-slate-500 font-medium block">شناسه اشتراک:</span>
                      <div className="flex items-center gap-1 font-bold font-mono text-slate-800">
                        <HiOutlineHashtag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.id}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                      <span className="text-slate-500 font-medium block">تاریخ شروع (شمسی):</span>
                      <div className="font-bold font-mono text-slate-800">
                        {formatToShamsi(item.startDate)}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                      <span className="text-slate-500 font-medium block">تاریخ پایان (شمسی):</span>
                      <div className="font-bold font-mono text-slate-800">
                        {formatToShamsi(item.endDate)}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-1">
                      <span className="text-slate-500 font-medium block">وضعیت فعلی:</span>
                      <div className="font-bold text-slate-800">
                        {item.status}
                      </div>
                    </div>

                  </div>

                  {isPending && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleApprovePayment(item.id, e)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                      >
                        <HiOutlineShieldCheck className="w-4 h-4" />
                        <span>تایید پرداختی و فعال‌سازی</span>
                      </button>
                    </div>
                  )}
                </Collapsible.Content>
              </Collapsible>
            )
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/60 text-center space-y-3">
            <p className="text-slate-700 font-bold text-sm">هیچ سابقه اشتراکی با این مشخصات یافت نشد.</p>
          </div>
        )}
      </div>

      {selectedCourseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <HiOutlineAcademicCap className="w-5 h-5 text-blue-600" />
                <span>جزئیات پکیج آموزشی</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseInfo(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">عنوان پکیج:</span>
                <span className="font-bold text-sm text-slate-900">{selectedCourseInfo.title}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">مربی مسئول:</span>
                  <span className="font-semibold text-slate-800">{selectedCourseInfo.trainer}</span>
                </div>
                
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCourseInfo(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-2xs text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState, useMemo, useRef } from 'react'
import {
  HiOutlineSearch,
  HiOutlineCreditCard,
  HiOutlineGlobeAlt,
  HiOutlineSwitchHorizontal,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineHashtag,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi'
import Select from '@/components/ui/Select'

// تایپ داده‌های تراکنش
interface PaymentTransaction {
  id: string
  courseTitle: string
  amount: string
  method: 'online' | 'cardToCard'
  status: 'success' | 'failed' | 'pending'
  dateTime: string
  gatewayName?: string
  refId?: string
  trackingCode?: string
  userCardNumber?: string
  paymentTime?: string
}

// تایپ گزینه‌های دراپ‌داون
interface OptionType {
  value: string
  label: string
}

// گزینه فیلتر روش پرداخت
const methodOptions: OptionType[] = [
  { value: 'all', label: 'همه روش‌ها' },
  { value: 'online', label: 'پرداخت آنلاین' },
  { value: 'cardToCard', label: 'کارت به کارت' },
]

// گزینه فیلتر وضعیت پرداخت
const statusOptions: OptionType[] = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'success', label: 'پرداخت موفق' },
  { value: 'pending', label: 'در حال بررسی' },
  { value: 'failed', label: 'ناموفق' },
]

// داده‌های نمونه تراکنش‌ها
const mockTransactions: PaymentTransaction[] = [
  {
    id: 'TX-1001',
    courseTitle: 'بدنسازی و آمادگی جسمانی (پیشرفته)',
    amount: '۱,۲۰۰,۰۰۰ تومان',
    method: 'online',
    status: 'success',
    dateTime: '۱۴۰۳/۰۵/۱۵ - ۱۴:۳۰',
    gatewayName: 'درگاه پرداخت سامان (سپ)',
    refId: '۹۸۷۶۵۴۳۲۱۰',
  },
  {
    id: 'TX-1002',
    courseTitle: 'یوگا و مدیتیشن (ترم تابستان)',
    amount: '۸۵۰,۰۰۰ تومان',
    method: 'cardToCard',
    status: 'pending',
    dateTime: '۱۴۰۳/۰۵/۱۴ - ۱۰:۱۵',
    trackingCode: '۶۵۴۳۲۱',
    userCardNumber: '۶۰۳۷****۱۲۳۴',
    paymentTime: '۱۴۰۳/۰۵/۱۴ - ۰۹:۴۵',
  },
  {
    id: 'TX-1003',
    courseTitle: 'کراس‌فیت آقایان',
    amount: '۱,۵۰۰,۰۰۰ تومان',
    method: 'online',
    status: 'failed',
    dateTime: '۱۴۰۳/۰۵/۱۰ - ۱۸:۲۰',
    gatewayName: 'درگاه پرداخت پارسیان',
    refId: '---',
  },
  {
    id: 'TX-1004',
    courseTitle: 'شنا تخصصی - سانس عصر',
    amount: '۲,۰۰۰,۰۰۰ تومان',
    method: 'cardToCard',
    status: 'success',
    dateTime: '۱۴۰۳/۰۵/۰۱ - ۱۱:۰۰',
    trackingCode: '۴۵۶۷۸۹',
    userCardNumber: '۵۸۹۲****۹۸۷۶',
    paymentTime: '۱۴۰۳/۰۵/۰۱ - ۱۰:۳۰',
  },
]

// تابع نرمال‌سازی حروف و اعداد جهت جستجوی دقیق‌تر
const normalizeText = (text: string = '') => {
  return text
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/ك/g, 'ک')
    .replace(/ي/g, 'ی')
    .toLowerCase()
}

export default function PaymentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<OptionType>(methodOptions[0])
  const [statusFilter, setStatusFilter] = useState<OptionType>(statusOptions[0])
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)

  // انطباق و فیلتر تراکنش‌ها
  const filteredTransactions = useMemo(() => {
    const query = normalizeText(searchTerm.trim())

    return mockTransactions.filter((tx) => {
      const titleMatch = normalizeText(tx.courseTitle).includes(query)
      const idMatch = normalizeText(tx.id).includes(query)
      const trackingMatch = tx.trackingCode && normalizeText(tx.trackingCode).includes(query)
      const refMatch = tx.refId && normalizeText(tx.refId).includes(query)

      const matchesSearch = !query || titleMatch || idMatch || trackingMatch || refMatch
      const matchesMethod = methodFilter.value === 'all' || tx.method === methodFilter.value
      const matchesStatus = statusFilter.value === 'all' || tx.status === statusFilter.value

      return matchesSearch && matchesMethod && matchesStatus
    })
  }, [searchTerm, methodFilter, statusFilter])

  const toggleExpand = (id: string) => {
    setExpandedTxId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="p-6 space-y-6 bg-[#F1FAEE] min-h-screen text-[#1D3557] dir-rtl max-w-5xl mx-auto">
      {/* هدر صفحه */}
      <div className="bg-white p-5 rounded-2xl border border-[#A8DADC] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#1D3557] flex items-center gap-2">
            <HiOutlineCreditCard className="w-6 h-6 text-[#E63946]" />
            تاریخچه پرداختی‌ها و تراکنش‌ها
          </h1>
          <p className="text-xs text-[#457B9D] mt-1">
            مشاهده سوابق پرداخت‌های آنلاین و کارت به کارت دوره‌های ورزشی
          </p>
        </div>
        <div className="bg-[#F1FAEE] px-4 py-2 rounded-xl border border-[#A8DADC] text-xs font-bold text-[#1D3557]">
          تعداد کل تراکنش‌ها: {mockTransactions.length} مورد
        </div>
      </div>

      {/* نوار جستجو و فیلترها با کامپوننت Select اختصاصی */}
      <div className="bg-white p-4 rounded-2xl border border-[#A8DADC] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          
          {/* باکس جستجو */}
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="جستجو با نام دوره، کد پیگیری..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F1FAEE] border border-[#A8DADC] rounded-xl pr-9 pl-3 py-2 text-xs text-[#1D3557] focus:outline-none focus:border-[#1D3557] h-10 transition-colors"
            />
            <HiOutlineSearch className="w-4 h-4 text-[#457B9D] absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* فیلتر روش پرداخت با کامپوننت Select اختصاصی */}
          <div className="w-full">
            <Select<OptionType>
              size="sm"
              placeholder="روش پرداخت"
              options={methodOptions}
              value={methodFilter}
              onChange={(option) => setMethodFilter(option as OptionType)}
            />
          </div>

          {/* فیلتر وضعیت پرداخت با کامپوننت Select اختصاصی */}
          <div className="w-full">
            <Select<OptionType>
              size="sm"
              placeholder="وضعیت پرداخت"
              options={statusOptions}
              value={statusFilter}
              onChange={(option) => setStatusFilter(option as OptionType)}
            />
          </div>

        </div>
      </div>

      {/* لیست تراکنش‌ها */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#A8DADC] text-center space-y-2">
            <HiOutlineDocumentText className="w-10 h-10 text-[#457B9D] mx-auto opacity-50" />
            <p className="text-xs font-bold text-[#1D3557]">تراکنشی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isExpanded = expandedTxId === tx.id

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-[#A8DADC] shadow-sm overflow-hidden transition-all"
              >
                {/* سطر اصلی کارت */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => e.key === 'Enter' && toggleExpand(tx.id)}
                  onClick={() => toggleExpand(tx.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F1FAEE]/50 transition-colors select-none"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1D3557] flex items-center gap-1">
                        <HiOutlineAcademicCap className="w-4 h-4 text-[#E63946]" />
                        {tx.courseTitle}
                      </span>
                      {/* نشانگر روش پرداخت */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1D3557]/10 text-[#1D3557] flex items-center gap-1">
                        {tx.method === 'online' ? (
                          <>
                            <HiOutlineGlobeAlt className="w-3 h-3" /> آنلاین
                          </>
                        ) : (
                          <>
                            <HiOutlineSwitchHorizontal className="w-3 h-3 text-[#E63946]" /> کارت به کارت
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-[#457B9D]">
                      <span className="flex items-center gap-1">
                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                        {tx.dateTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineHashtag className="w-3.5 h-3.5" />
                        شناسه: {tx.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#A8DADC]/40">
                    <div className="text-left dir-ltr">
                      <p className="text-xs font-bold text-[#1D3557]">{tx.amount}</p>

                      {/* نشانگر وضعیت */}
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {tx.status === 'success' && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> پرداخت موفق
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="text-[10px] font-bold text-[#E63946] flex items-center gap-0.5">
                            <HiOutlineXCircle className="w-3.5 h-3.5" /> ناموفق
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                            <HiOutlineClock className="w-3.5 h-3.5" /> در حال بررسی
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(tx.id)
                      }}
                      className="text-[#457B9D] hover:text-[#1D3557] p-1 transition-colors"
                      aria-label="Toggle Details"
                    >
                      {isExpanded ? (
                        <HiOutlineChevronUp className="w-5 h-5" />
                      ) : (
                        <HiOutlineChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* بخش کشویی جزئیات کامل پرداخت */}
                {isExpanded && (
                  <div className="bg-[#F1FAEE] p-4 border-t border-[#A8DADC] text-xs space-y-3">
                    <p className="font-bold text-[#1D3557] text-[11px]">جزئیات دقیق تراکنش:</p>

                    {tx.method === 'online' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <div>
                          <span className="text-[#457B9D] block text-[10px]">درگاه بانکی:</span>
                          <span className="font-semibold text-[#1D3557]">{tx.gatewayName || '---'}</span>
                        </div>
                        <div>
                          <span className="text-[#457B9D] block text-[10px]">شماره پیگیری درگاه:</span>
                          <span className="font-semibold text-[#1D3557] font-mono dir-ltr inline-block">{tx.refId || '---'}</span>
                        </div>
                        <div>
                          <span className="text-[#457B9D] block text-[10px]">نتیجه تراکنش:</span>
                          <span className={`font-semibold ${tx.status === 'success' ? 'text-emerald-600' : 'text-[#E63946]'}`}>
                            {tx.status === 'success' ? 'تایید شده و ثبت نهایی' : 'خطا در عملیات پرداخت'}
                          </span>
                        </div>
                      </div>
                    )}

                    {tx.method === 'cardToCard' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-[#A8DADC]/60">
                        <div>
                          <span className="text-[#457B9D] block text-[10px]">کد / شماره پیگیری واریز:</span>
                          <span className="font-semibold text-[#1D3557] font-mono">{tx.trackingCode || '---'}</span>
                        </div>
                        <div>
                          <span className="text-[#457B9D] block text-[10px]">شماره کارت واریزکننده:</span>
                          <span className="font-semibold text-[#1D3557] font-mono dir-ltr inline-block">{tx.userCardNumber || '---'}</span>
                        </div>
                        <div>
                          <span className="text-[#457B9D] block text-[10px]">تاریخ و ساعت دقیق واریز:</span>
                          <span className="font-semibold text-[#1D3557]">{tx.paymentTime || tx.dateTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
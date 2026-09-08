'use client'
import React, { useState, useMemo } from 'react'
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
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineUser,
} from 'react-icons/hi'
import Select from '@/components/ui/Select'

interface PaymentTransactionDTO {
  packageName: string
  trainerFirstName: string
  trainerLastName: string
  amount: number
  paymentMethod: 'Cash' | 'Online' | 'CardToCard' | string
  paidAt: string
  id?: string
  status?: 'success' | 'failed' | 'pending'
  gatewayName?: string
  refId?: string
  trackingCode?: string
  userCardNumber?: string
}

interface OptionType {
  value: string
  label: string
}

const methodOptions: OptionType[] = [
  { value: 'all', label: 'همه روش‌ها' },
  { value: 'Cash', label: 'نقدی (Cash)' },
  { value: 'Online', label: 'پرداخت آنلاین' },
  { value: 'CardToCard', label: 'کارت به کارت' },
]

const statusOptions: OptionType[] = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'success', label: 'پرداخت موفق' },
  { value: 'pending', label: 'در حال بررسی' },
  { value: 'failed', label: 'ناموفق' },
]

const mockTransactions: PaymentTransactionDTO[] = [
  {
    id: 'TX-1001',
    packageName: 'بدنسازی و آمادگی جسمانی (پیشرفته)',
    trainerFirstName: 'علی',
    trainerLastName: 'رضایی',
    amount: 1200000,
    paymentMethod: 'Online',
    paidAt: '2026-09-08T11:38:22.235Z',
    status: 'success',
    gatewayName: 'درگاه پرداخت سامان (سپ)',
    refId: '۹۸۷۶۵۴۳۲۱۰',
  },
  {
    id: 'TX-1002',
    packageName: 'یوگا و مدیتیشن (ترم تابستان)',
    trainerFirstName: 'سارا',
    trainerLastName: 'کریمی',
    amount: 850000,
    paymentMethod: 'CardToCard',
    paidAt: '2026-09-07T09:15:22.235Z',
    status: 'pending',
    trackingCode: '۶۵۴۳۲۱',
    userCardNumber: '۶۰۳۷****۱۲۳۴',
  },
  {
    id: 'TX-1003',
    packageName: 'کراس‌فیت آقایان',
    trainerFirstName: 'محمد',
    trainerLastName: 'احمدی',
    amount: 1500000,
    paymentMethod: 'Cash',
    paidAt: '2026-09-05T14:20:22.235Z',
    status: 'success',
  },
]

const normalizeText = (text: string = '') => {
  return text
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/ك/g, 'ک')
    .replace(/ي/g, 'ی')
    .toLowerCase()
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('fa-IR') + ' تومان'
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return dateString
  }
}

export default function PaymentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<OptionType>(methodOptions[0])
  const [statusFilter, setStatusFilter] = useState<OptionType>(statusOptions[0])
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)

  const filteredTransactions = useMemo(() => {
    const query = normalizeText(searchTerm.trim())
    return mockTransactions.filter((tx) => {
      const packageMatch = normalizeText(tx.packageName).includes(query)
      const trainerMatch = normalizeText(`${tx.trainerFirstName} ${tx.trainerLastName}`).includes(query)
      const idMatch = tx.id ? normalizeText(tx.id).includes(query) : false
      const trackingMatch = tx.trackingCode && normalizeText(tx.trackingCode).includes(query)
      const refMatch = tx.refId && normalizeText(tx.refId).includes(query)
      
      const matchesSearch = !query || packageMatch || trainerMatch || idMatch || trackingMatch || refMatch
      const matchesMethod = methodFilter.value === 'all' || tx.paymentMethod === methodFilter.value
      const matchesStatus = statusFilter.value === 'all' || (tx.status || 'success') === statusFilter.value

      return matchesSearch && matchesMethod && matchesStatus
    })
  }, [searchTerm, methodFilter, statusFilter])

  const toggleExpand = (id: string) => {
    setExpandedTxId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50/50 min-h-screen text-gray-900 dir-rtl w-full max-w-7xl mx-auto">
      {/* هدر صفحه */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <HiOutlineCreditCard className="w-7 h-7 text-[#E63946]" />
            تاریخچه پرداختی‌ها و تراکنش‌ها
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مشاهده سوابق پکیج‌ها، مربیان و وضعیت پرداخت‌ها
          </p>
        </div>
        <div className="bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700 self-start md:self-auto">
          تعداد کل تراکنش‌ها: {mockTransactions.length} مورد
        </div>
      </div>

      {/* نوار جستجو و فیلترها */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="جستجو با نام پکیج، نام مربی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400 focus:bg-white h-12 transition-all"
            />
            <HiOutlineSearch className="w-5 h-5 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
          <div className="w-full">
            <Select<OptionType>
              size="md"
              placeholder="روش پرداخت"
              options={methodOptions}
              value={methodFilter}
              onChange={(option) => setMethodFilter(option as OptionType)}
            />
          </div>
          <div className="w-full">
            <Select<OptionType>
              size="md"
              placeholder="وضعیت پرداخت"
              options={statusOptions}
              value={statusFilter}
              onChange={(option) => setStatusFilter(option as OptionType)}
            />
          </div>
        </div>
      </div>

      {/* لیست تراکنش‌ها با کارت‌های بزرگ‌تر و ریسپانسیو */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3 shadow-sm">
            <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mx-auto opacity-60" />
            <p className="text-sm font-bold text-gray-700">تراکنشی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          filteredTransactions.map((tx, index) => {
            const txId = tx.id || `tx-${index}`
            const isExpanded = expandedTxId === txId
            const txStatus = tx.status || 'success'

            return (
              <div
                key={txId}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => e.key === 'Enter' && toggleExpand(txId)}
                  onClick={() => toggleExpand(txId)}
                  className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:bg-gray-50/40 transition-colors select-none"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineAcademicCap className="w-5 h-5 text-[#E63946]" />
                        {tx.packageName}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-gray-100 text-gray-700 flex items-center gap-1.5">
                        {tx.paymentMethod === 'Online' ? (
                          <>
                            <HiOutlineGlobeAlt className="w-4 h-4 text-blue-600" /> آنلاین
                          </>
                        ) : tx.paymentMethod === 'CardToCard' ? (
                          <>
                            <HiOutlineSwitchHorizontal className="w-4 h-4 text-[#E63946]" /> کارت به کارت
                          </>
                        ) : (
                          <>
                            <HiOutlineCreditCard className="w-4 h-4 text-emerald-600" /> نقدی ({tx.paymentMethod})
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                        {formatDate(tx.paidAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineUser className="w-4 h-4 text-gray-400" />
                        مربی: <strong className="text-gray-800">{tx.trainerFirstName} {tx.trainerLastName}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                    <div className="text-left dir-ltr">
                      <p className="text-base font-extrabold text-gray-900">{formatCurrency(tx.amount)}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        {txStatus === 'success' && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <HiOutlineCheckCircle className="w-4 h-4" /> پرداخت موفق
                          </span>
                        )}
                        {txStatus === 'failed' && (
                          <span className="text-xs font-bold text-[#E63946] flex items-center gap-1">
                            <HiOutlineXCircle className="w-4 h-4" /> ناموفق
                          </span>
                        )}
                        {txStatus === 'pending' && (
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                            <HiOutlineClock className="w-4 h-4" /> در حال بررسی
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(txId)
                      }}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                      aria-label="Toggle Details"
                    >
                      {isExpanded ? (
                        <HiOutlineChevronUp className="w-6 h-6" />
                      ) : (
                        <HiOutlineChevronDown className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {/* بخش جزئیات کشویی */}
                {isExpanded && (
                  <div className="bg-gray-50/70 p-6 border-t border-gray-100 text-sm space-y-4">
                    <p className="font-bold text-gray-800 text-xs tracking-wide uppercase">جزئیات دقیق پکیج و پرداخت:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-gray-200/60 shadow-2xs">
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">نام پکیج:</span>
                        <span className="font-bold text-gray-800">{tx.packageName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">مربی مربوطه:</span>
                        <span className="font-bold text-gray-800">{tx.trainerFirstName} {tx.trainerLastName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">روش ثبت پرداخت:</span>
                        <span className="font-bold text-gray-800">{tx.paymentMethod}</span>
                      </div>
                    </div>
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
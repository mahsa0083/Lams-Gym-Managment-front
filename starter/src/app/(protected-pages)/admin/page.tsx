'use client'

import React, { useState } from 'react'
import {
  HiOutlineUserGroup as UserGroupIcon,
  HiOutlineCurrencyDollar as DollarIcon,
  HiOutlineCheckCircle as CheckIcon,
  HiOutlineExclamationCircle as AlertIcon,
  HiOutlineArrowUp as ArrowUpIcon,
  HiOutlineCreditCard as CreditCardIcon,
  HiOutlineClock as ClockIcon,
  HiOutlineXCircle as XCircleIcon,
} from 'react-icons/hi'

export default function AdminDashboardPage() {
  const stats = {
    totalRevenue: '۱۲۵,۴۰۰,۰۰۰ تومان',
    debtorsCount: 12,
    debtorsAmount: '۱۸,۵۰۰,۰۰۰ تومان',
    paidCount: 48,
    activeClassesCount: 8,
    trainersSalary: '۳۵,۰۰۰,۰۰۰ تومان',
    pendingCardPaymentsCount: 5,
    activeMembersCount: 142,
  }

  const [pendingPayments, setPendingPayments] = useState([
    {
      id: 101,
      name: 'مهدی علوی',
      course: 'کروس‌فیت پیشرفته',
      amount: '۲,۰۰۰,۰۰۰ تومان',
      trackingCode: '۶۵۴۹۸۷۱۲۳',
      date: 'امروز - ۱۰:۱۵',
      cardLast4: '۶۰۳۷',
      status: 'pending',
    },
    {
      id: 102,
      name: 'نرگس کریمی',
      course: 'پیلاتس بانوان',
      amount: '۱,۴۰۰,۰۰۰ تومان',
      trackingCode: '۹۸۷۶۵۴۳۲۱',
      date: 'امروز - ۱۱:۳۰',
      cardLast4: '۵۰۲۲',
      status: 'pending',
    },
    {
      id: 103,
      name: 'حسین کاظمی',
      course: 'بدنسازی سانس عصر',
      amount: '۱,۸۰۰,۰۰۰ تومان',
      trackingCode: '۱۲۳۴۵۶۷۸۹',
      date: 'دیروز - ۱۶:۴۰',
      cardLast4: '۶۲۲۱',
      status: 'pending',
    },
  ])

  const debtorsList = [
    { id: 1, name: 'علی محمدی', course: 'بدنسازی سانس عصر', amount: '۱,۵۰۰,۰۰۰ تومان', daysOverdue: 5 },
    { id: 2, name: 'رضا حسینی', course: 'کروس‌فیت پیشرفته', amount: '۲,۰۰۰,۰۰۰ تومان', daysOverdue: 8 },
    { id: 3, name: 'محمد امینی', course: 'فیتنس عمومی', amount: '۱,۲۰۰,۰۰۰ تومان', daysOverdue: 12 },
  ]

  const recentPayments = [
    { id: 1, name: 'سارا رضایی', course: 'یوگا بانوان', date: 'امروز - ۱۴:۲۰', amount: '۱,۸۰۰,۰۰۰ تومان', status: 'موفق' },
    { id: 2, name: 'امیر اکبری', course: 'بدنسازی صبح', date: 'دیروز - ۱۸:۴۵', amount: '۱,۵۰۰,۰۰۰ تومان', status: 'موفق' },
  ]

  const handleApprove = (id: number) => {
    setPendingPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    )
  }

  const handleReject = (id: number) => {
    setPendingPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
    )
  }

  return (
    <div className="min-h-screen bg-[var(--primary-subtle)] p-4 md:p-8 dir-rtl font-semibold text-[var(--primary)]">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--primary)]">
            داشبورد مدیریت باشگاه
          </h1>
          <p className="mt-1 text-sm text-[var(--primary-mild)]">
            خلاصه وضعیت مالی، تأیید واریزی‌ها و عملکرد باشگاه در ماه جاری
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--primary-subtle)] px-4 py-2 rounded-xl border border-[var(--primary-mild)]/40 text-[var(--primary)] text-xs font-bold">
          <span>ماه جاری: مرداد ۱۴۰۵</span>
        </div>
      </div>

      {/* ۱. کارت‌های آمار کلیدی (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        
        {/* کارت ۱: ورودی در انتظار تأیید کارت به کارت */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--primary-mild)]/40 hover:border-[var(--primary-deep)]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--primary-deep)]">تأیید کارت به کارت</span>
            <div className="w-10 h-10 bg-[var(--primary-subtle)] text-[var(--primary-deep)] rounded-xl flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary)]">
              {stats.pendingCardPaymentsCount} فیش منتظر
            </div>
            <div className="text-[11px] text-[var(--primary-deep)] font-medium mt-1">
              نیازمند بررسی و تأیید
            </div>
          </div>
        </div>

        {/* کارت ۲: کل ورودی ماه */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--primary-mild)]/40 hover:border-[var(--primary-deep)]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--primary-mild)]">کل ورودی ماه</span>
            <div className="w-10 h-10 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl flex items-center justify-center">
              <DollarIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary)]">{stats.totalRevenue}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <ArrowUpIcon className="w-3 h-3" />
              <span>۱۲٪ رشد نسبت به ماه قبل</span>
            </div>
          </div>
        </div>

        {/* کارت ۳: بدهکاران */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--primary-mild)]/40 hover:border-[var(--primary-deep)]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--primary-deep)]">بدهکاران شهریه</span>
            <div className="w-10 h-10 bg-[var(--primary-subtle)] text-[var(--primary-deep)] rounded-xl flex items-center justify-center">
              <AlertIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary-deep)]">{stats.debtorsCount} نفر</div>
            <div className="text-[11px] text-[var(--primary-mild)] font-medium mt-1">
              مجموع: {stats.debtorsAmount}
            </div>
          </div>
        </div>

        {/* کارت ۴: ورزشکاران فعال */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--primary-mild)]/40 hover:border-[var(--primary-deep)]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--primary-mild)]">ورزشکاران فعال</span>
            <div className="w-10 h-10 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary)]">{stats.activeMembersCount} نفر</div>
            <div className="text-[11px] text-[var(--primary-mild)] font-medium mt-1">
              دارای ثبت‌نام فعال
            </div>
          </div>
        </div>

      </div>

      {/* ۲. بخش فیش‌های واریزی در انتظار تأیید */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/40">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[var(--primary)] flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-[var(--primary-deep)]" />
              فیش‌های واریزی در انتظار تأیید (کارت به کارت)
            </h2>
            <span className="text-xs font-bold bg-[var(--primary-subtle)] text-[var(--primary)] px-2.5 py-1 rounded-lg">
              {pendingPayments.filter(p => p.status === 'pending').length} مورد جدید
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPayments.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--primary-subtle)]/30 p-4 rounded-xl border border-[var(--primary-mild)]/30 hover:border-[var(--primary-deep)]/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex justify-between items-start border-b border-[var(--primary-mild)]/20 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--primary)]">{item.name}</h3>
                    <p className="text-xs text-[var(--primary-mild)] mt-0.5">{item.course}</p>
                  </div>
                  <span className="text-xs font-black text-[var(--primary)] bg-white px-2 py-1 rounded-lg border border-[var(--primary-mild)]/20">
                    {item.amount}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--primary-mild)]">کد پیگیری:</span>
                    <span className="font-mono font-bold text-[var(--primary)]">{item.trackingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--primary-mild)]">کارت واریزی:</span>
                    <span className="font-mono text-[var(--primary)]">{item.cardLast4}****</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[var(--primary-mild)] pt-1">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                  </div>
                </div>

                {/* دکمه‌های اقدام ادمین */}
                <div className="pt-2 border-t border-[var(--primary-mild)]/20">
                  {item.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
                      >
                        <CheckIcon className="w-4 h-4" />
                        تأیید فیش
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex-1 bg-[var(--text-war)] hover:opacity-90 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        رد فیش
                      </button>
                    </div>
                  ) : item.status === 'approved' ? (
                    <div className="bg-emerald-100 text-emerald-700 text-xs font-bold py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1">
                      <CheckIcon className="w-4 h-4" />
                      واریزی تأیید شد
                    </div>
                  ) : (
                    <div className="bg-rose-100 text-[var(--primary-deep)] text-xs font-bold py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      فیش رد شد
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ۳. بخش جداول بدهکاران و پرداخت‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* لیست بدهکاران */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--primary)] flex items-center gap-2">
              <AlertIcon className="w-5 h-5 text-[var(--primary-deep)]" />
              لیست افراد بدهکار
            </h2>
            <button className="text-xs font-bold text-[var(--primary-mild)] hover:text-[var(--primary)] transition-colors">
              مشاهده همه
            </button>
          </div>

          <div className="space-y-3">
            {debtorsList.map((debtor) => (
              <div 
                key={debtor.id}
                className="flex items-center justify-between p-3.5 bg-[var(--primary-subtle)]/40 rounded-xl border border-[var(--primary-mild)]/20"
              >
                <div>
                  <div className="text-sm font-bold text-[var(--primary)]">{debtor.name}</div>
                  <div className="text-xs text-[var(--primary-mild)] mt-0.5">{debtor.course}</div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-[var(--primary-deep)]">{debtor.amount}</div>
                  <div className="text-[10px] text-[var(--primary-deep)] font-medium mt-0.5">
                    {debtor.daysOverdue} روز تأخیر
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* آخرین پرداخت‌ها */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--primary)] flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-emerald-600" />
              آخرین ثبت‌نام‌ها و پرداخت‌های مستقیم
            </h2>
            <button className="text-xs font-bold text-[var(--primary-mild)] hover:text-[var(--primary)] transition-colors">
              مشاهده همه
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-3.5 bg-[var(--primary-subtle)]/40 rounded-xl border border-[var(--primary-mild)]/20"
              >
                <div>
                  <div className="text-sm font-bold text-[var(--primary)]">{payment.name}</div>
                  <div className="text-xs text-[var(--primary-mild)] mt-0.5">{payment.course} • {payment.date}</div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-emerald-600">{payment.amount}</div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-md mt-0.5">
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
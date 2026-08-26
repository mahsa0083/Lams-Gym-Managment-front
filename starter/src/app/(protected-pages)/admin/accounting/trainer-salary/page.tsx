'use client';

import React, { useState } from 'react';
import DatePicker from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import {
  HiOutlineCalculator,
  HiOutlineCheckCircle,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const trainerOptions = [
  { value: '1', label: 'علی محمدی (بدنسازی)' },
  { value: '2', label: 'سارا رضایی (کروس‌فیت)' },
];
// مدل‌های منطبق با DTO بک‌اند
export enum TrainerSalaryStatus {
  Draft = 'Draft',
  Calculated = 'Calculated',
  Approved = 'Approved',
  Paid = 'Paid',
}

export interface TrainerSalaryStatementItemDto {
  id?: number;
  title: string;
  amount: number;
  description?: string;
}

export interface TrainerSalaryStatementDetailsDto {
  id: number;
  trainerId: number;
  trainerName: string;
  periodStart: string;
  periodEnd: string;
  fixedSalaryAmount: number;
  commissionAmount: number;
  amount: number;
  status: TrainerSalaryStatus;
  calculatedAt: string;
  approvedAt?: string | null;
  paidAt?: string | null;
  description?: string | null;
  items: TrainerSalaryStatementItemDto[];
}

export default function TrainerSalaryPage() {
  // استیت‌های ورودی
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // استیت‌های صورت‌حساب و دیالوگ‌ها
  const [statement, setStatement] = useState<TrainerSalaryStatementDetailsDto | null>(null);
  const [selectedStatementForModal, setSelectedStatementForModal] = useState<TrainerSalaryStatementDetailsDto | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const trainerOptions = [
    { value: '1', label: 'علی محمدی (بدنسازی)' },
    { value: '2', label: 'سارا رضایی (کروس‌فیت)' },
  ];

  // محاسبه و شبیه‌سازی دریافت DTO کامل
  const handleCalculate = () => {
    if (!selectedTrainer || !startDate || !endDate) {
      setDialogConfig({
        isOpen: true,
        title: 'خطای ورودی',
        message: 'لطفاً مربی و بازه زمانی مشخصی را برای محاسبه انتخاب کنید.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const fixed = 15000000;
      const commission = 5400000;
      const total = fixed + commission;

      const mockData: TrainerSalaryStatementDetailsDto = {
        id: Math.floor(Math.random() * 1000) + 100,
        trainerId: Number(selectedTrainer),
        trainerName: selectedTrainer === '1' ? 'علی محمدی' : 'سارا رضایی',
        periodStart: startDate,
        periodEnd: endDate,
        fixedSalaryAmount: fixed,
        commissionAmount: commission,
        amount: total,
        status: TrainerSalaryStatus.Calculated,
        calculatedAt: new Date().toISOString(),
        approvedAt: null,
        paidAt: null,
        description: 'محاسبه سیستم بر اساس سانس‌های برگزارشده و پورسانت ثبت‌نامی‌ها',
        items: [
          { id: 1, title: 'حقوق پایه و سانس‌های برگزارشده', amount: fixed, description: '۱۸ جلسه کلاس برگزارشده' },
          { id: 2, title: 'درصد از ثبت‌نام شاگردان (۳۰٪)', amount: commission, description: 'مربوط به ۴۲ شاگرد جدید' },
        ],
      };

      setStatement(mockData);
      setLoading(false);
    }, 800);
  };

  // تأیید و صدور سند
  const handleIssueStatement = () => {
    if (!statement) return;

    setDialogConfig({
      isOpen: true,
      title: 'تأیید و صدور سند تسویه',
      message: `آیا از صدور نهایی سند حقوق ${statement.trainerName} به مبلغ ${statement.amount.toLocaleString()} تومان اطمینان دارید؟`,
      type: 'info',
      onConfirm: () => {
        setStatement((prev) =>
          prev
            ? {
                ...prev,
                status: TrainerSalaryStatus.Approved,
                approvedAt: new Date().toISOString(),
              }
            : null
        );
        setDialogConfig({
          isOpen: true,
          title: 'صدور موفق',
          message: 'سند حقوق مربی با موفقیت ثبت و تأیید گردید.',
          type: 'success',
        });
      },
    });
  };

  const getStatusBadge = (status: TrainerSalaryStatus) => {
    switch (status) {
      case TrainerSalaryStatus.Paid:
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold">پرداخت شده</span>;
      case TrainerSalaryStatus.Approved:
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg text-xs font-bold">تأیید شده</span>;
      case TrainerSalaryStatus.Calculated:
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold">محاسبه شده (پیش‌نویس)</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">نامشخص</span>;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 dir-rtl font-semibold space-y-6 bg-slate-50/50">
      {/* هدر صفحه */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1D3557]">مدیریت و تسویه حقوق مربیان</h1>
        <p className="text-sm text-[#457B9D] mt-1">
          محاسبه کارکرد، صادرکردن فاکتور حقوق و تسویه‌حساب با مربیان در بازه زمانی مشخص
        </p>
      </div>

      {/* ۱. فیلتر و محاسبه حقوق */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40 space-y-4">
        <h2 className="text-base font-bold text-[#1D3557] flex items-center gap-2">
          <HiOutlineCalculator className="w-5 h-5 text-[#E63946]" />
          <span>فیلتر و محاسبه حقوق</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1D3557] mb-2">انتخاب مربی</label>
            <Select
  options={trainerOptions}
  value={selectedTrainer}
  onChange={(val: any) => setSelectedTrainer(typeof val === 'object' ? val?.value : val)}
  placeholder="-- یک مربی انتخاب کنید --"
/>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D3557] mb-2">از تاریخ (شروع دوره)</label>
            <DatePicker
              value={startDate as any}
              onChange={(date: any) => setStartDate(typeof date === 'string' ? date : date?.format?.('YYYY/MM/DD') || '')}
              placeholder="۱۳۷۸/۰۷/۰۵"
              {...({ calendarPosition: 'bottom-right', fixMainPosition: true } as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#457B9D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D3557] mb-2">تا تاریخ (پایان دوره)</label>
            <DatePicker
              value={endDate as any}
              onChange={(date: any) => setEndDate(typeof date === 'string' ? date : date?.format?.('YYYY/MM/DD') || '')}
              placeholder="۱۳۷۸/۰۷/۰۵"
              {...({ calendarPosition: 'bottom-right', fixMainPosition: true } as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#457B9D]"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-2 bg-[#1D3557] hover:bg-[#1D3557]/90 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all"
        >
          {loading ? 'در حال محاسبه...' : 'محاسبه حقوق و کارکرد'}
        </button>
      </div>

      {/* ۲. کارت پیش‌نمایش سند حقوق صادر شده */}
      {statement && (
        <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-emerald-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#1D3557] text-lg">
                  صورت‌حساب حقوق: {statement.trainerName}
                </h3>
                {getStatusBadge(statement.status)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                بازه زمانی: {statement.periodStart} تا {statement.periodEnd}
              </p>
            </div>
            <div className="text-left">
              <span className="text-xs text-emerald-800 block">مبلغ نهایی (قابل پرداخت):</span>
              <span className="text-xl font-black text-emerald-600">
                {statement.amount.toLocaleString()} تومان
              </span>
            </div>
          </div>

          {/* خلاصه محاسبات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center text-sm">
              <span className="text-gray-600">حقوق ثابت (Fixed Salary):</span>
              <span className="font-bold text-[#1D3557]">{statement.fixedSalaryAmount.toLocaleString()} تومان</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center text-sm">
              <span className="text-gray-600">پورسانت (Commission):</span>
              <span className="font-bold text-[#1D3557]">{statement.commissionAmount.toLocaleString()} تومان</span>
            </div>
          </div>

          {/* ریز آیتم‌های سند */}
          <div className="space-y-2 bg-white p-4 rounded-xl border border-emerald-100">
            <span className="text-xs font-bold text-[#1D3557] block mb-2">جزئیات ریز آیتم‌ها (Items):</span>
            {statement.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1.5 border-b last:border-none border-gray-100">
                <div>
                  <span className="text-gray-800 font-medium">{item.title}</span>
                  {item.description && <span className="text-xs text-gray-400 block">{item.description}</span>}
                </div>
                <span className="font-bold text-[#1D3557]">{item.amount.toLocaleString()} تومان</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleIssueStatement}
              disabled={statement.status === TrainerSalaryStatus.Approved}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              <span>{statement.status === TrainerSalaryStatus.Approved ? 'سند تأیید شده است' : 'تأیید و صدور سند تسویه‌حساب'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ۳. تاریخچه پرداختی‌ها */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40 space-y-4">
        <h2 className="text-base font-bold text-[#1D3557]">تاریخچه اسناد حقوق مربیان</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#A8DADC]/20 text-[#1D3557] text-xs font-bold">
              <tr>
                <th className="p-3 rounded-r-xl">مربی</th>
                <th className="p-3">بازه زمانی</th>
                <th className="p-3">مبلغ پرداختی</th>
                <th className="p-3">تاریخ محاسبه</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3 rounded-l-xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 font-semibold text-[#1D3557]">علی محمدی</td>
                <td className="p-3 text-xs text-gray-500">۱۴۰۵/۰۴/۰۱ تا ۱۴۰۵/۰۴/۳۱</td>
                <td className="p-3 font-bold text-emerald-600">۱۸,۵۰۰,۰۰۰ تومان</td>
                <td className="p-3 text-xs text-gray-500">۱۴۰۵/۰۵/۰۲</td>
                <td className="p-3">{getStatusBadge(TrainerSalaryStatus.Paid)}</td>
                <td className="p-3">
                  <button
                    onClick={() =>
                      setSelectedStatementForModal({
                        id: 101,
                        trainerId: 1,
                        trainerName: 'علی محمدی',
                        periodStart: '۱۴۰۵/۰۴/۰۱',
                        periodEnd: '۱۴۰۵/۰۴/۳۱',
                        fixedSalaryAmount: 15000000,
                        commissionAmount: 3500000,
                        amount: 18500000,
                        status: TrainerSalaryStatus.Paid,
                        calculatedAt: '۱۴۰۵/۰۵/۰۲',
                        approvedAt: '۱۴۰۵/۰۵/۰۳',
                        paidAt: '۱۴۰۵/۰۵/۰۴',
                        description: 'تسویه کامل حقوق تیرماه',
                        items: [
                          { title: 'حقوق ثابت', amount: 15000000 },
                          { title: 'پورسانت شاگردان', amount: 3500000 },
                        ],
                      })
                    }
                    className="text-[#457B9D] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                    <span>مشاهده جزئیات</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* دیالوگ عمومی هشدار/موفقیت (جایگزین alert) */}
      {dialogConfig.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3">
              {dialogConfig.type === 'warning' ? (
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                  <HiOutlineExclamation className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                  <HiOutlineCheckCircle className="w-6 h-6" />
                </div>
              )}
              <h3 className="font-bold text-base text-[#1D3557]">{dialogConfig.title}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{dialogConfig.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                  setDialogConfig((prev) => ({ ...prev, isOpen: false }));
                }}
                className="bg-[#1D3557] text-white text-xs font-bold py-2 px-5 rounded-xl hover:bg-[#1D3557]/90"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال مشاهده کامل جزئیات سند حقوق (TrainerSalaryStatementDetailsDto) */}
      {selectedStatementForModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <HiOutlineDocumentText className="w-5 h-5 text-[#457B9D]" />
                <h3 className="font-extrabold text-[#1D3557] text-base">
                  جزئیات کامل سند #{selectedStatementForModal.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStatementForModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-500">مربی:</span>{' '}
                  <span className="font-bold text-[#1D3557]">{selectedStatementForModal.trainerName}</span>
                </div>
                <div>
                  <span className="text-gray-500">وضعیت:</span> {getStatusBadge(selectedStatementForModal.status)}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">دوره:</span> {selectedStatementForModal.periodStart} تا {selectedStatementForModal.periodEnd}
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-gray-100 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">مبلغ حقوق ثابت:</span>
                  <span className="font-bold text-[#1D3557]">{selectedStatementForModal.fixedSalaryAmount.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">مبلغ پورسانت:</span>
                  <span className="font-bold text-[#1D3557]">{selectedStatementForModal.commissionAmount.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
                  <span className="font-extrabold text-[#1D3557]">جمع کل سند (Amount):</span>
                  <span className="font-black text-emerald-600">{selectedStatementForModal.amount.toLocaleString()} تومان</span>
                </div>
              </div>

              {/* ریز آیتم‌ها */}
              <div>
                <span className="font-bold text-[#1D3557] block mb-1.5">ریز آیتم‌ها (Items):</span>
                <div className="space-y-1.5">
                  {selectedStatementForModal.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded-lg flex justify-between">
                      <span>{item.title}</span>
                      <span className="font-bold">{item.amount.toLocaleString()} تومان</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* تاریخ‌ها */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-gray-500 text-[11px]">
                <div>تاریخ محاسبه: {selectedStatementForModal.calculatedAt}</div>
                <div>تاریخ تأیید: {selectedStatementForModal.approvedAt || 'ثبت نشده'}</div>
                <div>تاریخ پرداخت: {selectedStatementForModal.paidAt || 'پرداخت نشده'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStatementForModal(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-xl text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
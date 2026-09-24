'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from '@/components/ui/DatePicker';
import ApiService from '@/services/client/ApiService';
import {
  HiOutlineCalculator,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineEye,
  HiOutlineDocumentText,
  HiOutlineCash,
} from 'react-icons/hi';

export enum TrainerSalaryStatus {
  Draft = 'Draft',
  Calculated = 'Calculated',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Paid = 'Paid',
}

export interface TrainerSalaryStatementItemDto {
  id?: number;
  gymClassId?: number;
  classTitle: string;
  packageId?: number;
  packageName?: string;
  studentCount: number;
  packagePrice?: number;
  totalRevenue?: number;
  commissionPercentage: number;
  commissionAmount: number;
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
  items?: TrainerSalaryStatementItemDto[];
}

export default function TrainerSalaryPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // لیست صورت‌حساب‌های محاسبه‌شده
  const [calculatedStatements, setCalculatedStatements] = useState<TrainerSalaryStatementDetailsDto[]>([]);
  // سوابق کلی صورت‌حساب‌ها
  const [statementsHistory, setStatementsHistory] = useState<TrainerSalaryStatementDetailsDto[]>([]);
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

  // تبدیل تاریخ میلادی دریافتی از API به شمسی برای نمایش در UI
  const formatToPersianDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '-';
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } catch {
      return typeof dateInput === 'string' ? dateInput : '-';
    }
  };

  // تبدیل تاریخ انتخاب شده در DatePicker به فرمت میلادی دقیق (YYYY-MM-DD) برای ارسال به API
  const formatToGregorianDate = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // دریافت سوابق صورت‌حساب‌ها از API با پارامترهای تاریخ میلادی
  const fetchSalaryHistory = async (startGregorian?: string, endGregorian?: string) => {
    try {
      setTableLoading(true);
      const params: Record<string, string> = {};
      if (startGregorian) params.startDate = startGregorian;
      if (endGregorian) params.endDate = endGregorian;

      const response = await ApiService.get<TrainerSalaryStatementDetailsDto[]>('/TrainerSalary/statements', { params });
      if (response && Array.isArray(response)) {
        setStatementsHistory(response);
      }
    } catch (error) {
      console.error('Error fetching salary history:', error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryHistory();
  }, []);

  // محاسبه حقوق تمام مربیان و ارسال تاریخ‌ها به صورت میلادی به API
  const handleCalculate = async () => {
    if (!startDate || !endDate) {
      setDialogConfig({
        isOpen: true,
        title: 'خطای ورودی',
        message: 'لطفاً بازه زمانی مشخصی را برای محاسبه انتخاب کنید.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    // تبدیل قطعی به تاریخ میلادی YYYY-MM-DD
    const startGregorian = formatToGregorianDate(startDate);
    const endGregorian = formatToGregorianDate(endDate);

    try {
      const payload = {
        periodStart: startGregorian,
        periodEnd: endGregorian,
      };

      const result = await ApiService.post<TrainerSalaryStatementDetailsDto[]>('/TrainerSalary/calculate', payload);
      if (result && Array.isArray(result)) {
        setCalculatedStatements(result);
        fetchSalaryHistory(startGregorian, endGregorian);
      }
    } catch (error: any) {
      console.error('Error calculating salary:', error);
      const errorMessage = error?.response?.data?.detail || 'محاسبه حقوق با خطا مواجه شد. لطفاً دوباره تلاش کنید.';
      setDialogConfig({
        isOpen: true,
        title: error?.response?.data?.title || 'خطا در محاسبه',
        message: errorMessage,
        type: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  // تأیید یا رد صورت‌حساب
  const handleApproveOrRejectStatement = (statementId: number, isApproved: boolean) => {
    const actionText = isApproved ? 'تأیید' : 'رد';
    setDialogConfig({
      isOpen: true,
      title: `${actionText} سند تسویه`,
      message: `آیا از ${actionText} این صورت‌حساب حقوق اطمینان دارید؟`,
      type: 'info',
      onConfirm: async () => {
        try {
          await ApiService.put(`/TrainerSalary/${statementId}/approve`, {
            isApproved: isApproved,
          });

          // به‌روزرسانی در استیت
          setCalculatedStatements((prev) =>
            prev.map((item) =>
              item.id === statementId
                ? {
                    ...item,
                    status: isApproved ? TrainerSalaryStatus.Approved : TrainerSalaryStatus.Rejected,
                    approvedAt: isApproved ? new Date().toISOString() : null,
                  }
                : item
            )
          );

          const startGregorian = startDate ? formatToGregorianDate(startDate) : undefined;
          const endGregorian = endDate ? formatToGregorianDate(endDate) : undefined;
          fetchSalaryHistory(startGregorian, endGregorian);

          setDialogConfig({
            isOpen: true,
            title: `${actionText} موفق`,
            message: `سند حقوق با موفقیت ${actionText} گردید.`,
            type: 'success',
          });
        } catch (error: any) {
          console.error(`Error ${actionText} statement:`, error);
          const errorMessage = error?.response?.data?.detail || `عملیات ${actionText} با خطا مواجه شد.`;
          setDialogConfig({
            isOpen: true,
            title: error?.response?.data?.title || 'خطا',
            message: errorMessage,
            type: 'warning',
          });
        }
      },
    });
  };

  // پرداخت صورت‌حساب
  const handlePayStatement = (statementId: number) => {
    setDialogConfig({
      isOpen: true,
      title: 'پرداخت حقوق مربی',
      message: 'آیا از انجام پرداخت این صورت‌حساب اطمینان دارید؟',
      type: 'info',
      onConfirm: async () => {
        try {
          await ApiService.post(`/TrainerSalary/${statementId}/pay`, {});
          const startGregorian = startDate ? formatToGregorianDate(startDate) : undefined;
          const endGregorian = endDate ? formatToGregorianDate(endDate) : undefined;
          fetchSalaryHistory(startGregorian, endGregorian);

          setCalculatedStatements((prev) =>
            prev.map((item) =>
              item.id === statementId
                ? { ...item, status: TrainerSalaryStatus.Paid, paidAt: new Date().toISOString() }
                : item
            )
          );
          if (selectedStatementForModal && selectedStatementForModal.id === statementId) {
            setSelectedStatementForModal((prev) =>
              prev ? { ...prev, status: TrainerSalaryStatus.Paid, paidAt: new Date().toISOString() } : null
            );
          }
          setDialogConfig({
            isOpen: true,
            title: 'پرداخت موفق',
            message: 'حقوق مربی با موفقیت پرداخت شد.',
            type: 'success',
          });
        } catch (error: any) {
          console.error('Error paying statement:', error);
          const errorMessage = error?.response?.data?.detail || 'پرداخت حقوق با خطا مواجه شد.';
          setDialogConfig({
            isOpen: true,
            title: error?.response?.data?.title || 'خطا',
            message: errorMessage,
            type: 'warning',
          });
        }
      },
    });
  };

  const getStatusBadge = (status: TrainerSalaryStatus) => {
    switch (status) {
      case TrainerSalaryStatus.Paid:
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold">پرداخت شده</span>;
      case TrainerSalaryStatus.Approved:
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg text-xs font-bold">تأیید شده</span>;
      case TrainerSalaryStatus.Rejected:
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-lg text-xs font-bold">رد شده</span>;
      case TrainerSalaryStatus.Calculated:
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold">محاسبه شده (پیش‌نویس)</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">نامشخص</span>;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 dir-rtl font-semibold space-y-6 bg-slate-50/50">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1D3557]">مدیریت و تسویه حقوق مربیان</h1>
        <p className="text-sm text-[#457B9D] mt-1">
          محاسبه سراسری کارکرد، صادرکردن فاکتور حقوق و تسویه‌حساب با مربیان در بازه زمانی مشخص
        </p>
      </div>

      {/* فرم فیلتر و بازه زمانی */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40 space-y-4">
        <h2 className="text-base font-bold text-[#1D3557] flex items-center gap-2">
          <HiOutlineCalculator className="w-5 h-5 text-[#E63946]" />
          <span>بازه زمانی محاسبه حقوق</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1D3557] mb-2">از تاریخ (شروع دوره)</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="انتخاب تاریخ شروع"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D3557] mb-2">تا تاریخ (پایان دوره)</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="انتخاب تاریخ پایان"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-2 bg-[#1D3557] hover:bg-[#1D3557]/90 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer"
        >
          {loading ? 'در حال محاسبه...' : 'محاسبه حقوق تمام مربیان'}
        </button>
      </div>

      {/* کارت‌های صورت‌حساب‌های محاسبه‌شده (همراه با اکشن Hover تایید و رد) */}
      {calculatedStatements.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#1D3557]">نتایج محاسبه اخیر ({calculatedStatements.length} مربی)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculatedStatements.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* دکمه‌های تایید و رد در حالت Hover */}
                {item.status === TrainerSalaryStatus.Calculated && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-white/95 p-1 rounded-xl shadow-md border border-gray-100 backdrop-blur-xs">
                    <button
                      title="تأیید صورت‌حساب"
                      onClick={() => handleApproveOrRejectStatement(item.id, true)}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all cursor-pointer"
                    >
                      <HiOutlineCheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      title="رد صورت‌حساب"
                      onClick={() => handleApproveOrRejectStatement(item.id, false)}
                      className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all cursor-pointer"
                    >
                      <HiOutlineXCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#1D3557] text-base">{item.trainerName}</h3>
                      {/* نمایش تاریخ‌ها به صورت شمسی */}
                      <span className="text-[11px] text-gray-400 font-medium">
                        {formatToPersianDate(item.periodStart)} تا {formatToPersianDate(item.periodEnd)}
                      </span>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-gray-500 block text-[11px]">حقوق ثابت:</span>
                      <span className="font-semibold text-slate-700">{item.fixedSalaryAmount.toLocaleString()} تومان</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">پورسانت:</span>
                      <span className="font-semibold text-slate-700">{item.commissionAmount.toLocaleString()} تومان</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-500 font-bold">مبلغ نهایی:</span>
                    <span className="text-base font-black text-emerald-600">{item.amount.toLocaleString()} تومان</span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedStatementForModal(item)}
                    className="text-xs text-[#457B9D] hover:text-[#1D3557] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                    <span>مشاهده جزئیات</span>
                  </button>

                  {item.status === TrainerSalaryStatus.Approved && (
                    <button
                      onClick={() => handlePayStatement(item.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <HiOutlineCash className="w-4 h-4" />
                      <span>پرداخت</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* جدول تاریخچه و کلیه صورت‌حساب‌ها */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A8DADC]/40 space-y-4">
        <h2 className="text-base font-bold text-[#1D3557]">کلیه اسناد حقوق و صورت‌حساب‌ها</h2>
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
              {tableLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 text-xs">در حال بارگذاری تاریخچه...</td>
                </tr>
              ) : statementsHistory.length > 0 ? (
                statementsHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-[#1D3557]">{item.trainerName}</td>
                    {/* نمایش بازه به شمسی */}
                    <td className="p-3 text-xs text-gray-500">
                      {formatToPersianDate(item.periodStart)} تا {formatToPersianDate(item.periodEnd)}
                    </td>
                    <td className="p-3 font-bold text-emerald-600">{item.amount.toLocaleString()} تومان</td>
                    {/* نمایش تاریخ محاسبه به شمسی */}
                    <td className="p-3 text-xs text-gray-500">{formatToPersianDate(item.calculatedAt)}</td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedStatementForModal(item)}
                        className="text-[#457B9D] hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        <span>جزئیات</span>
                      </button>

                      {item.status === TrainerSalaryStatus.Calculated && (
                        <div className="flex items-center gap-1 mr-2">
                          <button
                            onClick={() => handleApproveOrRejectStatement(item.id, true)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-bold px-2 py-1 bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            تأیید
                          </button>
                          <button
                            onClick={() => handleApproveOrRejectStatement(item.id, false)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-bold px-2 py-1 bg-rose-50 rounded-lg cursor-pointer"
                          >
                            رد
                          </button>
                        </div>
                      )}

                      {item.status === TrainerSalaryStatus.Approved && (
                        <button
                          onClick={() => handlePayStatement(item.id)}
                          className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer mr-2"
                        >
                          <HiOutlineCash className="w-4 h-4" />
                          <span>پرداخت</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 text-xs">هیچ سابقه حقوقی ثبت نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مدال پیام‌ها و تاییدیه‌ها */}
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
              {dialogConfig.onConfirm && (
                <button
                  onClick={() => {
                    if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-emerald-700 cursor-pointer"
                >
                  تأیید
                </button>
              )}
              <button
                onClick={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
                className="bg-gray-100 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl hover:bg-gray-200 cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مدال مشاهده جزئیات صورت‌حساب */}
      {selectedStatementForModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <HiOutlineDocumentText className="w-5 h-5 text-[#457B9D]" />
                <h3 className="font-extrabold text-[#1D3557] text-base">
                  جزئیات کامل صورت‌حساب #{selectedStatementForModal.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStatementForModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-500">مربی:</span>{' '}
                  <span className="font-bold text-[#1D3557]">{selectedStatementForModal.trainerName}</span>
                </div>
                <div>
                  <span className="text-gray-500">وضعیت:</span> {getStatusBadge(selectedStatementForModal.status)}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">دوره:</span> {formatToPersianDate(selectedStatementForModal.periodStart)} تا {formatToPersianDate(selectedStatementForModal.periodEnd)}
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
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="font-extrabold text-[#1D3557]">جمع کل سند (قابل پرداخت):</span>
                  <span className="font-black text-emerald-600">{selectedStatementForModal.amount.toLocaleString()} تومان</span>
                </div>
              </div>

              {selectedStatementForModal.items && selectedStatementForModal.items.length > 0 && (
                <div>
                  <span className="font-bold text-[#1D3557] block mb-2">ریز دوره‌ها و پورسانت‌ها:</span>
                  <div className="space-y-2">
                    {selectedStatementForModal.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{item.classTitle} {item.packageName ? `(${item.packageName})` : ''}</span>
                          <span className="text-emerald-600">{item.commissionAmount.toLocaleString()} تومان</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                          <span>تعداد هنرآموز: {item.studentCount} نفر</span>
                          <span>درصد پورسانت: %{item.commissionPercentage}</span>
                          {item.totalRevenue ? <span>کل درآمد: {item.totalRevenue.toLocaleString()} تومان</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* نمایش تاریخ‌های وضعیت به شمسی */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-gray-500 text-[11px]">
                <div>تاریخ محاسبه: {formatToPersianDate(selectedStatementForModal.calculatedAt)}</div>
                <div>تاریخ تأیید: {selectedStatementForModal.approvedAt ? formatToPersianDate(selectedStatementForModal.approvedAt) : 'ثبت نشده'}</div>
                <div>تاریخ پرداخت: {selectedStatementForModal.paidAt ? formatToPersianDate(selectedStatementForModal.paidAt) : 'پرداخت نشده'}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                {selectedStatementForModal.status === TrainerSalaryStatus.Calculated && (
                  <>
                    <button
                      onClick={() => {
                        const id = selectedStatementForModal.id;
                        setSelectedStatementForModal(null);
                        handleApproveOrRejectStatement(id, true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <HiOutlineCheckCircle className="w-4 h-4" />
                      <span>تأیید صورت‌حساب</span>
                    </button>
                    <button
                      onClick={() => {
                        const id = selectedStatementForModal.id;
                        setSelectedStatementForModal(null);
                        handleApproveOrRejectStatement(id, false);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <HiOutlineXCircle className="w-4 h-4" />
                      <span>رد صورت‌حساب</span>
                    </button>
                  </>
                )}

                {selectedStatementForModal.status === TrainerSalaryStatus.Approved && (
                  <button
                    onClick={() => handlePayStatement(selectedStatementForModal.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <HiOutlineCash className="w-4 h-4" />
                    <span>پرداخت حقوق</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedStatementForModal(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-xl text-xs cursor-pointer mr-auto"
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

'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import ApiService from '@/services/client/ApiService';
import {
  HiOutlineCalculator,
  HiOutlineCheckCircle,
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

export interface TrainerDto {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  specialty?: string;
}

export default function TrainerSalaryPage() {
  const [trainerOptions, setTrainerOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [statement, setStatement] = useState<TrainerSalaryStatementDetailsDto | null>(null);
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

  const convertToPersianDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await ApiService.get<TrainerDto[]>('/trainers');
      if (response && Array.isArray(response)) {
        const options = response.map((trainer) => {
          const fullName = trainer.fullName || 
                           (trainer.name ? trainer.name : `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim()) || 
                           `مربی شماره ${trainer.id}`;
          return {
            value: trainer.id.toString(),
            label: trainer.specialty ? `${fullName} (${trainer.specialty})` : fullName,
          };
        });
        setTrainerOptions(options);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  const fetchSalaryHistory = async () => {
    try {
      setTableLoading(true);
      const response = await ApiService.get<TrainerSalaryStatementDetailsDto[]>('/TrainerSalary/statements');
      if (response && Array.isArray(response)) {
        const formattedHistory = response.map(item => ({
          ...item,
          periodStart: convertToPersianDate(item.periodStart),
          periodEnd: convertToPersianDate(item.periodEnd),
          calculatedAt: convertToPersianDate(item.calculatedAt),
        }));
        setStatementsHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error fetching salary history:', error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
    fetchSalaryHistory();
  }, []);

  const formatGregorianDateToString = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return `${year}-${month}-${day}`;
  };

  const handleCalculate = async () => {
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
    try {
      const payload = {
        trainerId: Number(selectedTrainer),
        periodStart: formatGregorianDateToString(startDate),
        periodEnd: formatGregorianDateToString(endDate),
      };

      const result = await ApiService.post<TrainerSalaryStatementDetailsDto>('/TrainerSalary/calculate', payload);
      if (result) {
        setStatement({
          ...result,
          periodStart: convertToPersianDate(result.periodStart),
          periodEnd: convertToPersianDate(result.periodEnd),
          calculatedAt: convertToPersianDate(result.calculatedAt),
        });
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

  const handleIssueStatement = () => {
    if (!statement) return;

    setDialogConfig({
      isOpen: true,
      title: 'تأیید و صدور سند تسویه',
      message: `آیا از صدور نهایی سند حقوق ${statement.trainerName} به مبلغ ${statement.amount.toLocaleString()} تومان اطمینان دارید؟`,
      type: 'info',
      onConfirm: async () => {
        try {
          await ApiService.put(`/TrainerSalary/${statement.id}/approve`, {});
          setStatement((prev) =>
            prev
              ? {
                  ...prev,
                  status: TrainerSalaryStatus.Approved,
                  approvedAt: new Date().toISOString(),
                }
              : null
          );
          fetchSalaryHistory();
          setDialogConfig({
            isOpen: true,
            title: 'صدور موفق',
            message: 'سند حقوق مربی با موفقیت ثبت و تأیید گردید.',
            type: 'success',
          });
        } catch (error: any) {
          console.error('Error approving statement:', error);
          const errorMessage = error?.response?.data?.detail || 'تأیید سند با خطا مواجه شد.';
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

  const handlePayStatement = (statementId: number) => {
    setDialogConfig({
      isOpen: true,
      title: 'پرداخت حقوق مربی',
      message: 'آیا از انجام پرداخت این صورت‌حساب اطمینان دارید؟',
      type: 'info',
      onConfirm: async () => {
        try {
          await ApiService.post(`/TrainerSalary/${statementId}/pay`, {});
          fetchSalaryHistory();
          if (statement && statement.id === statementId) {
            setStatement((prev) => prev ? { ...prev, status: TrainerSalaryStatus.Paid, paidAt: new Date().toISOString() } : null);
          }
          if (selectedStatementForModal && selectedStatementForModal.id === statementId) {
            setSelectedStatementForModal((prev) => prev ? { ...prev, status: TrainerSalaryStatus.Paid, paidAt: new Date().toISOString() } : null);
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
          محاسبه کارکرد، صادرکردن فاکتور حقوق و تسویه‌حساب با مربیان در بازه زمانی مشخص
        </p>
      </div>

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
              value={trainerOptions.find(opt => opt.value === selectedTrainer) || selectedTrainer}
              onChange={(val: any) => setSelectedTrainer(typeof val === 'object' ? val?.value : val)}
              placeholder="-- یک مربی انتخاب کنید --"
            />
          </div>

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
          {loading ? 'در حال محاسبه...' : 'محاسبه حقوق و کارکرد'}
        </button>
      </div>

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
            {statement.status === TrainerSalaryStatus.Calculated && (
              <button
                onClick={handleIssueStatement}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HiOutlineCheckCircle className="w-4 h-4" />
                <span>تأیید و صدور سند تسویه‌حساب</span>
              </button>
            )}
            {statement.status === TrainerSalaryStatus.Approved && (
              <button
                onClick={() => handlePayStatement(statement.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HiOutlineCash className="w-4 h-4" />
                <span>پرداخت حقوق</span>
              </button>
            )}
          </div>
        </div>
      )}

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
              {tableLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 text-xs">در حال بارگذاری تاریخچه...</td>
                </tr>
              ) : statementsHistory.length > 0 ? (
                statementsHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-semibold text-[#1D3557]">{item.trainerName}</td>
                    <td className="p-3 text-xs text-gray-500">{item.periodStart} تا {item.periodEnd}</td>
                    <td className="p-3 font-bold text-emerald-600">{item.amount.toLocaleString()} تومان</td>
                    <td className="p-3 text-xs text-gray-500">{item.calculatedAt}</td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                    <td className="p-3 flex items-center gap-3">
                      <button
                        onClick={() => setSelectedStatementForModal(item)}
                        className="text-[#457B9D] hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        <span>جزئیات</span>
                      </button>
                      {item.status === TrainerSalaryStatus.Approved && (
                        <button
                          onClick={() => handlePayStatement(item.id)}
                          className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
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

              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-gray-500 text-[11px]">
                <div>تاریخ محاسبه: {selectedStatementForModal.calculatedAt}</div>
                <div>تاریخ تأیید: {selectedStatementForModal.approvedAt ? convertToPersianDate(selectedStatementForModal.approvedAt) : 'ثبت نشده'}</div>
                <div>تاریخ پرداخت: {selectedStatementForModal.paidAt ? convertToPersianDate(selectedStatementForModal.paidAt) : 'پرداخت نشده'}</div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              {selectedStatementForModal.status === TrainerSalaryStatus.Approved && (
                <button
                  onClick={() => handlePayStatement(selectedStatementForModal.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <HiOutlineCash className="w-4 h-4" />
                  <span>پرداخت حقوق</span>
                </button>
              )}
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
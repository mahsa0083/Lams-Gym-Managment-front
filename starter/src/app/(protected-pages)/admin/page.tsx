"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  HiOutlineArrowUp,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";

import ApiService from "@/services/client/ApiService";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/Payment/admin/card-to-card/pending
 */
interface PendingPaymentItem {
  paymentId: number;
  subscriptionId: number;
  amount: number;
  status: string;
  cardLastFourDigits: string;
  transferDateTime: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
}

/**
 * وضعیت پردازش کلاینتی هر فیش واریزی
 */
type ActionStatus = "pending" | "approved" | "rejected";

interface CardPaymentUiItem extends PendingPaymentItem {
  actionStatus: ActionStatus;
}

interface ErrorDialogState {
  isOpen: boolean;
  title: string;
  message: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const ENDPOINTS = {
  ACTIVE_MEMBERS: "members/CountMember",
  MONTHLY_ENTRY: "admins/Entry",
  PENDING_PAYMENTS: "Payments/admin/card-to-card/pending",
  APPROVE_PAYMENT: (id: number) =>
    `Payments/admin/card-to-card/${id}/approve`,
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const formatCurrency = (amount: number): string => {
  return `${new Intl.NumberFormat("fa-IR").format(amount)} تومان`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("fa-IR").format(value);
};

const formatPersianDateTime = (isoDate: string): string => {
  if (!isoDate) return "ثبت نشده";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
};

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export default function AdminDashboardPage() {
  /* ------------------------------------------------------------------------ */
  /*                                  States                                  */
  /* ------------------------------------------------------------------------ */

  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);
  const [monthlyEntry, setMonthlyEntry] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<CardPaymentUiItem[]>(
    []
  );

  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
  //   isOpen: false,
  //   title: "",
  //   message: "",
  // });

  /* ------------------------------------------------------------------------ */
  /*                              Error handling                              */
  /* ------------------------------------------------------------------------ */

  const showError = useCallback((title: string, error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "عملیات موردنظر با خطا مواجه شد. لطفاً دوباره تلاش کنید.";

    // setErrorDialog({
    //   isOpen: true,
    //   title,
    //   message,
    // });
  }, []);

  // const closeErrorDialog = () => {
  //   setErrorDialog((prev) => ({
  //     ...prev,
  //     isOpen: false,
  //   }));
  // };

  /* ------------------------------------------------------------------------ */
  /*                               API Calls                                  */
  /* ------------------------------------------------------------------------ */

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);

      const [membersCountResponse, entryResponse] = await Promise.all([
        ApiService.get<number>(ENDPOINTS.ACTIVE_MEMBERS),
        ApiService.get<number>(ENDPOINTS.MONTHLY_ENTRY),
      ]);

      setActiveMembersCount(membersCountResponse ?? 0);
      setMonthlyEntry(entryResponse ?? 0);
    } catch (error) {
      showError("خطا در دریافت آمار داشبورد", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [showError]);

  const fetchPendingPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);

      const response = await ApiService.get<PendingPaymentItem[]>(
        ENDPOINTS.PENDING_PAYMENTS
      );

      const formattedData: CardPaymentUiItem[] = Array.isArray(response)
        ? response.map((item) => ({ ...item, actionStatus: "pending" }))
        : [];

      setPendingPayments(formattedData);
    } catch (error) {
      setPendingPayments([]);
      showError("خطا در دریافت لیست پرداخت‌های کارت به کارت", error);
    } finally {
      setIsLoadingPayments(false);
    }
  }, [showError]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchPendingPayments()]);
  }, [fetchStats, fetchPendingPayments]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* ------------------------------------------------------------------------ */
  /*                               Actions                                    */
  /* ------------------------------------------------------------------------ */

  const handleApprovePayment = async (paymentId: number) => {
    try {
      setActionLoadingId(paymentId);

      await ApiService.put(ENDPOINTS.APPROVE_PAYMENT(paymentId));

      setPendingPayments((prev) =>
        prev.map((item) =>
          item.paymentId === paymentId
            ? { ...item, actionStatus: "approved" }
            : item
        )
      );
    } catch (error) {
      showError("خطا در تأیید فیش واریزی", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPayment = (paymentId: number) => {
    setPendingPayments((prev) =>
      prev.map((item) =>
        item.paymentId === paymentId
          ? { ...item, actionStatus: "rejected" }
          : item
      )
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                               Memos                                      */
  /* ------------------------------------------------------------------------ */

  const currentPersianMonth = useMemo(() => {
    return new Intl.DateTimeFormat("fa-IR", {
      calendar: "persian",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const pendingCount = useMemo(() => {
    return pendingPayments.filter((p) => p.actionStatus === "pending").length;
  }, [pendingPayments]);

  /* ------------------------------------------------------------------------ */
  /*                                    UI                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--primary)] md:text-3xl">
            داشبورد مدیریت باشگاه
          </h1>
          <p className="mt-1 text-sm text-[var(--primary-mild)]">
            خلاصه وضعیت مالی، تأیید واریزی‌ها و عملکرد باشگاه در ماه جاری
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)] px-4 py-2 text-xs font-bold text-[var(--primary)]">
          <span>ماه جاری: {currentPersianMonth}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Pending Receipts */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--primary-mild)]/40 bg-white p-5 shadow-sm transition hover:border-[var(--primary-deep)]/50">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--primary-deep)]">
              تأیید کارت به کارت
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary-deep)]">
              <HiOutlineCreditCard className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary)]">
              {isLoadingPayments
                ? "..."
                : `${formatNumber(pendingCount)} فیش منتظر`}
            </div>
            <div className="mt-1 text-[11px] font-medium text-[var(--primary-deep)]">
              نیازمند بررسی و تأیید
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Entry */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--primary-mild)]/40 bg-white p-5 shadow-sm transition hover:border-[var(--primary-deep)]/50">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--primary-mild)]">
              کل ورودی ماه
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
              <HiOutlineCurrencyDollar className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary)]">
              {isLoadingStats
                ? "در حال دریافت..."
                : formatCurrency(monthlyEntry)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <HiOutlineArrowUp className="h-3 w-3" />
              <span>محاسبه شده بر اساس فیش‌های تایید شده</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Members */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--primary-mild)]/40 bg-white p-5 shadow-sm transition hover:border-[var(--primary-deep)]/50">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--primary-mild)]">
              ورزشکاران فعال
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
              <HiOutlineUserGroup className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[var(--primary)]">
              {isLoadingStats
                ? "در حال دریافت..."
                : `${formatNumber(activeMembersCount)} نفر`}
            </div>
            <div className="mt-1 text-[11px] font-medium text-[var(--primary-mild)]">
              دارای ثبت‌نام فعال
            </div>
          </div>
        </div>
      </div>

      {/* Pending Card Payments Section */}
      <div className="mb-8 rounded-2xl border border-[var(--primary-mild)]/40 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--primary)]">
            <HiOutlineCreditCard className="h-5 w-5 text-[var(--primary-deep)]" />
            فیش‌های واریزی در انتظار تأیید (کارت به کارت)
          </h2>

          <button
            type="button"
            onClick={fetchPendingPayments}
            disabled={isLoadingPayments}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineRefresh
              className={`h-4 w-4 ${isLoadingPayments ? "animate-spin" : ""}`}
            />
            به‌روزرسانی
          </button>
        </div>

        {/* Loading */}
        {isLoadingPayments && (
          <div className="rounded-xl border border-dashed border-[var(--primary-mild)]/30 p-8 text-center text-sm text-[var(--primary-mild)]">
            در حال دریافت اطلاعات فیش‌های واریزی...
          </div>
        )}

        {/* Payment Cards Grid */}
        {!isLoadingPayments && (
          <div>
            {pendingPayments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingPayments.map((item) => (
                  <div
                    key={item.paymentId}
                    className="flex flex-col justify-between space-y-3 rounded-xl border border-[var(--primary-mild)]/30 bg-[var(--primary-subtle)]/30 p-4 transition hover:border-[var(--primary-deep)]/40"
                  >
                    <div className="flex items-start justify-between border-b border-[var(--primary-mild)]/20 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--primary)]">
                          {item.firstName} {item.lastName}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--primary-mild)]" dir="ltr">
                          کد ملی: {item.nationalCode}
                        </p>
                      </div>

                      <span className="rounded-lg border border-[var(--primary-mild)]/20 bg-white px-2.5 py-1 text-xs font-black text-[var(--primary)] shadow-xs">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[var(--primary-mild)]">
                          کارت واریزی:
                        </span>
                        <span className="font-mono font-bold text-[var(--primary)]" dir="ltr">
                          **** {item.cardLastFourDigits}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--primary-mild)]">
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="h-3.5 w-3.5" />
                          {formatPersianDateTime(item.transferDateTime)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-[var(--primary-mild)]/20 pt-2">
                      {item.actionStatus === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actionLoadingId === item.paymentId}
                            onClick={() => handleApprovePayment(item.paymentId)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <HiOutlineCheckCircle className="h-4 w-4" />
                            {actionLoadingId === item.paymentId
                              ? "در حال ثبت..."
                              : "تأیید فیش"}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === item.paymentId}
                            onClick={() => handleRejectPayment(item.paymentId)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <HiOutlineXCircle className="h-4 w-4" />
                            رد فیش
                          </button>
                        </div>
                      ) : item.actionStatus === "approved" ? (
                        <div className="flex items-center justify-center gap-1 rounded-lg bg-emerald-100 py-1.5 text-xs font-bold text-emerald-700">
                          <HiOutlineCheckCircle className="h-4 w-4" />
                          واریزی تأیید شد
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 rounded-lg bg-rose-100 py-1.5 text-xs font-bold text-rose-700">
                          <HiOutlineXCircle className="h-4 w-4" />
                          فیش رد شد
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--primary-mild)]/30 p-8 text-center text-xs text-[var(--primary-mild)]">
                هیچ فیش واریزی در انتظار تأییدی یافت نشد.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Central Error Dialog */}
      {/* {errorDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <HiOutlineExclamationCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-black text-[var(--primary)]">
              {errorDialog.title}
            </h2>

            <p className="mt-2 text-sm leading-7 text-[var(--primary-deep)]">
              {errorDialog.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeErrorDialog}
                className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--sidebar-text)] transition hover:opacity-90"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
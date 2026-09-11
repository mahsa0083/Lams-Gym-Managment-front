'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

// ساختار استاندارد ProblemDetails در ASP.NET Core
export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

interface ErrorContextType {
  showError: (error: ApiErrorResponse | any) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// متغیر پل ارتباطی بین Axios Interceptor و React Context
let globalShowError: ((error: any) => void) | null = null;

// تابعی که در اینترسپتور axios صدا زده می‌شود
export const triggerGlobalError = (error: any) => {
  if (globalShowError) {
    globalShowError(error);
  } else {
    console.warn('ErrorProvider هنوز mount نشده است، اما خطایی رخ داد:', error);
  }
};

// نگاشت کد وضعیت HTTP به عنوان فارسی مناسب
const getFriendlyTitle = (status?: number, defaultTitle?: string): string => {
  switch (status) {
    case 400:
      return 'درخواست نامعتبر';
    case 401:
      return 'عدم دسترسی (لطفاً مجدداً وارد شوید)';
    case 403:
      return 'دسترسی غیرمجاز';
    case 404:
      return 'اطلاعات مورد نظر یافت نشد';
    case 409:
      return 'تداخل در عملیات';
    case 500:
      return 'خطای داخلی سرور';
    default:
      return defaultTitle || 'خطایی رخ داده است';
  }
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorData, setErrorData] = useState<ApiErrorResponse | null>(null);

  const showError = useCallback((error: ApiErrorResponse | any) => {
    // استخراج خطا از پاسخ Axios در صورتی که آبجکت axios error پاس داده شود
    const responseData: ApiErrorResponse = error?.response?.data || error;

    setErrorData({
      status: responseData?.status || error?.response?.status || 500,
      title: responseData?.title || 'خطای سرور',
      detail:
        responseData?.detail ||
        error?.message ||
        'مشکلی در برقراری ارتباط رخ داده است.',
      instance: responseData?.instance,
      errors: responseData?.errors,
    });
    setIsOpen(true);
  }, []);

  const clearError = useCallback(() => {
    setIsOpen(false);
    setErrorData(null);
  }, []);

  // متصل کردن نمایش ارور به متغیر سراسری
  useEffect(() => {
    globalShowError = showError;
    return () => {
      globalShowError = null;
    };
  }, [showError]);

  const friendlyTitle = getFriendlyTitle(errorData?.status, errorData?.title);

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}

      {/* دیالوگ خطای سراسری */}
      <Dialog
        isOpen={isOpen}
        onClose={clearError}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={true}
      >
        <div className="dir-rtl text-right p-1">
          {/* بخش عنوان و کد خطا */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex items-center gap-2 text-red-600">
              <HiOutlineExclamationCircle className="w-6 h-6 shrink-0" />
              <h5 className="font-bold text-gray-800 text-base">{friendlyTitle}</h5>
            </div>

            {/* نمایش کد وضعیت خطا (Status Code Badge) */}
            {errorData?.status && (
              <span className="bg-red-50 text-red-700 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-red-200">
                کد {errorData.status}
              </span>
            )}
          </div>

          {/* پیام اصلی ارور (detail دریافتی از بک‌اند) */}
          <div className="text-gray-700 text-sm leading-relaxed mb-4">
            {errorData?.detail}
          </div>

          {/* اعتبارسنجی فیلدها (ModelState Errors) */}
          {errorData?.errors && Object.keys(errorData.errors).length > 0 && (
            <ul className="list-disc list-inside text-xs text-red-500 mb-4 space-y-1 bg-red-50 p-3 rounded-xl border border-red-100">
              {Object.entries(errorData.errors).map(([field, messages]) =>
                messages.map((msg, idx) => (
                  <li key={`${field}-${idx}`}>{msg}</li>
                ))
              )}
            </ul>
          )}

          {/* فوتر و دکمه تایید */}
          <div className="text-left mt-6 pt-3 border-t">
            <Button
              variant="solid"
              className="bg-[#1D3557] hover:bg-[#152741] text-white px-6"
              onClick={clearError}
            >
              متوجه شدم
            </Button>
          </div>
        </div>
      </Dialog>
    </ErrorContext.Provider>
  );
};

// هوک اختصاصی برای استفاده اختیاری در صفحات
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

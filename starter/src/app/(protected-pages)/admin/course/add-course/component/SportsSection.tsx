'use client';

import React, { useState, useEffect } from 'react';
import  ApiService  from '@/services/client/ApiService';
import Dialog from '@/components/ui/Dialog';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineSparkles,
  HiOutlineDocumentText
} from 'react-icons/hi';

// اینترفیس مدل ورزش بر اساس Swagger
export interface SportItem {
  id: number;
  name: string;
  description: string;
}

// تابع کمکی برای استخراج آرایه از انواع ساختارهای پاسخ API
const getArrayFromResponse = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.items && Array.isArray(res.items)) return res.items;
  return [];
};

export default function SportsSection() {
  const [sports, setSports] = useState<SportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // استیت فرم
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [editingSport, setEditingSport] = useState<SportItem | null>(null);

  // استیت مدال حذف
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // دریافت لیست ورزش‌ها (GET /api/sports)
  const fetchSports = async () => {
    try {
      setLoading(true);
      const res = await ApiService.get('/sports');
      const sportsList = getArrayFromResponse(res);
      setSports(sportsList);
    } catch (error) {
      console.error('خطا در دریافت لیست ورزش‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  // پاک‌سازی فرم
  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingSport(null);
  };

  // دریافت اطلاعات ورزش بر اساس شناسه و تنظیم در فرم (GET /api/sports/{id})
 const handleSelectForEdit = async (sport: SportItem) => {
    try {
      const res = await ApiService.get<any>(`/sports/${sport.id}`);
      const rawData = (res as any)?.data ?? res ?? sport;
      const data: SportItem = {
        id: rawData.id ?? sport.id,
        name: rawData.name ?? sport.name,
        description: rawData.description ?? sport.description ?? ''
      };
      
      setEditingSport(data);
      setName(data.name || '');
      setDescription(data.description || '');
    } catch (error) {
      console.error('خطا در دریافت جزئیات ورزش:', error);
      // Fallback به دیتای فعلی در صورت بروز خطا در دریافت تکی
      setEditingSport(sport);
      setName(sport.name || '');
      setDescription(sport.description || '');
    }
  };

  // ارسال فرم (ثبت یا ویرایش)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim()
    };

    setSubmitting(true);
    try {
      if (editingSport) {
        // ویرایش ورزش (PUT /api/sports/{id})
        await ApiService.put(`/sports/${editingSport.id}`, payload);
      } else {
        // ایجاد ورزش جدید (POST /api/sports)
        await ApiService.post('/sports', payload);
      }
      resetForm();
      await fetchSports();
    } catch (error) {
      console.error('خطا در ثبت اطلاعات ورزش:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // باز کردن دیالوگ حذف
  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // تأیید حذف (DELETE /api/sports/{id})
  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await ApiService.delete(`/sports/${deleteId}`);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
      if (editingSport?.id === deleteId) {
        resetForm();
      }
      await fetchSports();
    } catch (error) {
      console.error('خطا در حذف ورزش:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* دیالوگ تأیید حذف */}
            {/* دیالوگ تأیید حذف */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteId(null);
        }}
        width={400}
      >
        <div className="space-y-4 p-2 text-center">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <HiOutlineExclamation className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--primary)] mb-1">
              حذف رشته ورزشی
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              آیا از حذف این رشته ورزشی اطمینان دارید؟ با حذف آن ممکن است پکیج‌ها و کلاس‌های متصل به آن تحت تأثیر قرار گیرند.
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteId(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-sm"
            >
              حذف شود
            </button>
          </div>
        </div>
      </Dialog>


      {/* فرم ایجاد / ویرایش رشته ورزشی */}
      <div className="bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm h-fit">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {editingSport ? (
              <HiOutlinePencil className="text-[var(--primary)] text-lg" />
            ) : (
              <HiOutlinePlus className="text-[var(--primary)] text-lg" />
            )}
            <h2 className="text-sm font-bold text-[var(--primary)]">
              {editingSport ? 'ویرایش رشته ورزشی' : 'افزودن رشته ورزشی جدید'}
            </h2>
          </div>
          {editingSport && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition"
            >
              <HiOutlineX className="text-xs" />
              انصراف
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[var(--primary)]">
              نام ورزش <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: بدنسازی، کراس‌فیت، پیلاتس"
              className="w-full h-9 px-3 border border-gray-200 rounded-xl bg-[var(--primary-subtle)]/30 focus:border-[var(--primary)] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--primary)]">
              توضیحات
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحاتی در مورد این رشته ورزشی، ویژگی‌ها یا شرایط آن بنویسید..."
              className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--primary-subtle)]/30 focus:border-[var(--primary)] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full h-10 mt-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {editingSport ? (
              <>
                <HiOutlinePencil className="text-base" />
                <span>{submitting ? 'در حال ویرایش...' : 'ذخیره تغییرات'}</span>
              </>
            ) : (
              <>
                <HiOutlinePlus className="text-base" />
                <span>{submitting ? 'در حال ثبت...' : 'افزودن ورزش'}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* لیست رشته‌های ورزشی */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="text-[var(--primary)] text-lg" />
            <h3 className="text-sm font-bold text-[var(--primary)]">لیست رشته‌های ورزشی</h3>
          </div>
          <span className="text-xs bg-[var(--primary-subtle)] text-[var(--primary)] px-2.5 py-1 rounded-full font-medium">
            تعداد: {sports.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-[var(--primary-mild)]/20">
            <div className="text-xs text-gray-500 animate-pulse">در حال بارگذاری اطلاعات...</div>
          </div>
        ) : sports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
            <HiOutlineDocumentText className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-500">هیچ رشته ورزشی ثبت نشده است</p>
            <p className="text-[11px] text-gray-400 mt-1">از فرم کنار برای ایجاد اولین رشته ورزشی استفاده کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sports.map((sport) => {
              const isSelected = editingSport?.id === sport.id;
              return (
                <div
                  key={sport.id}
                  className={`bg-white p-4 rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20'
                      : 'border-[var(--primary-mild)]/30 hover:border-[var(--primary-mild)]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-800">{sport.name}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSelectForEdit(sport)}
                          title="ویرایش"
                          className="p-1.5 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] rounded-lg transition"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(sport.id)}
                          title="حذف"
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                      {sport.description || (
                        <span className="text-gray-300 italic">بدون توضیحات</span>
                      )}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>شناسه: #{sport.id}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectForEdit(sport)}
                      className="text-[var(--primary)] hover:underline font-medium"
                    >
                      ویرایش مشخصات
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

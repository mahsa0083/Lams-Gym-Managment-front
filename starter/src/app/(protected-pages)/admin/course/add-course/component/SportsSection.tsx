'use client'

import React, { useState, useEffect } from 'react'
import ApiService from '@/services/client/ApiService'
import Dialog from '@/components/ui/Dialog'
import { Sport } from '@/@types/gym'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineExclamation, HiOutlineX } from 'react-icons/hi'

export default function SportsSection() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // وضعیت ویرایش
  const [editingSport, setEditingSport] = useState<Sport | null>(null)

  // مقادیر فرم
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // مدیریت دیالوگ حذف
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // ۱. دریافت لیست ورزش‌ها از API
  const fetchSports = async () => {
    setLoading(true)
    try {
      const data = await ApiService.get<Sport[]>('/sports')
      setSports(data || [])
    } catch (error) {
      console.error('خطا در دریافت لیست ورزش‌ها:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSports()
  }, [])

  // بازنشانی فرم به حالت ایجاد جدید
  const resetForm = () => {
    setEditingSport(null)
    setName('')
    setDescription('')
  }

  // انتخاب یک رشته برای ویرایش
  const handleSelectForEdit = (sport: Sport) => {
    setEditingSport(sport)
    setName(sport.name)
    setDescription(sport.description || '')
  }

  // ۲. ارسال فرم (ثبت یا ویرایش)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (editingSport) {
        await ApiService.put(`/sports/${editingSport.id}`, { name, description })
      } else {
        await ApiService.post('/sports', { name, description })
      }
      resetForm()
      fetchSports()
    } catch (error) {
      console.error('خطا در ذخیره‌سازی ورزش:', error)
    }
  }

  // ۳. مدیریت حذف
  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await ApiService.delete(`/sports/${deleteId}`)
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
      fetchSports()
    } catch (error) {
      console.error('خطا در حذف ورزش:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* فرم ثبت / ویرایش ورزش جدید */}
      <div className="bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            {editingSport ? (
              <>
                <HiOutlinePencil className="w-5 h-5 text-blue-600" />
                ویرایش رشته ورزشی
              </>
            ) : (
              <>
                <HiOutlinePlus className="w-5 h-5" />
                افزودن رشته ورزشی جدید
              </>
            )}
          </h3>
          {editingSport && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg"
            >
              <HiOutlineX className="w-3.5 h-3.5" />
              انصراف
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">نام رشته ورزشی *</label>
            <input
              type="text"
              required
              placeholder="مثلاً: بدنسازی، دو و میدانی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2  rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">توضیحات</label>
            <textarea
              placeholder="توضیحات مختصر درباره رشته..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2  rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
            >
              {editingSport ? 'بروزرسانی رشته' : 'ثبت رشته ورزشی'}
            </button>
          </div>
        </form>
      </div>

      {/* جدول نمایش لیست ورزش‌ها */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--primary)] mb-4">لیست رشته‌های ورزشی موجود</h3>
        {loading ? (
          <p className="text-xs text-gray-500 py-4 text-center">در حال دریافت اطلاعات...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b bg-[var(--primary-subtle)]/50 text-[var(--primary)]">
                  <th className="p-3">شناسه</th>
                  <th className="p-3">نام رشته</th>
                  <th className="p-3">توضیحات</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {sports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                      هیچ رشته ورزشی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  sports.map((sport) => (
                    <tr
                      key={sport.id}
                      className={`border-b transition-colors ${
                        editingSport?.id === sport.id
                          ? 'bg-blue-50/60'
                          : 'hover:bg-[var(--primary-subtle)]/20'
                      }`}
                    >
                      <td className="p-3 font-mono text-gray-500">{sport.id}</td>
                      <td className="p-3 font-bold text-[var(--primary)]">{sport.name}</td>
                      <td className="p-3 text-gray-500">{sport.description || '-'}</td>
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleSelectForEdit(sport)}
                          title="ویرایش"
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(sport.id)}
                          title="حذف"
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* دیالوگ تایید حذف */}
      <Dialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} width={400}>
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <HiOutlineExclamation className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--primary)]">تایید حذف رشته ورزشی</h3>
          <p className="text-xs text-gray-500">آیا از حذف این رشته ورزشی اطمینان دارید؟ این عملیات قابل بازگشت نیست.</p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
            >
              انصراف
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
            >
              حذف شود
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
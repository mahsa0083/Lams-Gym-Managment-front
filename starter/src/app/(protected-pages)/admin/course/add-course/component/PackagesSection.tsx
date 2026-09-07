'use client'

import React, { useState, useEffect } from 'react'
import ApiService from '@/services/client/ApiService'
import { PackageItem } from '@/@types/gym'
import Select from '@/components/ui/Select'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX } from 'react-icons/hi'

export interface OptionType {
    value: number | string
    label: string
}

const formatNumber = (val: string | number) => {
    if (!val && val !== 0) return ''
    const numStr = val.toString().replace(/\D/g, '')
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// تعریف تابع getArrayFromResponse برای استخراج آرایه‌ها و جلوگیری از خطای TS
const getArrayFromResponse = (res: any): any[] => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.data?.data)) return res.data.data
    if (Array.isArray(res.items)) return res.items
    return []
}

export default function PackagesSection() {
    const [packages, setPackages] = useState<PackageItem[]>([])
    const [sportOptions, setSportOptions] = useState<OptionType[]>([])
    const [trainerOptions, setTrainerOptions] = useState<OptionType[]>([])
    const [loading, setLoading] = useState(false)

    const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null)

    const [selectedSport, setSelectedSport] = useState<OptionType | null>(null)
    const [selectedTrainer, setSelectedTrainer] = useState<OptionType | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [durationDays, setDurationDays] = useState<number | ''>('')
    const [totalSessions, setTotalSessions] = useState<number | ''>('')
    const [price, setPrice] = useState<string>('')

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. دریافت پکیج‌ها
            try {
                const packagesRes = await ApiService.get<any>('/packages')
                setPackages(getArrayFromResponse(packagesRes))
            } catch (err) {
                console.error('خطا در دریافت پکیج‌ها:', err)
            }

            // 2. دریافت رشته‌ها
            try {
                const sportsRes = await ApiService.get<any>('/sports')
                const rawSports = getArrayFromResponse(sportsRes)
                const formattedSports: OptionType[] = rawSports.map((item: any) => ({
                    value: item.id,
                    label: String(item.name || item.title || item.sportName || `رشته ${item.id}`),
                }))
                setSportOptions(formattedSports)
            } catch (err) {
                console.error('خطا در دریافت رشته‌ها:', err)
            }

            // 3. دریافت مربیان
            try {
                const trainersRes = await ApiService.get<any>('/trainers', {
                    headers: {
                        'Accept': 'application/json',
                    },
                })

                // اگر پاسخ به صورت رشته JSON متنی آمده باشد، آن را پارس می‌کنیم
                let rawTrainers = getArrayFromResponse(trainersRes)
                if (typeof trainersRes === 'string') {
                    try {
                        rawTrainers = JSON.parse(trainersRes)
                    } catch (e) {
                        console.error('خطا در پارس کردن پاسخ مربیان:', e)
                    }
                }

                const uniqueTrainers = rawTrainers.filter(
                    (item: any, index: number, self: any[]) =>
                        index === self.findIndex((t: any) => t.id === item.id)
                )

                const formattedTrainers: OptionType[] = uniqueTrainers.map((item: any) => ({
                    value: item.id,
                    label: item.firstName ? `${item.firstName} ${item.lastName}` : String(item.name || `مربی ${item.id}`),
                }))
                setTrainerOptions(formattedTrainers)
            } catch (err) {
                console.error('خطا در دریافت لیست مربیان:', err)
            }

        } catch (error) {
            console.error('خطا در دریافت کلی اطلاعات:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const resetForm = () => {
        setEditingPackage(null)
        setSelectedSport(null)
        setSelectedTrainer(null)
        setTitle('')
        setDescription('')
        setDurationDays('')
        setTotalSessions('')
        setPrice('')
    }

    const handleSelectForEdit = (pkg: PackageItem) => {
        setEditingPackage(pkg)

        const currentSport = sportOptions.find((s) => s.value === pkg.sportid) || null
        const currentTrainer = trainerOptions.find((t) => t.value === pkg.trainerid) || null

        setSelectedSport(currentSport)
        setSelectedTrainer(currentTrainer)
        setTitle(pkg.title || '')
        setDescription(pkg.description || '')
        setDurationDays(pkg.durationDays ?? '')
        setTotalSessions(pkg.totalSessions ?? '')
        setPrice(pkg.price ? formatNumber(pkg.price) : '')
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '')
        setPrice(formatNumber(rawValue))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSport || !selectedTrainer || !title) return

        const numericPrice = Number(price.replace(/,/g, '')) || 0

        const payload = {
            sportid: Number(selectedSport.value),
            trainerid: Number(selectedTrainer.value),
            title,
            description,
            durationDays: Number(durationDays) || 30,
            totalSessions: Number(totalSessions) || 12,
            price: numericPrice,
        }

        try {
            if (editingPackage) {
                await ApiService.put(`/packages/${editingPackage.id}`, payload)
            } else {
                await ApiService.post('/packages', payload)
            }

            resetForm()
            fetchData()
        } catch (error) {
            console.error('خطا در ذخیره‌سازی پکیج:', error)
        }
    }

    const handleDeletePackage = async (id: number) => {
        if (!confirm('آیا از حذف این پکیج مطمئن هستید؟')) return
        try {
            await ApiService.delete(`/packages/${id}`)
            fetchData()
        } catch (error) {
            console.error('خطا در حذف پکیج:', error)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                        {editingPackage ? (
                            <>
                                <HiOutlinePencil className="w-5 h-5 text-blue-600" />
                                ویرایش پکیج
                            </>
                        ) : (
                            <>
                                <HiOutlinePlus className="w-5 h-5" />
                                تعریف پکیج جدید
                            </>
                        )}
                    </h3>
                    {editingPackage && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                        >
                            <HiOutlineX className="w-3.5 h-3.5" />
                            انصراف
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">رشته ورزشی *</label>
                            <Select
                                placeholder="انتخاب رشته..."
                                options={sportOptions}
                                value={selectedSport}
                                onChange={(option: any) => setSelectedSport(option)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">مربی *</label>
                            <Select
                                placeholder="انتخاب مربی..."
                                options={trainerOptions}
                                value={selectedTrainer}
                                onChange={(option: any) => setSelectedTrainer(option)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">عنوان پکیج *</label>
                        <input
                            type="text"
                            required
                            placeholder="مثلاً: فیتنس ۳ جلسه در هفته"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-9 px-3 border border-gray-200 rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">مدت (روز)</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={durationDays}
                                onChange={(e) => setDurationDays(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full h-9 px-3 border border-gray-200 rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">تعداد جلسات</label>
                            <input
                                type="number"
                                placeholder="12"
                                value={totalSessions}
                                onChange={(e) => setTotalSessions(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full h-9 px-3 border border-gray-200 rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">شهریه (تومان)</label>
                        <input
                            type="text"
                            placeholder="۵۰۰,۰۰۰"
                            value={price}
                            onChange={handlePriceChange}
                            className="w-full h-9 px-3 border border-gray-200 rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)] font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-[var(--primary)]">توضیحات</label>
                        <textarea
                            placeholder="توضیحات مختصر پکیج..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity mt-2"
                    >
                        {editingPackage ? 'بروزرسانی پکیج' : 'ثبت پکیج'}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--primary)] mb-4">لیست پکیج‌های تعریف‌شده</h3>
                {loading ? (
                    <p className="text-xs text-gray-500 py-4 text-center">در حال بارگذاری...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr className="border-b bg-[var(--primary-subtle)]/50 text-[var(--primary)]">
                                    <th className="p-3">عنوان پکیج</th>
                                    <th className="p-3">مربی</th>
                                    <th className="p-3">جلسات / روز</th>
                                    <th className="p-3">قیمت (تومان)</th>
                                    <th className="p-3 text-center">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-400">
                                            پکیجی موجود نیست.
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map((pkg) => (
                                        <tr
                                            key={pkg.id}
                                            className={`border-b transition-colors ${editingPackage?.id === pkg.id ? 'bg-blue-50/60' : 'hover:bg-[var(--primary-subtle)]/20'
                                                }`}
                                        >
                                            <td className="p-3 font-bold text-[var(--primary)]">{pkg.title}</td>
                                            <td className="p-3">{pkg.trainerName || '-'}</td>
                                            <td className="p-3">
                                                {pkg.totalSessions} جلسه / {pkg.durationDays} روز
                                            </td>
                                            <td className="p-3 font-mono">{formatNumber(pkg.price || 0)}</td>
                                            <td className="p-3 flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleSelectForEdit(pkg)}
                                                    title="ویرایش"
                                                    className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                >
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePackage(pkg.id)}
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
        </div>
    )
}
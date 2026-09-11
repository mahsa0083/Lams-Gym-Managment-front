'use client'

import React, { useState, useEffect } from 'react'
import ApiService from '@/services/client/ApiService'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import DatePicker, { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorian_en from 'react-date-object/locales/gregorian_en'

import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePencil,
    HiOutlineX,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineUsers,
    HiOutlineAcademicCap,
    HiOutlineUser,
    HiOutlineExclamation,
    HiOutlineCheck,
} from 'react-icons/hi'

export interface OptionType {
    value: number | string
    label: string
}

export interface ScheduleItem {
    id?: number
    dayOfWeek: string
    startTime: string
    endTime: string
}

export interface GymClass {
    id: number
    title: string
    groupName: string
    trainerName: string
    sportName: string
    capacity: number
    remainingCapacity: number
    startDate: string
    schedules: ScheduleItem[]
}

// توابع تبدیل تاریخ
export const toJalaliDateObject = (
    dateValue?: string | null,
): DateObject | null => {
    if (!dateValue) return null
    try {
        const raw = dateValue.split('T')[0]
        return new DateObject({
            date: raw,
            calendar: gregorian,
            locale: gregorian_en,
        }).convert(persian, persian_fa)
    } catch {
        return null
    }
}

export const toGregorianDateString = (dateObj?: DateObject | null): string => {
    if (!dateObj) return ''
    try {
        const cloned = new DateObject(dateObj)
        return cloned.convert(gregorian, gregorian_en).format('YYYY-MM-DD')
    } catch {
        return ''
    }
}

export const formatToJalaliDisplay = (dateStr?: string | null): string => {
    if (!dateStr) return '-'
    try {
        const d = toJalaliDateObject(dateStr)
        return d ? d.format('YYYY/MM/DD') : '-'
    } catch {
        return dateStr.split('T')[0] || '-'
    }
}

const getArrayFromResponse = <T,>(res: any): T[] => {
    if (Array.isArray(res)) return res
    if (res?.data && Array.isArray(res.data)) return res.data
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data
    if (res?.items && Array.isArray(res.items)) return res.items
    return []
}

const WEEK_DAYS: OptionType[] = [
    { value: 'Saturday', label: 'شنبه' },
    { value: 'Sunday', label: 'یکشنبه' },
    { value: 'Monday', label: 'دوشنبه' },
    { value: 'Tuesday', label: 'سه‌شنبه' },
    { value: 'Wednesday', label: 'چهارشنبه' },
    { value: 'Thursday', label: 'پنج‌شنبه' },
    { value: 'Friday', label: 'جمعه' },
]

function validateTimeRange(startTime: string, endTime: string): { isValid: boolean; message: string } {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

    if (!timeRegex.test(startTime)) {
        return { isValid: false, message: 'ساعت شروع نامعتبر است (فرمت صحیح: HH:mm مثل 16:00)' };
    }

    if (!timeRegex.test(endTime)) {
        return { isValid: false, message: 'ساعت پایان نامعتبر است (فرمت صحیح: HH:mm مثل 17:30)' };
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
        return { isValid: false, message: 'ساعت شروع باید قبل از ساعت پایان باشد' };
    }

    return { isValid: true, message: 'زمان معتبر است' };
}

export default function GymClassesSection() {
    const [classes, setClasses] = useState<GymClass[]>([])
    const [sportOptions, setSportOptions] = useState<OptionType[]>([])
    const [trainerOptions, setTrainerOptions] = useState<OptionType[]>([])
    const [packageOptions, setPackageOptions] = useState<OptionType[]>([])
    const [loading, setLoading] = useState(true)
    const [editingClass, setEditingClass] = useState<GymClass | null>(null)

    // Form states
    const [selectedSport, setSelectedSport] = useState<OptionType | null>(null)
    const [selectedTrainer, setSelectedTrainer] = useState<OptionType | null>(
        null,
    )
    const [selectedPackage, setSelectedPackage] = useState<OptionType | null>(
        null,
    )
    const [title, setTitle] = useState('')
    const [groupName, setGroupName] = useState('')
    const [capacity, setCapacity] = useState<number | ''>('')

    // نگهداری تاریخ به صورت DateObject شمسی
    const [startDate, setStartDate] = useState<DateObject | null>(
        new DateObject({ calendar: persian, locale: persian_fa }),
    )

    // Schedule states
    const [schedules, setSchedules] = useState<ScheduleItem[]>([])
    const [selectedDay, setSelectedDay] = useState<OptionType | null>(
        WEEK_DAYS[0],
    )
    const [startTime, setStartTime] = useState('16:00')
    const [endTime, setEndTime] = useState('17:30')
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
        null,
    )

    // Delete dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const handleAddSchedule = () => {
        if (!selectedDay) {
            alert('لطفاً روز را انتخاب کنید')
            return
        }
        if (!validateTimeRange(startTime, endTime)) {
            alert('زمان شروع باید قبل از زمان پایان باشد')
            return
        }

        setSchedules((prev) => [
            ...prev,
            {
                dayOfWeek: String(selectedDay.value),
                startTime,
                endTime,
            },
        ])
    }

    const handleTimeChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (val: string) => void
    ) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 4) value = value.slice(0, 4)
        if (value.length > 2) {
            value = `${value.slice(0, 2)}:${value.slice(2)}`
        }
        setter(value)
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const [clsRes, sportsRes, trainersRes, packagesRes] =
                await Promise.all([
                    ApiService.get<any>('/gym-classes'),
                    ApiService.get<any>('/sports'),
                    ApiService.get<any>('/trainers'),
                    ApiService.get<any>('/packages'),
                ])

            setClasses(getArrayFromResponse<GymClass>(clsRes))

            setSportOptions(
                getArrayFromResponse<any>(sportsRes).map((s) => ({
                    value: s.id,
                    label: s.title || s.name,
                })),
            )

            setTrainerOptions(
                getArrayFromResponse<any>(trainersRes).map((t) => ({
                    value: t.id,
                    label: `${t.firstName} ${t.lastName}`,
                })),
            )

            setPackageOptions(
                getArrayFromResponse<any>(packagesRes).map((p) => ({
                    value: p.id,
                    label: `${p.title} (${p.sessionCount} جلسه - ${Number(p.price).toLocaleString()} تومان)`,
                })),
            )
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setTitle('')
        setGroupName('')
        setSelectedSport(null)
        setSelectedTrainer(null)
        setSelectedPackage(null)
        setCapacity('')
        setStartDate(new DateObject({ calendar: persian, locale: persian_fa }))
        setSchedules([])
        setEditingClass(null)
        setEditingScheduleId(null)
    }

    const handleSelectForEdit = async (cls: GymClass) => {
        setEditingClass(cls)
        setTitle(cls.title)
        setGroupName(cls.groupName || '')
        setCapacity(cls.capacity)

        // تبدیل تاریخ میلادی دریافتی به شمسی
        setStartDate(toJalaliDateObject(cls.startDate))

        try {
            const detailsRes = await ApiService.get<any>(
                `/gym-classes/${cls.id}`,
            )
            const data = detailsRes.data || detailsRes
            if (data.schedules) {
                setSchedules(data.schedules)
            }
        } catch (err) {
            console.error('Error fetching class details:', err)
            setSchedules(cls.schedules || [])
        }
    }

   const handleSaveSchedule = async () => {
        if (!selectedDay) {
            alert("لطفاً روز هفته را انتخاب کنید.");
            return;
        }

        // اعمال تابع اعتبارسنجی ساعت
        const validation = validateTimeRange(startTime, endTime);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        // اطمینان از اینکه فرمت ساعت‌ها دقیقاً HH:mm:00 یا HH:mm باشد (بسته به نیاز دات‌نت)
        const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
        const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

        const scheduleData = {
            dayOfWeek: String(selectedDay.value),
            startTime: formattedStartTime,
            endTime: formattedEndTime,
        }

        if (editingClass) {
            try {
                if (editingScheduleId) {
                    await ApiService.put(`/gym-classes/schedules/${editingScheduleId}`, scheduleData);
                } else {
                    await ApiService.post(`/gym-classes/${editingClass.id}/schedules`, scheduleData);
                }

                const updatedDetail = await ApiService.get<any>(`/gym-classes/${editingClass.id}`);
                if (updatedDetail?.schedules) {
                    setSchedules(updatedDetail.schedules);
                }
            } catch (err) {
                console.error('خطا در ذخیره زمان‌بندی:', err);
            }
        } else {
            setSchedules((prev) => [...prev, scheduleData]);
        }

        setEditingScheduleId(null);
        setSelectedDay(WEEK_DAYS[0]);
        setStartTime('16:00');
        setEndTime('17:30');
    }

    const handleEditScheduleClick = (sch: ScheduleItem) => {
        if (!sch.id) return
        setEditingScheduleId(sch.id)
        const dayOpt = WEEK_DAYS.find((d) => d.value === sch.dayOfWeek) || null
        setSelectedDay(dayOpt)
        setStartTime(sch.startTime.slice(0, 5))
        setEndTime(sch.endTime.slice(0, 5))
    }

    const handleRemoveSchedule = async (index: number, sch?: ScheduleItem) => {
        if (editingClass && sch?.id) {
            try {
                await ApiService.delete(
                    `/gym-classes/${editingClass.id}/schedules/${sch.id}`,
                )
                setSchedules((prev) => prev.filter((s) => s.id !== sch.id))
            } catch (err: any) {
                alert(err.response?.data?.message || 'خطا در حذف زمان‌بندی')
            }
        } else {
            setSchedules((prev) => prev.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !selectedSport || !selectedTrainer) {
            alert('لطفاً فیلدهای اجباری را تکمیل کنید')
            return
        }

        if (!editingClass && schedules.length === 0) {
            alert('حداقل یک زمان‌بندی برای ایجاد کلاس لازم است')
            return
        }

        if (!capacity || Number(capacity) <= 0) {
            alert('ظرفیت باید یک عدد بزرگتر از صفر باشد')
            return
        }

        try {
            if (editingClass) {
                const payload = {
                    sportId: Number(selectedSport.value),
                    trainerId: Number(selectedTrainer.value),
                    title: title.trim(),
                    groupName: groupName.trim(),
                    capacity: Number(capacity),
                }
                await ApiService.put(`/gym-classes/${editingClass.id}`, payload)
            } else {
                // تبدیل تاریخ شمسی به فرمت میلادی YYYY-MM-DD
                const gregorianStartDate = toGregorianDateString(startDate)

                const payload = {
                    sportId: Number(selectedSport.value),
                    trainerId: Number(selectedTrainer.value),
                    packageId: selectedPackage
                        ? Number(selectedPackage.value)
                        : undefined,
                    title: title.trim(),
                    groupName: groupName.trim(),
                    capacity: Number(capacity),
                    startDate: gregorianStartDate, // فرمت استاندارد بدون بخش تایم و Z
                    schedules: schedules.map((s) => ({
                        dayOfWeek: s.dayOfWeek,
                        startTime:
                            s.startTime.length === 5
                                ? `${s.startTime}:00`
                                : s.startTime,
                        endTime:
                            s.endTime.length === 5
                                ? `${s.endTime}:00`
                                : s.endTime,
                    })),
                }

                await ApiService.post('/gym-classes', payload)
            }

            resetForm()
            fetchData()
        } catch (err: any) {
            console.error('Submit error:', err)
            const errors = err?.response?.data?.errors
            if (errors) {
                const msg = Object.values(errors).flat().join('\n')
                alert(`خطا در اعتبارسنجی:\n${msg}`)
            } else {
                alert(err?.response?.data?.message || 'خطا در ثبت کلاس')
            }
        }
    }

    const handleDeleteClass = async () => {
        if (!deleteId) return
        try {
            await ApiService.delete(`/gym-classes/${deleteId}`)
            setIsDeleteDialogOpen(false)
            setDeleteId(null)
            fetchData()
        } catch (err: any) {
            alert(err.response?.data?.message || 'خطا در حذف کلاس')
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-6">
            {/* فرم ایجاد / ویرایش کلاس */}
            <div className="rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-[var(--primary)]">
                    {editingClass
                        ? 'ویرایش کلاس ورزشی'
                        : 'تعریف کلاس ورزشی جدید'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                عنوان کلاس{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="مثلاً: کلاس بدنسازی عمومی"
                                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2 text-xs text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                نام گروه
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="مثلاً: گروه ۳ تا ۵"
                                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2 text-xs text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                ظرفیت (نفر){' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={(e) =>
                                    setCapacity(
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                    )
                                }
                                placeholder="مثلاً: 15"
                                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2 text-xs text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                رشته ورزشی{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={sportOptions}
                                value={selectedSport}
                                onChange={setSelectedSport}
                                placeholder="انتخاب رشته ورزشی"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                مربی <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={trainerOptions}
                                value={selectedTrainer}
                                onChange={setSelectedTrainer}
                                placeholder="انتخاب مربی"
                            />
                        </div>

                        {!editingClass && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                    پکیج پیش‌فرض
                                </label>
                                <Select
                                    options={packageOptions}
                                    value={selectedPackage}
                                    onChange={setSelectedPackage}
                                    placeholder="انتخاب پکیج (اختیاری)"
                                />
                            </div>
                        )}

                        {!editingClass && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-[var(--primary)]">
                                    تاریخ شروع{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <DatePicker
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    value={startDate}
                                    onChange={(date: DateObject | null) =>
                                        setStartDate(date)
                                    }
                                    inputClass="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2 text-xs text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                                    placeholder="انتخاب تاریخ شروع"
                                />
                            </div>
                        )}
                    </div>

                    {/* بخش زمان‌بندی روزها و ساعات */}
                    <div className="mt-4 rounded-xl border border-dashed border-[var(--primary-mild)]/40 p-4">
                        <h3 className="mb-3 text-xs font-bold text-[var(--primary)]">
                            {editingClass
                                ? 'مدیریت زمان‌بندی جلسات'
                                : 'تعریف زمان‌بندی جلسات'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="w-36">
                                <Select
                                    options={WEEK_DAYS}
                                    value={selectedDay}
                                    onChange={setSelectedDay}
                                    placeholder="روز هفته"
                                />
                            </div>

                            <div className="flex items-center gap-1 text-xs text-[var(--primary)]">
                                <span>از:</span>
                                <input
                                    type="text"
                                    placeholder="16:00"
                                    maxLength={5}
                                    value={startTime}
                                    onChange={(e) =>
                                        handleTimeChange(e, setStartTime)
                                    }
                                    className="w-full h-9 px-2 border border-gray-200 rounded-xl text-center bg-white dir-ltr focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="flex items-center gap-1 text-xs text-[var(--primary)]">
                                <span>تا:</span>
                                 <input
                                    type="text"
                                    placeholder="17:00"
                                    maxLength={5}
                                    value={endTime}
                                    onChange={(e) => handleTimeChange(e, setEndTime)}
                                    className="w-full h-9 px-2 border border-gray-200 rounded-xl text-center bg-white dir-ltr focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            {editingClass ? (
                                <button
                                    type="button"
                                    onClick={handleSaveSchedule}
                                    className="flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[var(--primary-mild)]"
                                >
                                    <HiOutlineCheck className="h-4 w-4" />
                                    <span>
                                        {editingScheduleId
                                            ? 'ویرایش تایم'
                                            : 'افزودن تایم'}
                                    </span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleAddSchedule}
                                    className="flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[var(--primary-mild)]"
                                >
                                    <HiOutlinePlus className="h-4 w-4" />
                                    <span>افزودن روز</span>
                                </button>
                            )}
                        </div>

                        {/* لیست زمان‌بندی‌های ثبت شده */}
                        {schedules.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {schedules.map((sch, index) => {
                                    const dayLabel =
                                        WEEK_DAYS.find(
                                            (d) => d.value === sch.dayOfWeek,
                                        )?.label || sch.dayOfWeek
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 rounded-lg bg-[var(--primary-subtle)] px-2.5 py-1 text-xs text-[var(--primary)]"
                                        >
                                            <HiOutlineClock className="h-3.5 w-3.5 text-[var(--primary-mild)]" />
                                            <span>
                                                {dayLabel} (
                                                {sch.startTime.slice(0, 5)} -{' '}
                                                {sch.endTime.slice(0, 5)})
                                            </span>
                                            {editingClass && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditScheduleClick(
                                                            sch,
                                                        )
                                                    }
                                                    className="text-[var(--primary-mild)] hover:text-[var(--primary)]"
                                                >
                                                    <HiOutlinePencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveSchedule(
                                                        index,
                                                        sch,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <HiOutlineX className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        {editingClass && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-[var(--primary-mild)]/40 px-4 py-2 text-xs font-semibold text-[var(--primary-mild)] hover:bg-[var(--primary-subtle)]"
                            >
                                انصراف
                            </button>
                        )}
                        <button
                            type="submit"
                            className="rounded-xl bg-[var(--primary)] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--primary-mild)]"
                        >
                            {editingClass
                                ? 'ذخیره تغییرات کلاس'
                                : 'تشکیل کلاس جدید'}
                        </button>
                    </div>
                </form>
            </div>

            {/* لیست کلاس‌های ورزشی */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--primary)]">
                    کلاس‌های فعال
                </h3>

                {loading ? (
                    <p className="text-xs text-gray-500">
                        در حال بارگذاری لیست کلاس‌ها...
                    </p>
                ) : classes.length === 0 ? (
                    <p className="text-xs text-gray-500">
                        هیچ کلاسی ثبت نشده است.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className="relative flex flex-col justify-between rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-4 shadow-sm"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-[var(--primary)]">
                                            {cls.title}
                                        </h4>
                                        <span className="rounded-md bg-[var(--primary-subtle)] px-2 py-0.5 text-[10px] text-[var(--primary)]">
                                            {cls.sportName}
                                        </span>
                                    </div>

                                    {cls.groupName && (
                                        <p className="text-xs text-gray-500">
                                            گروه: {cls.groupName}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <HiOutlineUser className="h-4 w-4 text-[var(--primary-mild)]" />
                                        <span>مربی: {cls.trainerName}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <HiOutlineUsers className="h-4 w-4 text-[var(--primary-mild)]" />
                                        <span>
                                            ظرفیت: {cls.capacity} نفر
                                            (باقیمانده:{' '}
                                            {cls.remainingCapacity ??
                                                cls.capacity}
                                            )
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <HiOutlineCalendar className="h-4 w-4 text-[var(--primary-mild)]" />
                                        <span>
                                            شروع:{' '}
                                            {formatToJalaliDisplay(
                                                cls.startDate,
                                            )}
                                        </span>
                                    </div>

                                    {cls.schedules &&
                                        cls.schedules.length > 0 && (
                                            <div className="mt-2 space-y-1 rounded-lg bg-[var(--primary-subtle)]/40 p-2">
                                                <span className="block text-[10px] font-bold text-[var(--primary)]">
                                                    برنامه زمانی:
                                                </span>
                                                {cls.schedules.map((s, idx) => {
                                                    const dayLabel =
                                                        WEEK_DAYS.find(
                                                            (d) =>
                                                                d.value ===
                                                                s.dayOfWeek,
                                                        )?.label || s.dayOfWeek
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-1 text-[11px] text-gray-600"
                                                        >
                                                            <HiOutlineClock className="h-3 w-3 text-[var(--primary-mild)]" />
                                                            <span>
                                                                {dayLabel}:{' '}
                                                                {s.startTime.slice(
                                                                    0,
                                                                    5,
                                                                )}{' '}
                                                                الی{' '}
                                                                {s.endTime.slice(
                                                                    0,
                                                                    5,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--primary-mild)]/20 pt-3">
                                    <button
                                        onClick={() => handleSelectForEdit(cls)}
                                        className="rounded-lg p-1.5 text-[var(--primary-mild)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]"
                                        title="ویرایش"
                                    >
                                        <HiOutlinePencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDeleteId(cls.id)
                                            setIsDeleteDialogOpen(true)
                                        }}
                                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                                        title="حذف"
                                    >
                                        <HiOutlineTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* دیالوگ تایید حذف */}
            <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false)
                    setDeleteId(null)
                }}
                width={400}
            >
                <div className="space-y-4 p-2">
                    <h3 className="text-sm font-bold text-[var(--primary)]">
                        حذف کلاس ورزشی
                    </h3>
                    <p className="text-xs text-gray-600">
                        آیا از حذف این کلاس ورزشی مطمئن هستید؟ این عملیات قابل
                        بازگشت نیست.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setDeleteId(null)
                            }}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            انصراف
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClass}
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                            حذف
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

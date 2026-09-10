'use client'

import React, { useState, useEffect } from 'react'
import ApiService from '@/services/client/ApiService'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import DatePicker from '@/components/ui/DatePicker'
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
    HiOutlineCheck
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

const getArrayFromResponse = (res: any): any[] => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.data?.data)) return res.data.data
    if (Array.isArray(res.items)) return res.items
    return []
}

const WEEK_DAYS = [
    { value: 'Saturday', label: 'شنبه' },
    { value: 'Sunday', label: 'یکشنبه' },
    { value: 'Monday', label: 'دوشنبه' },
    { value: 'Tuesday', label: 'سه‌شنبه' },
    { value: 'Wednesday', label: 'چهارشنبه' },
    { value: 'Thursday', label: 'پنج‌شنبه' },
    { value: 'Friday', label: 'جمعه' },
]

// تابع اعتبارسنجی دقیق ساعت‌ها برای جلوگیری از مقادیر اشتباه
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
    const [loading, setLoading] = useState(false)

    const [editingClass, setEditingClass] = useState<GymClass | null>(null)

    // فیلدهای فرم کلاس
    const [selectedSport, setSelectedSport] = useState<OptionType | null>(null)
    const [selectedTrainer, setSelectedTrainer] = useState<OptionType | null>(null)
    const [selectedPackage, setSelectedPackage] = useState<OptionType | null>(null)
    const [title, setTitle] = useState('')
    const [groupName, setGroupName] = useState('')
    const [capacity, setCapacity] = useState<number | ''>('')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

    // مدیریت زمان‌بندی‌ها (Schedules)
    const [schedules, setSchedules] = useState<ScheduleItem[]>([])
    const [selectedDay, setSelectedDay] = useState<OptionType | null>(WEEK_DAYS[0])
    const [startTime, setStartTime] = useState('16:00')
    const [endTime, setEndTime] = useState('17:30')
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null)

    // دیالوگ حذف کلاس
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const handleAddSchedule = () => {
    // استخراج دقیق مقدار value چه به صورت آبجکت باشد چه به صورت مقدار خام
    const dayValue = selectedDay && typeof selectedDay === 'object' ? (selectedDay as any).value : selectedDay;
    
    if (!dayValue || !startTime || !endTime) return
    
    const newSchedule: ScheduleItem = {
      dayOfWeek: String(dayValue),
      startTime,
      endTime,
    }
    setSchedules([...schedules, newSchedule])
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
        setLoading(true)
        try {
            const classRes = await ApiService.get<any>('/gym-classes')
            setClasses(getArrayFromResponse(classRes))

            const sportsRes = await ApiService.get<any>('/sports')
            setSportOptions(
                getArrayFromResponse(sportsRes).map((item: any) => ({
                    value: item.id,
                    label: item.name || `رشته ${item.id}`,
                }))
            )

            const trainersRes = await ApiService.get<any>('/trainers')
            setTrainerOptions(
                getArrayFromResponse(trainersRes).map((item: any) => ({
                    value: item.id,
                    label: item.firstName ? `${item.firstName} ${item.lastName}` : item.name || `مربی ${item.id}`,
                }))
            )

            const packagesRes = await ApiService.get<any>('/packages')
            setPackageOptions(
                getArrayFromResponse(packagesRes).map((item: any) => ({
                    value: item.id,
                    label: item.title || `پکیج ${item.id}`,
                }))
            )
        } catch (err) {
            console.error('خطا در دریافت اطلاعات:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const resetForm = () => {
        setEditingClass(null)
        setSelectedSport(null)
        setSelectedTrainer(null)
        setSelectedPackage(null)
        setTitle('')
        setGroupName('')
        setCapacity('')
        setStartDate(new Date().toISOString().split('T')[0])
        setSchedules([])
        setEditingScheduleId(null)
        setSelectedDay(WEEK_DAYS[0])
        setStartTime('16:00')
        setEndTime('17:30')
    }

    const handleSelectForEdit = async (cls: GymClass) => {
        setEditingClass(cls)
        setTitle(cls.title || '')
        setGroupName(cls.groupName || '')
        setCapacity(cls.capacity || '')
        setStartDate(cls.startDate ? cls.startDate.split('T')[0] : new Date().toISOString().split('T')[0])

        try {
            const detailRes = await ApiService.get<any>(`/gym-classes/${cls.id}`)
            if (detailRes) {
                if (detailRes.schedules) setSchedules(detailRes.schedules)
                if (detailRes.sportId) {
                    const sOpt = sportOptions.find((opt) => Number(opt.value) === Number(detailRes.sportId))
                    if (sOpt) setSelectedSport(sOpt)
                }
                if (detailRes.trainerId) {
                    const tOpt = trainerOptions.find((opt) => Number(opt.value) === Number(detailRes.trainerId))
                    if (tOpt) setSelectedTrainer(tOpt)
                }
                if (detailRes.packageId) {
                    const pOpt = packageOptions.find((opt) => Number(opt.value) === Number(detailRes.packageId))
                    if (pOpt) setSelectedPackage(pOpt)
                }
            }
        } catch (err) {
            console.error('خطا در دریافت جزئیات کلاس:', err)
            setSchedules(cls.schedules || [])
        }
    }

    // افزودن زمان به لیست با بررسی اعتبارسنجی
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

    const handleEditScheduleSelect = (sch: ScheduleItem) => {
        if (sch.id) {
            setEditingScheduleId(sch.id)
        }
        const matchedDay = WEEK_DAYS.find((d) => d.value === sch.dayOfWeek)
        if (matchedDay) setSelectedDay(matchedDay)
        setStartTime(sch.startTime.slice(0, 5))
        setEndTime(sch.endTime.slice(0, 5))
    }

    const handleRemoveSchedule = async (index: number, scheduleId?: number) => {
        if (editingClass && scheduleId) {
            try {
                await ApiService.delete(`/gym-classes/schedules/${scheduleId}`)
                setSchedules(schedules.filter((s) => s.id !== scheduleId))
                fetchData()
            } catch (err) {
                console.error('خطا در حذف زمان‌بندی:', err)
            }
        } else {
            setSchedules(schedules.filter((_, i) => i !== index))
        }
    }

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ۱. اعتبارسنجی اولیه الزامی بودن فیلدها در فرانت
    if (!title.trim() || !selectedSport || !selectedTrainer) {
      alert('لطفاً فیلدهای الزامی (عنوان، رشته ورزشی و مربی) را پر کنید.');
      return;
    }

    if (!editingClass && schedules.length === 0) {
      alert('حداقل یک برنامه زمانی (سانس) برای کلاس الزامی است.');
      return;
    }

    if (!capacity || Number(capacity) <= 0) {
      alert('ظرفیت کلاس باید بیشتر از صفر باشد.');
      return;
    }

    try {
      if (editingClass) {
        // ویرایش کلاس
        const payload = {
          sportId: Number(selectedSport.value),
          trainerId: Number(selectedTrainer.value),
          packageId: selectedPackage && selectedPackage.value ? Number(selectedPackage.value) : null,
          title: title.trim(),
          groupName: groupName.trim(),
          capacity: Number(capacity),
        };
        await ApiService.put(`/gym-classes/${editingClass.id}`, payload);
      } else {
        // فرمت کردن زمان‌بندی‌ها
        const formattedSchedules = schedules.map((item) => ({
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime.length === 5 ? `${item.startTime}:00` : item.startTime,
          endTime: item.endTime.length === 5 ? `${item.endTime}:00` : item.endTime,
        }));

        // ✅ درست: ارسال مستقیم فیلدها در بادی بدون رپر dto
        const payload = {
          sportId: Number(selectedSport.value),
          trainerId: Number(selectedTrainer.value),
          // اگر پکیج انتخاب نشده باشد، مقدار null ارسال شود تا خطای FK نخورد
          packageId: selectedPackage && selectedPackage.value ? Number(selectedPackage.value) : null,
          title: title.trim(),
          groupName: groupName.trim(),
          capacity: Number(capacity),
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          schedules: formattedSchedules,
        };

        await ApiService.post('/gym-classes', payload);
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('خطا در ثبت کلاس:', error);
      if (error?.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        alert(`خطای اعتبارسنجی سرور:\n${errorMessages}`);
      }
    }
  };


    const confirmDelete = (id: number) => {
        setDeleteId(id)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteClass = async () => {
        if (!deleteId) return
        try {
            await ApiService.delete(`/gym-classes/${deleteId}`)
            setIsDeleteDialogOpen(false)
            setDeleteId(null)
            fetchData()
        } catch (err) {
            console.error('خطا در حذف کلاس:', err)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* فرم ثبت / ویرایش */}
            <div className="bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                        {editingClass ? (
                            <>
                                <HiOutlinePencil className="w-5 h-5 text-blue-600" />
                                ویرایش اطلاعات کلاس
                            </>
                        ) : (
                            <>
                                <HiOutlinePlus className="w-5 h-5" />
                                تشکیل کلاس جدید
                            </>
                        )}
                    </h3>
                    {editingClass && (
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

                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    <div>
                        <label className="block font-semibold mb-1 text-[var(--primary)]">عنوان کلاس *</label>
                        <input
                            type="text"
                            required
                            placeholder="مثلاً: کلاس بدنسازی گروه A"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-9 px-3 border border-gray-200 rounded-xl bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block font-semibold mb-1 text-[var(--primary)]">نام گروه / سانس</label>
                            <input
                                type="text"
                                placeholder="مثلاً: گروه خانم ها"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full h-9 px-3 border border-gray-200 rounded-xl bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-[var(--primary)]">ظرفیت (نفر)</label>
                            <input
                                type="number"
                                placeholder="15"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full h-9 px-3 border border-gray-200 rounded-xl bg-[var(--primary-subtle)]/30 focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block font-semibold mb-1 text-[var(--primary)]">رشته ورزشی *</label>
                            <Select
                                placeholder="انتخاب رشته..."
                                options={sportOptions}
                                value={selectedSport}
                                onChange={(opt: any) => setSelectedSport(opt)}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-[var(--primary)]">مربی *</label>
                            <Select
                                placeholder="انتخاب مربی..."
                                options={trainerOptions}
                                value={selectedTrainer}
                                onChange={(opt: any) => setSelectedTrainer(opt)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block font-semibold mb-1 text-[var(--primary)]">پکیج مرتبط</label>
                            <Select
                                placeholder="انتخاب پکیج..."
                                options={packageOptions}
                                value={selectedPackage}
                                onChange={(opt: any) => setSelectedPackage(opt)}
                            />
                        </div>
                        {!editingClass && (
                            <div>
                                <label className="block font-semibold mb-1 text-[var(--primary)]">تاریخ شروع</label>
                                <DatePicker
                                    placeholder="انتخاب تاریخ شروع"
                                    value={startDate ? new Date(startDate) : null}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            const formattedDate = date.toISOString().split("T")[0];
                                            setStartDate(formattedDate);
                                        } else {
                                            setStartDate("");
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* بخش زمان‌بندی سانس‌ها */}
                    <div className="p-3 bg-[var(--primary-subtle)]/50 rounded-xl border border-[var(--primary-mild)]/20 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="block font-bold text-[var(--primary)]">زمان‌بندی سانس‌ها (Schedules)</span>
                            {editingScheduleId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingScheduleId(null)
                                        setSelectedDay(WEEK_DAYS[0])
                                        setStartTime('16:00')
                                        setEndTime('17:30')
                                    }}
                                    className="text-[10px] text-rose-500 hover:underline"
                                >
                                    انصراف از ویرایش زمان
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-0.5">روز</label>
                                <Select
                                    options={WEEK_DAYS}
                                    value={selectedDay}
                                    onChange={(opt: any) => setSelectedDay(opt)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-0.5">از ساعت</label>
                                <input
                                    type="text"
                                    placeholder="16:00"
                                    maxLength={5}
                                    value={startTime}
                                    onChange={(e) => handleTimeChange(e, setStartTime)}
                                    className="w-full h-9 px-2 border border-gray-200 rounded-xl text-center bg-white dir-ltr focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-0.5">تا ساعت</label>
                                <input
                                    type="text"
                                    placeholder="17:00"
                                    maxLength={5}
                                    value={endTime}
                                    onChange={(e) => handleTimeChange(e, setEndTime)}
                                    className="w-full h-9 px-2 border border-gray-200 rounded-xl text-center bg-white dir-ltr focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSaveSchedule}
                            className="w-full py-1.5 bg-[var(--primary-mild)] text-white font-semibold rounded-lg text-xs hover:opacity-95 transition-all flex items-center justify-center gap-1"
                        >
                            {editingScheduleId ? (
                                <>
                                    <HiOutlineCheck className="w-3.5 h-3.5" />
                                    بروزرسانی این زمان
                                </>
                            ) : (
                                <>
                                    <HiOutlinePlus className="w-3.5 h-3.5" />
                                    افزودن زمان به لیست
                                </>
                            )}
                        </button>

                        {schedules.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                                {schedules.map((sch, idx) => {
                                    const dayObj = WEEK_DAYS.find((d) => d.value === sch.dayOfWeek)
                                    return (
                                        <div
                                            key={sch.id || idx}
                                            className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 text-xs"
                                        >
                                            <span className="text-gray-700 font-medium">
                                                {dayObj ? dayObj.label : sch.dayOfWeek}: از ساعت {sch.startTime.slice(0, 5)} الی {sch.endTime.slice(0, 5)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {editingClass && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditScheduleSelect(sch)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="ویرایش زمان"
                                                    >
                                                        <HiOutlinePencil className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSchedule(idx, sch.id)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                                    title="حذف زمان"
                                                >
                                                    <HiOutlineTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl text-xs hover:opacity-95 transition-opacity mt-2"
                    >
                        {editingClass ? 'بروزرسانی اطلاعات کلاس' : 'ایجاد کلاس'}
                    </button>
                </form>
            </div>

            {/* لیست کلاس‌های فعال */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[var(--primary-mild)]/30 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--primary)] mb-4">لیست کلاس‌های فعال</h3>
                {loading ? (
                    <p className="text-xs text-gray-500 py-4 text-center">در حال بارگذاری...</p>
                ) : classes.length === 0 ? (
                    <p className="text-xs text-gray-400 py-8 text-center">هیچ کلاسی ثبت نشده است.</p>
                ) : (
                    <div className="space-y-3">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className="p-4 rounded-xl border border-gray-100 bg-[var(--primary-subtle)]/20 hover:border-[var(--primary-mild)]/40 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-[var(--primary)]">{cls.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1">
                                                <HiOutlineAcademicCap className="w-4 h-4 text-gray-400" />
                                                {cls.sportName || 'رشته نامشخص'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HiOutlineUser className="w-4 h-4 text-gray-400" />
                                                {cls.trainerName || 'مربی نامشخص'}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSelectForEdit(cls)}
                                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="ویرایش"
                                        >
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(cls.id)}
                                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <HiOutlineUsers className="w-4 h-4 text-[var(--primary)]" />
                                        <span>
                                            ظرفیت: {cls.remainingCapacity} از {cls.capacity} نفر باقی‌مانده
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <HiOutlineCalendar className="w-4 h-4 text-[var(--primary)]" />
                                        <span>شروع: {cls.startDate ? cls.startDate.split('T')[0] : '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md">
                                            {cls.groupName || 'بدون گروه'}
                                        </span>
                                    </div>
                                </div>

                                {cls.schedules && cls.schedules.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                                        <p className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                            <HiOutlineClock className="w-3.5 h-3.5" />
                                            زمان‌بندی جلسات:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cls.schedules.map((s, idx) => {
                                                const dayObj = WEEK_DAYS.find((d) => d.value === s.dayOfWeek)
                                                return (
                                                    <span
                                                        key={s.id || idx}
                                                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-700"
                                                    >
                                                        {dayObj ? dayObj.label : s.dayOfWeek}: {s.startTime.slice(0, 5)} تا {s.endTime.slice(0, 5)}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* دیالوگ تایید حذف */}
            <Dialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} width={400}>
                <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <HiOutlineExclamation className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--primary)]">تایید حذف کلاس</h3>
                    <p className="text-xs text-gray-500">آیا از حذف این کلاس اطمینان دارید؟ این عملیات قابل بازگشت نیست.</p>
                    <div className="flex justify-center gap-2 pt-2">
                        <button
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                        >
                            انصراف
                        </button>
                        <button
                            onClick={handleDeleteClass}
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
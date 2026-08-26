'use client'

import React, { useState, useTransition } from 'react'
import {
    HiOutlineUserAdd as UserPlus,
    HiOutlinePencilAlt as Edit3,
    HiOutlineTrash as Trash2,
    HiOutlineClock as Clock,
    HiOutlineUser as User,
    HiOutlineX as X,
    HiOutlineCheckCircle as CheckCircle2,
    HiOutlineExclamationCircle as AlertCircle,
    HiOutlineEye as Eye,
    HiOutlinePhone as Phone,
} from 'react-icons/hi'
import { FaDumbbell as Dumbbell } from 'react-icons/fa'
import { TbUser } from 'react-icons/tb'
import DatePicker from '@/components/ui/DatePicker'
// Import UI Components from Design System
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import Dropdown from '@/components/ui/Dropdown'

interface SelectOption {
    value: string
    label: string
}

const GENDER_OPTIONS: SelectOption[] = [
    { value: 'Male', label: 'مرد' },
    { value: 'Female', label: 'زن' },
]

interface Member {
    id: string
    firstName: string
    lastName: string
    fullName: string
    phoneNumber: string
    nationalCode: string
    gender: 'Male' | 'Female'
    birthDate: string
    emergencyPhone?: string
    medicalNotes?: string
    isActive?: boolean
    className: string
    sportType: string
    trainerName: string
    startTimeHour: string
    startTimeMinute: string
    endTimeHour: string
    endTimeMinute: string
    paymentStatus: 'PAID' | 'UNPAID' | 'PENDING'
    joinDate?: string
    remainingSessions?: number
}

interface MemberFormData {
    firstName: string
    lastName: string
    phoneNumber: string
    nationalCode: string
    gender: 'Male' | 'Female'
    birthDate: string
    emergencyPhone: string
    medicalNotes: string
    isActive: boolean
    className: string
    sportType: string
    trainerName: string
    startTimeHour: string
    startTimeMinute: string
    endTimeHour: string
    endTimeMinute: string
    paymentStatus: 'PAID' | 'UNPAID' | 'PENDING'
    joinDate: string
    remainingSessions: number
}

interface SelectOption {
    value: string
    label: string
}

const SPORT_OPTIONS: SelectOption[] = [
    { value: 'ALL', label: 'همه رشته‌ها' },
    { value: 'بدنسازی', label: 'بدنسازی' },
    { value: 'فیتنس', label: 'فیتنس' },
    { value: 'یوگا', label: 'یوگا' },
    { value: 'CrossFit', label: 'کراس‌فیت' },
]

export default function MembersManagement() {
    const [members, setMembers] = useState<Member[]>([
        {
            id: '1',
            firstName: 'علی',
            lastName: 'محمدی',
            fullName: 'علی محمدی',
            phoneNumber: '09123456789',
            nationalCode: '0012345678',
            gender: 'Male',
            birthDate: '1375-01-01',
            emergencyPhone: '09129876543',
            medicalNotes: 'ندارد',
            isActive: true,
            className: 'بدنسازی سانس A',
            sportType: 'بدنسازی',
            trainerName: 'استاد رضایی',
            startTimeHour: '18',
            startTimeMinute: '00',
            endTimeHour: '19',
            endTimeMinute: '30',
            paymentStatus: 'PAID',
            joinDate: '1402/10/12',
            remainingSessions: 8,
        },
        {
            id: '2',
            firstName: 'سارا',
            lastName: 'احمدی',
            fullName: 'سارا احمدی',
            phoneNumber: '09198765432',
            nationalCode: '0098765432',
            gender: 'Female',
            birthDate: '1378-05-12',
            emergencyPhone: '',
            medicalNotes: '',
            isActive: true,
            className: 'یوگا پیشرفته',
            sportType: 'یوگا',
            trainerName: 'خانم کاظمی',
            startTimeHour: '10',
            startTimeMinute: '00',
            endTimeHour: '11',
            endTimeMinute: '30',
            paymentStatus: 'UNPAID',
            joinDate: '1402/11/05',
            remainingSessions: 2,
        },
    ])

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSport, setSelectedSport] = useState<SelectOption | null>(
        SPORT_OPTIONS[0],
    )
    const [searchOptions, setSearchOptions] = useState<SelectOption[]>([])
    const [isPending, startTransition] = useTransition()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [selectedMemberDetails, setSelectedMemberDetails] =
        useState<Member | null>(null)

    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean
        memberId: string | null
    }>({
        isOpen: false,
        memberId: null,
    })

    const [formData, setFormData] = useState<MemberFormData>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        nationalCode: '',
        gender: 'Male',
        birthDate: '2000-01-01',
        emergencyPhone: '',
        medicalNotes: '',
        isActive: true,
        className: '',
        sportType: 'بدنسازی',
        trainerName: '',
        startTimeHour: '18',
        startTimeMinute: '00',
        endTimeHour: '19',
        endTimeMinute: '30',
        paymentStatus: 'PAID',
        joinDate: '1402/12/01',
        remainingSessions: 10,
    })

    const handleSearchInputChange = (value: string) => {
        const trimmed = value.trim().toLowerCase()
        setSearchTerm(value)

        if (!trimmed) {
            setSearchOptions([])
            return
        }

        startTransition(() => {
            const matches = members
                .filter(
                    (m) =>
                        m.fullName.toLowerCase().includes(trimmed) ||
                        m.className.toLowerCase().includes(trimmed),
                )
                .map((m) => ({
                    value: m.fullName,
                    label: `${m.fullName} (${m.className})`,
                }))
            setSearchOptions(matches)
        })
    }

    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            !searchTerm ||
            member.fullName
                .toLowerCase()
                .includes(searchTerm.toLowerCase().trim()) ||
            member.className
                .toLowerCase()
                .includes(searchTerm.toLowerCase().trim())
        const matchesSport =
            !selectedSport ||
            selectedSport.value === 'ALL' ||
            member.sportType === selectedSport.value
        return matchesSearch && matchesSport
    })

    const handleOpenCreateModal = () => {
        setEditingMember(null)
        setFormData({
            firstName: '',
            lastName: '',
            phoneNumber: '',
            nationalCode: '',
            gender: 'Male',
            birthDate: '2000-01-01',
            emergencyPhone: '',
            medicalNotes: '',
            isActive: true,
            className: '',
            sportType: 'بدنسازی',
            trainerName: '',
            startTimeHour: '18',
            startTimeMinute: '00',
            endTimeHour: '19',
            endTimeMinute: '30',
            paymentStatus: 'PAID',
            joinDate: '1402/12/01',
            remainingSessions: 10,
        })
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (member: Member) => {
        setEditingMember(member)
        setFormData({
            firstName: member.firstName || member.fullName.split(' ')[0] || '',
            lastName:
                member.lastName ||
                member.fullName.split(' ').slice(1).join(' ') ||
                '',
            phoneNumber: member.phoneNumber || '',
            nationalCode: member.nationalCode || '',
            gender: member.gender || 'Male',
            birthDate: member.birthDate || '2000-01-01',
            emergencyPhone: member.emergencyPhone || '',
            medicalNotes: member.medicalNotes || '',
            isActive: member.isActive ?? true,
            className: member.className,
            sportType: member.sportType,
            trainerName: member.trainerName,
            startTimeHour: member.startTimeHour || '18',
            startTimeMinute: member.startTimeMinute || '00',
            endTimeHour: member.endTimeHour || '19',
            endTimeMinute: member.endTimeMinute || '30',
            paymentStatus: member.paymentStatus,
            joinDate: member.joinDate || '',
            remainingSessions: member.remainingSessions || 10,
        })
        setIsModalOpen(true)
    }

    const handleOpenDetailsModal = (member: Member) => {
        setSelectedMemberDetails(member)
        setIsDetailsModalOpen(true)
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        const fullN = `${formData.firstName} ${formData.lastName}`
        if (editingMember) {
            setMembers(
                members.map((m) =>
                    m.id === editingMember.id
                        ? { ...m, ...formData, fullName: fullN }
                        : m,
                ),
            )
        } else {
            const newMember: Member = {
                ...formData,
                id: Date.now().toString(),
                fullName: fullN,
            }
            setMembers([...members, newMember])
        }
        setIsModalOpen(false)
    }

    const handleOpenDeleteDialog = (id: string) => {
        setDeleteDialog({ isOpen: true, memberId: id })
    }

    const handleConfirmDelete = () => {
        if (deleteDialog.memberId) {
            setMembers(members.filter((m) => m.id !== deleteDialog.memberId))
        }
        setDeleteDialog({ isOpen: false, memberId: null })
    }

    const renderPaymentBadge = (status: Member['paymentStatus']) => {
        switch (status) {
            case 'PAID':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span>تسویه شده</span>
                    </span>
                )
            case 'UNPAID':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[var(--text-war)] border border-rose-200 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-war)] animate-pulse"></span>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[var(--text-war)]" />
                        <span>بدهکار</span>
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>در انتظار بررسی</span>
                    </span>
                )
        }
    }

    return (
        <div
            className="p-6 md:p-8 min-h-screen  font-semibold dir-rtl "
            data-role="ADMIN"
            style={{ fontFamily: 'var(--font-family, inherit)' }}
        >
            {/* هدر اصلی */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[var(--primary)] tracking-tight">
                        مدیریت ورزشکاران
                    </h1>
                    <p className="text-sm text-[var(--primary-deep)] mt-1.5 font-normal">
                        مدیریت پیشرفته اعضا، بررسی وضعیت شهریه، کلاس‌ها و مربیان
                        مجموعه
                    </p>
                </div>

                <Button
                    variant="solid"
                    onClick={handleOpenCreateModal}
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--sidebar-text)',
                    }}
                    className="inline-flex items-center justify-center gap-2.5 hover:opacity-95 px-5 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] shrink-0"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>افزودن ورزشکار جدید</span>
                </Button>
            </div>

            {/* نوار فیلتر و جستجو */}
            <div className="bg-white/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-[var(--primary-mild)]/20 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center relative z-40">
                <div className="w-full md:w-96 relative z-50">
                    <Select<SelectOption>
                        isSearchable
                        isLoading={isPending}
                        placeholder="جستجوی سریع نام یا عنوان کلاس..."
                        noOptionsMessage={() =>
                            isPending ? 'در حال جستجو...' : 'ورزشکاری یافت نشد'
                        }
                        options={searchOptions}
                        onInputChange={handleSearchInputChange}
                        onChange={(opt) => setSearchTerm(opt?.value || '')}
                        className="w-full"
                    />
                </div>

                <div className="w-full md:w-72 relative z-50">
                    <Select<SelectOption>
                        placeholder="فیلتر بر اساس رشته ورزشی"
                        options={SPORT_OPTIONS}
                        value={selectedSport}
                        onChange={(option) =>
                            setSelectedSport(option as SelectOption)
                        }
                        className="w-full"
                    />
                </div>
            </div>

            {/* لیست اعضا */}
            <div className="space-y-4">
                {filteredMembers.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white rounded-2xl border border-[var(--primary-mild)]/20 p-5 shadow-sm hover:shadow-s
                        hover:shadow-[#4B5694] hover:-translate-y-0.5 hover:border-[var(--primary)] transition-all duration-300
                         flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                    >
                        <div className="flex items-center gap-4 min-w-[260px]">
                            <Avatar
                                shape="round"
                                icon={
                                    <TbUser className="w-6 h-6 text-[var(--primary)]" />
                                }
                                className="bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-mild)]/30 shadow-inner w-12 h-12 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                            />
                            <div className="space-y-1.5">
                                <div>
                                    {renderPaymentBadge(member.paymentStatus)}
                                </div>
                                <button
                                    onClick={() =>
                                        handleOpenDetailsModal(member)
                                    }
                                    className="font-bold text-[var(--primary)] text-base hover:text-[var(--primary-deep)] transition-colors text-right block"
                                >
                                    {member.fullName}
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-medium">
                                        {member.sportType}
                                    </span>
                                    {member.phoneNumber && (
                                        <span
                                            className="text-xs text-[var(--primary-deep)] flex items-center gap-1"
                                            dir="ltr"
                                        >
                                            <Phone className="w-3 h-3 text-[var(--primary-deep)]" />
                                            {member.phoneNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* بخش باکس‌های اطلاعات داخل کارت (بزرگ‌تر، عریض‌تر و وسط‌چین) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-3xl">
                            <div className="flex items-center justify-center gap-2.5 bg-[var(--primary-subtle)]/60 px-4 py-2.5 rounded-xl border border-[var(--primary-mild)]/25 shadow-2xs text-center">
                                <div className="p-1.5 rounded-lg bg-white text-[var(--primary)] shrink-0 shadow-2xs">
                                    <Dumbbell className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 leading-tight flex flex-col items-center justify-center">
                                    <span className="text-[var(--primary-deep)] text-[11px] font-medium mb-0.5">
                                        کلاس ثبت‌نامی
                                    </span>
                                    <span
                                        className="font-bold text-[var(--primary)] text-xs sm:text-sm truncate max-w-full block"
                                        title={member.className}
                                    >
                                        {member.className}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2.5 bg-[var(--primary-subtle)]/60 px-4 py-2.5 rounded-xl border border-[var(--primary-mild)]/25 shadow-2xs text-center">
                                <div className="p-1.5 rounded-lg bg-white text-[var(--primary)] shrink-0 shadow-2xs">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 leading-tight flex flex-col items-center justify-center">
                                    <span className="text-[var(--primary-deep)] text-[11px] font-medium mb-0.5">
                                        مربی
                                    </span>
                                    <span
                                        className="font-bold text-[var(--primary)] text-xs sm:text-sm truncate max-w-full block"
                                        title={member.trainerName}
                                    >
                                        {member.trainerName}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2.5 bg-[var(--primary-subtle)]/60 px-4 py-2.5 rounded-xl border border-[var(--primary-mild)]/25 shadow-2xs text-center">
                                <div className="p-1.5 rounded-lg bg-white text-[var(--primary)] shrink-0 shadow-2xs">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 leading-tight flex flex-col items-center justify-center">
                                    <span className="text-[var(--primary-deep)] text-[11px] font-medium mb-0.5">
                                        ساعت سانس
                                    </span>
                                    <span
                                        className="font-bold text-[var(--primary)] text-xs sm:text-sm truncate max-w-full block"
                                        dir="ltr"
                                    >
                                        {member.startTimeHour}:
                                        {member.startTimeMinute} تا{' '}
                                        {member.endTimeHour}:
                                        {member.endTimeMinute}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 bg-[var(--primary-subtle)]/60 p-1.5 rounded-xl border border-[var(--primary-mild)]/20">
                            <button
                                onClick={() => handleOpenDetailsModal(member)}
                                className="p-2 text-[var(--primary-deep)] hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all"
                                title="مشاهده جزئیات کامل"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleOpenEditModal(member)}
                                className="p-2 text-[var(--primary)] hover:text-[var(--primary-deep)] hover:bg-white rounded-lg transition-all"
                                title="ویرایش اطلاعات"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() =>
                                    handleOpenDeleteDialog(member.id)
                                }
                                className="p-2 text-[var(--text-war)] hover:bg-rose-50 rounded-lg transition-all"
                                title="حذف ورزشکار"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* دیالوگ حذف ورزشکار */}
            <Dialog
                isOpen={deleteDialog.isOpen}
                onClose={() =>
                    setDeleteDialog({ isOpen: false, memberId: null })
                }
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
            >
                <div className="p-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[var(--text-war)] flex items-center justify-center mb-4 shadow-xs">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-[var(--primary)] mb-2">
                        تأیید حذف ورزشکار
                    </h3>
                    <p className="text-sm text-[var(--primary-deep)] mb-6 leading-relaxed">
                        آیا از حذف این ورزشکار از لیست باشگاه اطمینان دارید؟
                        تمام سوابق و وضعیت مالی مرتبط با این حساب پاک خواهند شد
                        و این عملیات غیرقابل بازگشت است.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="subtle"
                            onClick={() =>
                                setDeleteDialog({
                                    isOpen: false,
                                    memberId: null,
                                })
                            }
                            className="px-5 py-2.5 rounded-xl font-medium text-[var(--primary-deep)] hover:bg-[var(--primary-subtle)]"
                        >
                            انصراف
                        </Button>
                        <Button
                            variant="solid"
                            style={{
                                backgroundColor: 'var(--text-war)',
                                color: '#fff',
                            }}
                            className="px-5 py-2.5 rounded-xl font-medium shadow-md hover:opacity-90"
                            onClick={handleConfirmDelete}
                        >
                            تأیید و حذف
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* مودال جزئیات کامل ورزشکار */}
            {isDetailsModalOpen && selectedMemberDetails && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg border border-[var(--primary-mild)]/30 shadow-2xl overflow-hidden">
                        <div className="bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[var(--sidebar-text)] font-bold">
                                    {selectedMemberDetails.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--sidebar-text)]">
                                        {selectedMemberDetails.fullName}
                                    </h3>
                                    <p className="text-xs text-[var(--primary-mild)]">
                                        کارت عضویت فعال باشگاه
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[var(--sidebar-text)] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[var(--primary-subtle)]/40 p-4 rounded-2xl border border-[var(--primary-mild)]/20">
                                    <span className="text-xs text-[var(--primary-deep)] block mb-1">
                                        رشته ورزشی
                                    </span>
                                    <span className="font-bold text-[var(--primary)] text-sm">
                                        {selectedMemberDetails.sportType}
                                    </span>
                                </div>
                                <div className="bg-[var(--primary-subtle)]/40 p-4 rounded-2xl border border-[var(--primary-mild)]/20">
                                    <span className="text-xs text-[var(--primary-deep)] block mb-1">
                                        شماره تماس
                                    </span>
                                    <span
                                        className="font-bold text-[var(--primary)] text-sm"
                                        dir="ltr"
                                    >
                                        {selectedMemberDetails.phoneNumber ||
                                            'ثبت نشده'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[var(--primary-subtle)]/40 p-4 rounded-2xl border border-[var(--primary-mild)]/20 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--primary-deep)]">
                                        کد ملی:
                                    </span>
                                    <span
                                        className="font-semibold text-[var(--primary)]"
                                        dir="ltr"
                                    >
                                        {selectedMemberDetails.nationalCode ||
                                            'ثبت نشده'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--primary-deep)]">
                                        عنوان کلاس:
                                    </span>
                                    <span className="font-semibold text-[var(--primary)]">
                                        {selectedMemberDetails.className}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--primary-deep)]">
                                        مربی مسئول:
                                    </span>
                                    <span className="font-semibold text-[var(--primary)]">
                                        {selectedMemberDetails.trainerName}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--primary-deep)]">
                                        تلفن اضطراری:
                                    </span>
                                    <span
                                        className="font-semibold text-[var(--primary)]"
                                        dir="ltr"
                                    >
                                        {selectedMemberDetails.emergencyPhone ||
                                            'ندارد'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--primary-deep)]">
                                        نکات پزشکی:
                                    </span>
                                    <span className="font-semibold text-[var(--primary)]">
                                        {selectedMemberDetails.medicalNotes ||
                                            'ندارد'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div>
                                    <span className="text-xs text-[var(--primary-deep)] block mb-1">
                                        وضعیت حساب مالی
                                    </span>
                                    {renderPaymentBadge(
                                        selectedMemberDetails.paymentStatus,
                                    )}
                                </div>
                                <Button
                                    variant="solid"
                                    style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'var(--sidebar-text)',
                                    }}
                                    onClick={() => {
                                        setIsDetailsModalOpen(false)
                                        handleOpenEditModal(
                                            selectedMemberDetails,
                                        )
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90"
                                >
                                    ویرایش اطلاعات
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* مودال افزودن / ویرایش */}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl">
                    {/* دیو اصلی با قابلیت اسکرول و مخفی‌سازی scrollbar */}
                    <div className="bg-white rounded-2xl w-full max-w-lg border border-[var(--primary-mild)]/30 shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] p-4 flex items-center justify-between">
                            <h2 className="font-bold text-white">
                                {editingMember
                                    ? 'ویرایش اطلاعات ورزشکار'
                                    : 'افزودن ورزشکار جدید'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-[var(--sidebar-text)]/80 hover:text-[var(--sidebar-text)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSave}
                            className="p-5 space-y-4 text-xs"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[var(--primary)] mb-1">
                                        نام
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                firstName: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-[var(--primary-mild)]/40 rounded-xl text-sm text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                                        placeholder="مثال: علی"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[var(--primary)] mb-1">
                                        نام خانوادگی
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                lastName: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-[var(--primary-mild)]/40 rounded-xl text-sm text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                                        placeholder="مثال: رضایی"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[var(--primary)] mb-1">
                                        شماره تماس
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={11}
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phoneNumber:
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-[var(--primary-mild)]/40 rounded-xl text-sm text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                                        placeholder="09123456789"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[var(--primary)] mb-1">
                                        کد ملی
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={10}
                                        value={formData.nationalCode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nationalCode:
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-[var(--primary-mild)]/40 rounded-xl text-sm text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                                        placeholder="0012345678"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* استفاده از کامپوننت Select دیزاین سیستم پروژه برای جنسیت */}
                                <div>
                                    <label className="block font-semibold text-[var(--primary)] mb-1">
                                        جنسیت
                                    </label>
                                    <Select<SelectOption>
                                        options={GENDER_OPTIONS}
                                        value={GENDER_OPTIONS.find(
                                            (opt) =>
                                                opt.value === formData.gender,
                                        )}
                                        onChange={(opt) =>
                                            setFormData({
                                                ...formData,
                                                gender: ((opt as SelectOption)
                                                    ?.value || 'Male') as
                                                    | 'Male'
                                                    | 'Female',
                                            })
                                        }
                                    />
                                </div>

                                {/* تاریخ تولد شمسی */}
                                <div>
                                    <label className="block font-semibold text-[var(--primary)] mb-1">
                                        تاریخ تولد
                                    </label>
                                    <div className="relative w-full">
                                        <DatePicker />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-[var(--primary)] mb-1">
                                    تلفن اضطراری (اختیاری)
                                </label>
                                <input
                                    type="text"
                                    maxLength={11}
                                    value={formData.emergencyPhone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            emergencyPhone:
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-[var(--primary-mild)]/40 rounded-xl text-sm text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                                    placeholder="0912... یا شماره ثابت"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[var(--primary)] mb-1">
                                    نکات پزشکی و سلامتی (اختیاری)
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.medicalNotes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            medicalNotes: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-[var(--primary-mild)]/40 rounded-xl text-sm text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] resize-none"
                                    placeholder="سوابق بیماری، حساسیت دارویی یا آسیب‌دیدگی خاص..."
                                />
                            </div>

                            {editingMember && (
                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="isActiveCheck"
                                        checked={formData.isActive}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isActive: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-[var(--primary)] rounded border-[var(--primary-mild)] focus:ring-[var(--primary)]"
                                    />
                                    <label
                                        htmlFor="isActiveCheck"
                                        className="font-semibold text-[var(--primary)] cursor-pointer"
                                    >
                                        حساب کاربری فعال باشد
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--primary-mild)]/20">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-[var(--primary-deep)] hover:bg-[var(--primary-subtle)] font-medium transition-colors"
                                >
                                    انصراف
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'var(--sidebar-text)',
                                    }}
                                    className="px-5 py-2 hover:opacity-90 rounded-xl font-medium transition-all shadow-sm"
                                >
                                    {editingMember
                                        ? 'ذخیره تغییرات'
                                        : 'ثبت نام ورزشکار'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlinePhone,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserAdd,
  HiOutlineX,
} from "react-icons/hi";

import { FaDumbbell } from "react-icons/fa";

import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";

import ApiService from "@/services/client/ApiService";

import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type ApiGender = "Male" | "Female";

type SubscriptionStatus =
  | "PendingPayment"
  | "Paid"
  | "Active"
  | "Expired"
  | "Cancelled"
  | string;

type DayOfWeek =
  | "Saturday"
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | string;

interface SelectOption {
  value: string;
  label: string;
}

/**
 * GET /members
 */
interface MemberListItemResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  birthDate: string;
  joinDate: string;
}

/**
 * POST /members
 */
interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  medicalNotes: string;
  emergencyPhone: string;
  birthDate: string;
}

/**
 * POST /members response
 */
interface MemberCreatedResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  birthDate: string;
  joinDate: string;
}

/**
 * GET /members/{id}
 */
interface MemberResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  birthDate: string;
  joinDate: string;
}

/**
 * PUT /members/{id}
 */
interface UpdateMemberRequest extends CreateMemberRequest {
  isActive: boolean;
}

/**
 * GET /members/{id}/details -> subscriptions[]
 */
interface MemberSubscriptionResponse {
  subscriptionId: number;
  packageName: string;
  trainerFullName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  remainingSessions: number;
  status: SubscriptionStatus;
}

/**
 * GET /members/{id}/details -> courses[].schedules[]
 */
interface MemberScheduleResponse {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

/**
 * GET /members/{id}/details -> courses[].attendances[]
 */
interface MemberAttendanceResponse {
  attendanceDate: string;
  isPresent: boolean;
}

/**
 * GET /members/{id}/details -> courses[]
 */
interface MemberCourseResponse {
  enrollmentId: number;
  classId: number;
  classTitle: string;
  groupName: string;
  sportName: string;
  trainerFullName: string;
  schedules: MemberScheduleResponse[];
  attendances: MemberAttendanceResponse[];
}

/**
 * GET /members/{id}/details
 */
interface MemberDetailsResponse extends MemberResponse {
  medicalNotes: string | null;
  emergencyPhone: string | null;
  isActive: boolean;
  subscriptions: MemberSubscriptionResponse[];
  courses: MemberCourseResponse[];
}

/**
 * دادهٔ مورد استفاده در لیست UI
 */
interface MemberTableItem {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  birthDate: string;
  joinDate: string;
}

/**
 * دادهٔ فرم ثبت و ویرایش.
 *
 * birthDate در state به‌شکل شمسی نگهداری می‌شود،
 * ولی قبل از ارسال به API به تاریخ میلادی تبدیل خواهد شد.
 */
interface MemberFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  birthDate: DateObject | null;
  emergencyPhone: string;
  medicalNotes: string;
  isActive: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const MEMBERS_ENDPOINT = "/members";

const GENDER_OPTIONS: SelectOption[] = [
  {
    value: "Male",
    label: "مرد",
  },
  {
    value: "Female",
    label: "زن",
  },
];

const INITIAL_FORM_DATA: MemberFormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  nationalCode: "",
  gender: "Male",
  birthDate: null,
  emergencyPhone: "",
  medicalNotes: "",
  isActive: true,
};

const DAY_OF_WEEK_LABELS: Record<string, string> = {
  Saturday: "شنبه",
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنج‌شنبه",
  Friday: "جمعه",
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/**
 * تبدیل مقدار DatePicker شمسی به تاریخ میلادی مورد نیاز API.
 *
 * مثال:
 * 1403/02/01 -> 2024-04-20
 */
const toGregorianDateString = (
  jalaliDate: DateObject | null
): string => {
  if (!jalaliDate) {
    return "";
  }

  return new DateObject(jalaliDate)
    .convert(gregorian, gregorian_en)
    .format("YYYY-MM-DD");
};

/**
 * تبدیل تاریخ میلادی دریافتی از API به مقدار قابل استفاده
 * در DatePicker شمسی، برای حالت ویرایش.
 *
 * مثال:
 * 2024-04-20 -> 1403/02/01
 */
const toJalaliDateObject = (
  gregorianDateString?: string | null
): DateObject | null => {
  if (!gregorianDateString) {
    return null;
  }

  return new DateObject({
    date: gregorianDateString,
    format: "YYYY-MM-DD",
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
};

const formatDate = (date?: string | null): string => {
  if (!date) {
    return "ثبت نشده";
  }

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("fa-IR").format(value);
};

const getGenderLabel = (gender: ApiGender): string => {
  return gender === "Female" ? "زن" : "مرد";
};

const getDayOfWeekLabel = (day: DayOfWeek): string => {
  return DAY_OF_WEEK_LABELS[day] ?? day;
};

const mapMemberToTableItem = (
  member: MemberListItemResponse
): MemberTableItem => {
  return {
    id: member.id,
    firstName: member.firstName ?? "",
    lastName: member.lastName ?? "",
    fullName: `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
    phoneNumber: member.phoneNumber ?? "",
    nationalCode: member.nationalCode ?? "",
    gender: member.gender,
    birthDate: member.birthDate,
    joinDate: member.joinDate,
  };
};

const mapFormToCreateRequest = (
  formData: MemberFormData
): CreateMemberRequest => {
  const gregorianBirthDate = toGregorianDateString(formData.birthDate);

  if (!gregorianBirthDate) {
    throw new Error("انتخاب تاریخ تولد الزامی است.");
  }

  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    nationalCode: formData.nationalCode.trim(),
    gender: formData.gender,
    birthDate: gregorianBirthDate,
    emergencyPhone: formData.emergencyPhone.trim(),
    medicalNotes: formData.medicalNotes.trim(),
  };
};

const getSubscriptionStatus = (status: SubscriptionStatus) => {
  switch (status) {
    case "Paid":
    case "Active":
      return {
        label: "فعال / پرداخت شده",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "PendingPayment":
      return {
        label: "در انتظار پرداخت",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "Expired":
      return {
        label: "منقضی شده",
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };

    case "Cancelled":
      return {
        label: "لغو شده",
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };

    default:
      return {
        label: status || "نامشخص",
        className:
          "border-[var(--primary-mild)]/30 bg-[var(--primary-subtle)] text-[var(--primary)]",
      };
  }
};

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export default function MembersManagementPage() {
  const [members, setMembers] = useState<MemberTableItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [formData, setFormData] =
    useState<MemberFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [memberDetails, setMemberDetails] =
    useState<MemberDetailsResponse | null>(null);

  const [deleteMemberId, setDeleteMemberId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  /* ------------------------------------------------------------------------ */
  /*                              Error handling                              */
  /* ------------------------------------------------------------------------ */

  const showError = (title: string, error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "عملیات موردنظر با خطا مواجه شد. لطفاً دوباره تلاش کنید.";

    setErrorDialog({
      isOpen: true,
      title,
      message,
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  /* ------------------------------------------------------------------------ */
  /*                          GET /members - List                             */
  /* ------------------------------------------------------------------------ */

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoadingMembers(true);

      const response =
        await ApiService.fetchDataWithAxios<MemberListItemResponse[]>({
          url: MEMBERS_ENDPOINT,
          method: "get",
        });

      setMembers(Array.isArray(response) ? response.map(mapMemberToTableItem) : []);
    } catch (error) {
      setMembers([]);
      showError("خطا در دریافت ورزشکاران", error);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ------------------------------------------------------------------------ */
  /*                                  Search                                  */
  /* ------------------------------------------------------------------------ */

  const filteredMembers = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    if (!searchValue) {
      return members;
    }

    return members.filter((member) => {
      return (
        member.fullName.toLowerCase().includes(searchValue) ||
        member.phoneNumber.includes(searchValue) ||
        member.nationalCode.includes(searchValue)
      );
    });
  }, [members, searchTerm]);

  /* ------------------------------------------------------------------------ */
  /*                          Create member modal                             */
  /* ------------------------------------------------------------------------ */

  const openCreateModal = () => {
    setEditingMemberId(null);
    setFormData(INITIAL_FORM_DATA);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (isSaving) {
      return;
    }

    setIsFormModalOpen(false);
    setEditingMemberId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  /* ------------------------------------------------------------------------ */
  /*                    GET member + details for editing                      */
  /* ------------------------------------------------------------------------ */

  const openEditModal = async (memberId: number) => {
    try {
      setIsLoadingDetails(true);

      const [member, details] = await Promise.all([
        ApiService.fetchDataWithAxios<MemberResponse>({
          url: `${MEMBERS_ENDPOINT}/${memberId}`,
          method: "get",
        }),

        ApiService.fetchDataWithAxios<MemberDetailsResponse>({
          url: `${MEMBERS_ENDPOINT}/${memberId}/details`,
          method: "get",
        }),
      ]);

      setEditingMemberId(memberId);

      setFormData({
        firstName: member.firstName ?? "",
        lastName: member.lastName ?? "",
        phoneNumber: member.phoneNumber ?? "",
        nationalCode: member.nationalCode ?? "",
        gender: member.gender ?? "Male",

        // تاریخ میلادی API => تاریخ شمسی DatePicker
        birthDate: toJalaliDateObject(member.birthDate),

        emergencyPhone: details.emergencyPhone ?? "",
        medicalNotes: details.medicalNotes ?? "",
        isActive: details.isActive ?? true,
      });

      setIsFormModalOpen(true);
    } catch (error) {
      showError("خطا در دریافت اطلاعات ورزشکار", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                            POST / PUT - Save                             */
  /* ------------------------------------------------------------------------ */

  const handleSaveMember = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setIsSaving(true);

      const createPayload = mapFormToCreateRequest(formData);

      if (editingMemberId === null) {
        await ApiService.fetchDataWithAxios<
          MemberCreatedResponse,
          CreateMemberRequest
        >({
          url: MEMBERS_ENDPOINT,
          method: "post",
          data: createPayload,
        });
      } else {
        const updatePayload: UpdateMemberRequest = {
          ...createPayload,
          isActive: formData.isActive,
        };

        const isUpdated = await ApiService.fetchDataWithAxios<
          boolean,
          UpdateMemberRequest
        >({
          url: `${MEMBERS_ENDPOINT}/${editingMemberId}`,
          method: "put",
          data: updatePayload,
        });

        if (!isUpdated) {
          throw new Error("ویرایش ورزشکار توسط سرور تأیید نشد.");
        }
      }

      await fetchMembers();
      closeFormModal();
    } catch (error) {
      showError(
        editingMemberId === null
          ? "خطا در ثبت ورزشکار"
          : "خطا در ویرایش ورزشکار",
        error
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                       GET /members/{id}/details                          */
  /* ------------------------------------------------------------------------ */

  const openDetailsModal = async (memberId: number) => {
    try {
      setIsLoadingDetails(true);
      setMemberDetails(null);
      setIsDetailsModalOpen(true);

      const response =
        await ApiService.fetchDataWithAxios<MemberDetailsResponse>({
          url: `${MEMBERS_ENDPOINT}/${memberId}/details`,
          method: "get",
        });

      setMemberDetails(response);
    } catch (error) {
      setIsDetailsModalOpen(false);
      showError("خطا در دریافت جزئیات ورزشکار", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setMemberDetails(null);
  };

  /* ------------------------------------------------------------------------ */
  /*                        DELETE /members/{id}                              */
  /* ------------------------------------------------------------------------ */

  const confirmDeactivateMember = async () => {
    if (deleteMemberId === null) {
      return;
    }

    try {
      setIsDeleting(true);

      const isDeactivated =
        await ApiService.fetchDataWithAxios<boolean>({
          url: `${MEMBERS_ENDPOINT}/${deleteMemberId}`,
          method: "delete",
        });

      if (!isDeactivated) {
        throw new Error("غیرفعال‌سازی ورزشکار توسط سرور تأیید نشد.");
      }

      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== deleteMemberId)
      );

      setDeleteMemberId(null);
    } catch (error) {
      showError("خطا در غیرفعال‌سازی ورزشکار", error);
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                    UI                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen p-5 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--primary)] md:text-3xl">
            مدیریت ورزشکاران
          </h1>

          <p className="mt-2 text-sm font-normal text-[var(--primary-deep)]">
            ثبت، ویرایش، غیرفعال‌سازی و مشاهده سوابق ورزشکاران
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--sidebar-text)] shadow-md shadow-[var(--primary)]/20 transition hover:opacity-90"
        >
          <HiOutlineUserAdd className="h-5 w-5" />
          افزودن ورزشکار جدید
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[var(--primary-mild)]/20 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="جستجو با نام، شماره تماس یا کد ملی..."
            className="w-full rounded-xl border border-[var(--primary-mild)]/30 px-4 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          />
        </div>

        <button
          type="button"
          onClick={fetchMembers}
          disabled={isLoadingMembers}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--primary-mild)]/30 bg-[var(--primary-subtle)] px-4 py-2.5 text-sm font-semibold text-[var(--primary)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiOutlineRefresh
            className={`h-5 w-5 ${isLoadingMembers ? "animate-spin" : ""}`}
          />
          به‌روزرسانی
        </button>
      </div>

      {/* Loading */}
      {isLoadingMembers && (
        <div className="rounded-2xl border border-[var(--primary-mild)]/20 bg-white p-12 text-center text-sm text-[var(--primary-mild)]">
          در حال دریافت فهرست ورزشکاران...
        </div>
      )}

      {/* Members */}
      {!isLoadingMembers && (
        <div className="space-y-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-5 rounded-2xl border border-[var(--primary-mild)]/20 bg-white p-5 shadow-sm transition hover:border-[var(--primary-mild)]/60 hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-[250px] items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-xl font-black text-[var(--primary)]">
                    {member.firstName.charAt(0)}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(member.id)}
                        className="text-right text-base font-bold text-[var(--primary)] hover:underline"
                      >
                        {member.fullName}
                      </button>

                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        فعال
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--primary-deep)]">
                      <span>{getGenderLabel(member.gender)}</span>
                      <span>•</span>
                      <span dir="ltr">{member.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[var(--primary-subtle)]/50 p-3">
                    <span className="mb-1 flex items-center gap-1 text-[11px] text-[var(--primary-deep)]">
                      <HiOutlineCalendar className="h-4 w-4" />
                      تاریخ عضویت
                    </span>

                    <p className="text-xs font-bold text-[var(--primary)]">
                      {formatDate(member.joinDate)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[var(--primary-subtle)]/50 p-3">
                    <span className="mb-1 flex items-center gap-1 text-[11px] text-[var(--primary-deep)]">
                      <HiOutlineUser className="h-4 w-4" />
                      کد ملی
                    </span>

                    <p
                      className="text-xs font-bold text-[var(--primary)]"
                      dir="ltr"
                    >
                      {member.nationalCode}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[var(--primary-subtle)]/50 p-3">
                    <span className="mb-1 flex items-center gap-1 text-[11px] text-[var(--primary-deep)]">
                      <FaDumbbell className="h-3.5 w-3.5" />
                      کلاس و اشتراک
                    </span>

                    <button
                      type="button"
                      onClick={() => openDetailsModal(member.id)}
                      className="text-xs font-bold text-[var(--primary)] hover:underline"
                    >
                      مشاهده جزئیات
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openDetailsModal(member.id)}
                    title="مشاهده جزئیات"
                    className="rounded-xl p-2.5 text-[var(--primary)] transition hover:bg-[var(--primary-subtle)]"
                  >
                    <HiOutlineEye className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(member.id)}
                    title="ویرایش ورزشکار"
                    className="rounded-xl p-2.5 text-[var(--primary)] transition hover:bg-[var(--primary-subtle)]"
                  >
                    <HiOutlinePencilAlt className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteMemberId(member.id)}
                    title="غیرفعال‌سازی ورزشکار"
                    className="rounded-xl p-2.5 text-rose-600 transition hover:bg-rose-50"
                  >
                    <HiOutlineTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--primary-mild)]/35 bg-white p-12 text-center">
              <HiOutlineAcademicCap className="mx-auto h-10 w-10 text-[var(--primary-mild)]" />

              <p className="mt-4 font-bold text-[var(--primary)]">
                ورزشکاری پیدا نشد.
              </p>

              <p className="mt-2 text-xs text-[var(--primary-mild)]">
                جستجو را تغییر دهید یا ورزشکار جدیدی ثبت کنید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                      Create / Edit Member Modal                    */}
      {/* ------------------------------------------------------------------ */}

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--primary-mild)]/30 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between bg-[var(--sidebar-bg)] p-4 text-[var(--sidebar-text)]">
              <div>
                <h2 className="font-bold">
                  {editingMemberId === null
                    ? "افزودن ورزشکار جدید"
                    : "ویرایش اطلاعات ورزشکار"}
                </h2>

                <p className="mt-1 text-[11px] font-normal text-[var(--primary-mild)]">
                  تاریخ تولد را با تقویم شمسی وارد کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSaving}
                className="rounded-lg p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                title="بستن"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveMember}
              className="space-y-4 p-5 text-xs"
            >
              {/* Name */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block font-bold text-[var(--primary)]"
                  >
                    نام <span className="text-rose-600">*</span>
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="مثال: علی"
                    className="w-full rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block font-bold text-[var(--primary)]"
                  >
                    نام خانوادگی <span className="text-rose-600">*</span>
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="مثال: رضایی"
                    className="w-full rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>
              </div>

              {/* Phone / national code */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-1.5 block font-bold text-[var(--primary)]"
                  >
                    شماره تماس <span className="text-rose-600">*</span>
                  </label>

                  <input
                    id="phoneNumber"
                    type="text"
                    required
                    maxLength={11}
                    inputMode="numeric"
                    value={formData.phoneNumber}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phoneNumber: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="09123456789"
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nationalCode"
                    className="mb-1.5 block font-bold text-[var(--primary)]"
                  >
                    کد ملی <span className="text-rose-600">*</span>
                  </label>

                  <input
                    id="nationalCode"
                    type="text"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.nationalCode}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        nationalCode: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="0012345678"
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>
              </div>

              {/* Gender / Jalali birthDate */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-bold text-[var(--primary)]">
                    جنسیت <span className="text-rose-600">*</span>
                  </label>

                  <Select<SelectOption>
                    options={GENDER_OPTIONS}
                    value={
                      GENDER_OPTIONS.find(
                        (item) => item.value === formData.gender
                      ) ?? GENDER_OPTIONS[0]
                    }
                    onChange={(option) =>
                      setFormData((current) => ({
                        ...current,
                        gender: (option?.value ?? "Male") as ApiGender,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-bold text-[var(--primary)]">
                    تاریخ تولد <span className="text-rose-600">*</span>
                  </label>

                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={formData.birthDate}
                    onChange={(date: DateObject | null) =>
                      setFormData((current) => ({
                        ...current,
                        birthDate: date,
                      }))
                    }
                    calendarPosition="bottom-right"
                    placeholder="انتخاب تاریخ تولد"
                    inputClass="w-full rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />

                  {!formData.birthDate && (
                    <p className="mt-1 text-[10px] font-normal text-[var(--primary-mild)]">
                      تاریخ را با تقویم شمسی انتخاب کنید.
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency phone */}
              <div>
                <label
                  htmlFor="emergencyPhone"
                  className="mb-1.5 block font-bold text-[var(--primary)]"
                >
                  شماره تماس ضروری{" "}
                  <span className="font-normal text-[var(--primary-mild)]">
                    (اختیاری)
                  </span>
                </label>

                <input
                  id="emergencyPhone"
                  type="text"
                  maxLength={11}
                  inputMode="numeric"
                  value={formData.emergencyPhone}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      emergencyPhone: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="09123456789"
                  dir="ltr"
                  className="w-full rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
              </div>

              {/* Medical notes */}
              <div>
                <label
                  htmlFor="medicalNotes"
                  className="mb-1.5 block font-bold text-[var(--primary)]"
                >
                  نکات پزشکی و سلامتی{" "}
                  <span className="font-normal text-[var(--primary-mild)]">
                    (اختیاری)
                  </span>
                </label>

                <textarea
                  id="medicalNotes"
                  rows={4}
                  value={formData.medicalNotes}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      medicalNotes: event.target.value,
                    }))
                  }
                  placeholder="مانند آسیب‌دیدگی، سابقه بیماری، حساسیت دارویی و..."
                  className="w-full resize-none rounded-xl border border-[var(--primary-mild)]/40 px-3 py-2.5 text-sm leading-6 text-[var(--primary)] outline-none transition placeholder:text-[var(--primary-mild)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                />
              </div>

              {/* Is active - only edit */}
              {editingMemberId !== null && (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--primary-mild)]/20 bg-[var(--primary-subtle)]/50 p-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 cursor-pointer rounded border-[var(--primary-mild)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />

                  <label
                    htmlFor="isActive"
                    className="cursor-pointer font-bold text-[var(--primary)]"
                  >
                    حساب ورزشکار فعال باشد
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--primary-mild)]/20 pt-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={closeFormModal}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--primary-deep)] transition hover:bg-[var(--primary-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--sidebar-text)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "در حال ذخیره..."
                    : editingMemberId === null
                    ? "ثبت ورزشکار"
                    : "ذخیره تغییرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                         Member details modal                       */}
      {/* ------------------------------------------------------------------ */}

      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--primary-mild)]/30 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[var(--sidebar-bg)] p-5 text-[var(--sidebar-text)]">
              <div>
                <h2 className="font-bold">
                  {memberDetails
                    ? `${memberDetails.firstName} ${memberDetails.lastName}`
                    : "جزئیات ورزشکار"}
                </h2>

                <p className="mt-1 text-[11px] font-normal text-[var(--primary-mild)]">
                  کلاس‌ها، سانس‌ها، اشتراک‌ها و سوابق حضور
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-lg p-1 transition hover:bg-white/10"
                title="بستن"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {isLoadingDetails && (
              <div className="p-12 text-center text-sm text-[var(--primary-mild)]">
                در حال دریافت جزئیات ورزشکار...
              </div>
            )}

            {!isLoadingDetails && memberDetails && (
              <div className="space-y-7 p-5">
                {/* Personal details */}
                <section>
                  <h3 className="mb-3 text-sm font-black text-[var(--primary)]">
                    اطلاعات فردی
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-[var(--primary-subtle)]/60 p-3">
                      <span className="text-[11px] text-[var(--primary-deep)]">
                        شماره تماس
                      </span>

                      <p
                        className="mt-1 text-xs font-bold text-[var(--primary)]"
                        dir="ltr"
                      >
                        {memberDetails.phoneNumber}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--primary-subtle)]/60 p-3">
                      <span className="text-[11px] text-[var(--primary-deep)]">
                        کد ملی
                      </span>

                      <p
                        className="mt-1 text-xs font-bold text-[var(--primary)]"
                        dir="ltr"
                      >
                        {memberDetails.nationalCode}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--primary-subtle)]/60 p-3">
                      <span className="text-[11px] text-[var(--primary-deep)]">
                        تاریخ تولد
                      </span>

                      <p className="mt-1 text-xs font-bold text-[var(--primary)]">
                        {formatDate(memberDetails.birthDate)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--primary-subtle)]/60 p-3">
                      <span className="text-[11px] text-[var(--primary-deep)]">
                        وضعیت حساب
                      </span>

                      <p className="mt-1 text-xs font-bold text-[var(--primary)]">
                        {memberDetails.isActive ? "فعال" : "غیرفعال"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[var(--primary-mild)]/20 p-3">
                      <span className="text-[11px] text-[var(--primary-deep)]">
                        شماره تماس ضروری
                      </span>

                      <p
                        className="mt-1 text-xs font-bold text-[var(--primary)]"
                        dir="ltr"
                      >
                        {memberDetails.emergencyPhone || "ثبت نشده"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--primary-mild)]/20 p-3">
                      <span className="text-[11px] text-[var(--primary-deep)]">
                        نکات پزشکی
                      </span>

                      <p className="mt-1 text-xs font-bold leading-6 text-[var(--primary)]">
                        {memberDetails.medicalNotes || "ثبت نشده"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Subscriptions */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--primary)]">
                    <HiOutlineCheckCircle className="h-5 w-5" />
                    اشتراک‌ها و وضعیت پرداخت
                  </h3>

                  {memberDetails.subscriptions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--primary-mild)]/30 p-4 text-center text-xs text-[var(--primary-mild)]">
                      اشتراکی برای این ورزشکار ثبت نشده است.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memberDetails.subscriptions.map((subscription) => {
                        const status = getSubscriptionStatus(
                          subscription.status
                        );

                        return (
                          <div
                            key={subscription.subscriptionId}
                            className="rounded-xl border border-[var(--primary-mild)]/20 p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-bold text-[var(--primary)]">
                                  {subscription.packageName}
                                </p>

                                <p className="mt-1 text-xs text-[var(--primary-deep)]">
                                  مربی: {subscription.trainerFullName}
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="rounded-lg bg-[var(--primary-subtle)]/50 p-2.5">
                                <span className="text-[10px] text-[var(--primary-deep)]">
                                  بازه اشتراک
                                </span>

                                <p className="mt-1 text-xs font-bold text-[var(--primary)]">
                                  {formatDate(subscription.startDate)} تا{" "}
                                  {formatDate(subscription.endDate)}
                                </p>
                              </div>

                              <div className="rounded-lg bg-[var(--primary-subtle)]/50 p-2.5">
                                <span className="text-[10px] text-[var(--primary-deep)]">
                                  تعداد جلسات
                                </span>

                                <p className="mt-1 text-xs font-bold text-[var(--primary)]">
                                  {formatNumber(subscription.totalSessions)} جلسه
                                </p>
                              </div>

                              <div className="rounded-lg bg-[var(--primary-subtle)]/50 p-2.5">
                                <span className="text-[10px] text-[var(--primary-deep)]">
                                  جلسات باقی‌مانده
                                </span>

                                <p className="mt-1 text-xs font-bold text-[var(--primary)]">
                                  {formatNumber(
                                    subscription.remainingSessions
                                  )}{" "}
                                  جلسه
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Courses */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--primary)]">
                    <FaDumbbell className="h-4 w-4" />
                    کلاس‌ها، سانس‌ها و حضور و غیاب
                  </h3>

                  {memberDetails.courses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--primary-mild)]/30 p-4 text-center text-xs text-[var(--primary-mild)]">
                      این ورزشکار در هیچ کلاسی ثبت‌نام نشده است.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {memberDetails.courses.map((course) => (
                        <div
                          key={course.enrollmentId}
                          className="rounded-xl border border-[var(--primary-mild)]/20 p-4"
                        >
                          <div className="mb-4">
                            <p className="font-bold text-[var(--primary)]">
                              {course.classTitle}
                            </p>

                            <p className="mt-1 text-xs text-[var(--primary-deep)]">
                              رشته: {course.sportName} | گروه:{" "}
                              {course.groupName || "ندارد"} | مربی:{" "}
                              {course.trainerFullName}
                            </p>
                          </div>

                          <div className="mb-4">
                            <p className="mb-2 text-xs font-bold text-[var(--primary)]">
                              سانس‌های کلاس
                            </p>

                            {course.schedules.length === 0 ? (
                              <p className="text-xs text-[var(--primary-mild)]">
                                سانسی برای این کلاس ثبت نشده است.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {course.schedules.map((schedule, index) => (
                                  <div
                                    key={`${course.enrollmentId}-${index}`}
                                    className="flex items-center justify-between rounded-lg bg-[var(--primary-subtle)]/60 p-3"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
                                      <HiOutlineCalendar className="h-4 w-4" />
                                      {getDayOfWeekLabel(schedule.dayOfWeek)}
                                    </span>

                                    <span
                                      className="flex items-center gap-1 text-xs font-bold text-[var(--primary-deep)]"
                                      dir="ltr"
                                    >
                                      <HiOutlineClock className="h-4 w-4" />
                                      {schedule.startTime} - {schedule.endTime}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="mb-2 text-xs font-bold text-[var(--primary)]">
                              سوابق حضور و غیاب
                            </p>

                            {course.attendances.length === 0 ? (
                              <p className="text-xs text-[var(--primary-mild)]">
                                سابقهٔ حضور و غیابی وجود ندارد.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {course.attendances.map(
                                  (attendance, index) => (
                                    <span
                                      key={`${course.enrollmentId}-attendance-${index}`}
                                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                                        attendance.isPresent
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-rose-50 text-rose-700"
                                      }`}
                                    >
                                      {formatDate(attendance.attendanceDate)}:{" "}
                                      {attendance.isPresent ? "حاضر" : "غایب"}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="flex justify-end border-t border-[var(--primary-mild)]/20 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const id = memberDetails.id;
                      closeDetailsModal();
                      openEditModal(id);
                    }}
                    className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--sidebar-text)] transition hover:opacity-90"
                  >
                    ویرایش اطلاعات
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                         Deactivate dialog                          */}
      {/* ------------------------------------------------------------------ */}

      {deleteMemberId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <HiOutlineExclamationCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-black text-[var(--primary)]">
              غیرفعال‌سازی ورزشکار
            </h2>

            <p className="mt-2 text-sm leading-7 text-[var(--primary-deep)]">
              آیا از غیرفعال‌سازی این ورزشکار اطمینان دارید؟ این عملیات مطابق
              API حذف دائمی نیست و حساب عضو را غیرفعال می‌کند.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteMemberId(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--primary-deep)] transition hover:bg-[var(--primary-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeactivateMember}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "در حال انجام..." : "تأیید غیرفعال‌سازی"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                         Central error dialog                       */}
      {/* ------------------------------------------------------------------ */}

      {errorDialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
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
      )}
    </div>
  );
}

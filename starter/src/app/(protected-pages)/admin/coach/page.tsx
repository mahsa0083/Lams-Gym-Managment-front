"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import Image from "next/image";

import Select from "@/components/ui/Select";
import ApiErrorDialog from "@/components/common/ApiErrorDialog";
import ApiService from "@/services/client/ApiService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

import TrainerFormModal, {
  type CreateTrainerDto,
} from "./addcoach/Insertcoach";

import {
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCash,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePlusCircle,
  HiOutlineCalendar,
  HiOutlineExclamation,
} from "react-icons/hi";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type ApiGender = "Male" | "Female";
type FormGender = 0| 1;

type ApiDayOfWeek =
  | "Saturday"
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

interface OptionType {
  value: string;
  label: string;
}

/**
 * پاسخ GET /api/trainers
 */
interface TrainerListItemResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  userActive: boolean;
  trainerActive: boolean;
  specialty: string | null;
  baseSalary: number;
  commissionPercentage: number;
}

/**
 * schedules داخل هر کلاس در پاسخ جزئیات مربی
 */
interface TrainerClassScheduleResponse {
  dayOfWeek: ApiDayOfWeek;
  startTime: string;
  endTime: string;
}

/**
 * classes داخل پاسخ GET /api/trainers/{id}
 */
interface TrainerClassResponse {
  gymClassId: number;
  title: string;
  sportName: string;
  capacity: number;
  schedules: TrainerClassScheduleResponse[];
}

/**
 * پاسخ GET /api/trainers/{id}
 */
interface TrainerDetailsResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  userActive: boolean;
  trainerActive: boolean;
  createdAt: string;
  specialty: string | null;
  baseSalary: number;
  commissionPercentage: number;
  totalStudents: number;
  totalActiveClasses: number;
  classes: TrainerClassResponse[];
}

/**
 * بدنه POST /api/trainers
 */
interface CreateTrainerRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: ApiGender;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
}

/**
 * بدنه PUT /api/trainers/{id}
 */
interface UpdateTrainerRequest extends CreateTrainerRequest {
  trainerActive: boolean;
}

/**
 * مدل مورد استفاده فقط برای UI صفحه
 */
interface TrainerTableItem {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
  avatar: string;
}

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const TRAINERS_ENDPOINT = "/trainers";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300";

const filterOptions: OptionType[] = [
  { value: "all", label: "همه رشته‌های ورزشی" },
  { value: "bodybuilding", label: "بدنسازی و پرورشی" },
  { value: "fitness", label: "فیتنس و کراس‌فیت" },
  { value: "yoga", label: "یوگا و مدیتیشن" },
];

const DAY_OF_WEEK_LABELS: Record<ApiDayOfWeek, string> = {
  Saturday: "شنبه",
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنج‌شنبه",
  Friday: "جمعه",
};

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

const toPersianNumber = (value: number) => {
  return new Intl.NumberFormat("fa-IR").format(value);
};

const formatMoney = (value: number) => {
  return `${toPersianNumber(value)} تومان`;
};

const formatPercentage = (value: number) => {
  return `${toPersianNumber(value)}٪`;
};

const mapApiGenderToFormGender = (gender: ApiGender): FormGender => {
  return gender === "Female" ? 1 : 0;
};

const mapFormGenderToApiGender = (
  gender: CreateTrainerDto["gender"]
): ApiGender => {
  return gender === 1 ? "Female" : "Male";
};

const mapFormToCreateRequest = (
  form: CreateTrainerDto
): CreateTrainerRequest => {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    nationalCode: form.nationalCode.trim(),
    gender: mapFormGenderToApiGender(form.gender),
    specialty: form.specialty?.trim() ?? "",
    baseSalary: Number(form.baseSalary) || 0,
    commissionPercentage: Number(form.commissionPercentage) || 0,
  };
};

const mapListResponseToTableItem = (
  trainer: TrainerListItemResponse
): TrainerTableItem => {
  return {
    id: trainer.id,
    firstName: trainer.firstName ?? "",
    lastName: trainer.lastName ?? "",
    phone: trainer.phoneNumber ?? "",
    specialty: trainer.specialty ?? "تعیین نشده",
    baseSalary: trainer.baseSalary ?? 0,
    commissionPercentage: trainer.commissionPercentage ?? 0,
    avatar: DEFAULT_AVATAR,
  };
};

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function AdminTrainersListPage() {
  const [trainers, setTrainers] = useState<TrainerTableItem[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<OptionType | null>(filterOptions[0]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOptions, setSearchOptions] = useState<OptionType[]>([]);
  const [isPending, startTransition] = useTransition();

  const [expandedTrainerId, setExpandedTrainerId] = useState<number | null>(
    null
  );

  /**
   * اطلاعات جزئیات هر مربی، شامل کلاس‌ها و سانس‌ها.
   * کلید: trainerId
   */
  const [trainerDetailsById, setTrainerDetailsById] = useState<
    Record<number, TrainerDetailsResponse>
  >({});

  const [loadingDetailsTrainerId, setLoadingDetailsTrainerId] = useState<
    number | null
  >(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(
    null
  );

  const [editInitialData, setEditInitialData] =
    useState<CreateTrainerDto | null>(null);

  const [deleteTrainerId, setDeleteTrainerId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  /* ------------------------------------------------------------------------ */
  /*                                Error dialog                              */
  /* ------------------------------------------------------------------------ */

  const openErrorDialog = (
    error: unknown,
    title: string,
    fallbackMessage: string
  ) => {
    setErrorDialog({
      isOpen: true,
      title,
      message: getApiErrorMessage(error, fallbackMessage),
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  /* ------------------------------------------------------------------------ */
  /*                                  GET ALL                                 */
  /* ------------------------------------------------------------------------ */

  const fetchTrainers = useCallback(async () => {
    try {
      setIsLoadingTrainers(true);

      const response = await ApiService.get<TrainerListItemResponse[]>(
        TRAINERS_ENDPOINT
      );

      setTrainers(
        Array.isArray(response)
          ? response.map(mapListResponseToTableItem)
          : []
      );
    } catch (error) {
      setTrainers([]);

      openErrorDialog(
        error,
        "خطا در دریافت مربی‌ها",
        "دریافت فهرست مربی‌ها ناموفق بود."
      );
    } finally {
      setIsLoadingTrainers(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  /* ------------------------------------------------------------------------ */
  /*                               Search / filter                            */
  /* ------------------------------------------------------------------------ */

  const handleSearchInputChange = (value: string) => {
    const normalizedValue = value.trim().toLowerCase();

    setSearchQuery(value);

    if (!normalizedValue) {
      setSearchOptions([]);
      return;
    }

    startTransition(() => {
      const options = trainers
        .filter((trainer) => {
          const fullName =
            `${trainer.firstName} ${trainer.lastName}`.toLowerCase();

          return (
            fullName.includes(normalizedValue) ||
            trainer.phone.includes(normalizedValue)
          );
        })
        .map((trainer) => ({
          value: `${trainer.firstName} ${trainer.lastName}`,
          label: `${trainer.firstName} ${trainer.lastName}`,
        }));

      setSearchOptions(options);
    });
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const fullName = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      fullName.includes(normalizedSearch) ||
      trainer.phone.includes(normalizedSearch);

    const matchesCategory =
      !selectedCategory ||
      selectedCategory.value === "all" ||
      trainer.specialty === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });

  /* ------------------------------------------------------------------------ */
  /*                            GET DETAILS + SCHEDULES                       */
  /* ------------------------------------------------------------------------ */

  const handleToggleTrainerDetails = async (trainerId: number) => {
    if (expandedTrainerId === trainerId) {
      setExpandedTrainerId(null);
      return;
    }

    setExpandedTrainerId(trainerId);

    /**
     * اگر قبلاً جزئیات گرفته شده، دیگر درخواست دوباره نزن.
     */
    if (trainerDetailsById[trainerId]) {
      return;
    }

    try {
      setLoadingDetailsTrainerId(trainerId);

      const details = await ApiService.get<TrainerDetailsResponse>(
        `${TRAINERS_ENDPOINT}/${trainerId}`
      );

      setTrainerDetailsById((current) => ({
        ...current,
        [trainerId]: details,
      }));
    } catch (error) {
      setExpandedTrainerId(null);

      openErrorDialog(
        error,
        "خطا در دریافت سانس‌های مربی",
        "دریافت اطلاعات کلاس‌ها و سانس‌های مربی ناموفق بود."
      );
    } finally {
      setLoadingDetailsTrainerId(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  CREATE                                  */
  /* ------------------------------------------------------------------------ */

  const handleOpenAddModal = () => {
    setEditingTrainerId(null);
    setEditInitialData(null);
    setShowFormModal(true);
  };

  /* ------------------------------------------------------------------------ */
  /*                                GET BY ID                                 */
  /* ------------------------------------------------------------------------ */

  const handleOpenEditModal = async (trainerId: number) => {
    try {
      const detail = await ApiService.get<TrainerDetailsResponse>(
        `${TRAINERS_ENDPOINT}/${trainerId}`
      );

      setEditingTrainerId(trainerId);

      setEditInitialData({
        firstName: detail.firstName ?? "",
        lastName: detail.lastName ?? "",
        phoneNumber: detail.phoneNumber ?? "",
        nationalCode: detail.nationalCode ?? "",
        gender: mapApiGenderToFormGender(detail.gender),
        specialty: detail.specialty ?? "",
        baseSalary: detail.baseSalary ?? 0,
        commissionPercentage: detail.commissionPercentage ?? 0,
      });

      setShowFormModal(true);
    } catch (error) {
      openErrorDialog(
        error,
        "خطا در دریافت اطلاعات مربی",
        "دریافت اطلاعات مربی برای ویرایش ناموفق بود."
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                              POST / PUT                                  */
  /* ------------------------------------------------------------------------ */

  const handleTrainerSubmit = async (formData: CreateTrainerDto) => {
    const isEditing = editingTrainerId !== null;

    try {
      const createRequest = mapFormToCreateRequest(formData);

      if (isEditing) {
        const updateRequest: UpdateTrainerRequest = {
          ...createRequest,
          trainerActive: true,
        };

        await ApiService.put<void, UpdateTrainerRequest>(
          `${TRAINERS_ENDPOINT}/${editingTrainerId}`,
          updateRequest
        );
      } else {
        const isCreated = await ApiService.post<
          boolean,
          CreateTrainerRequest
        >(TRAINERS_ENDPOINT, createRequest);

        if (!isCreated) {
          throw new Error("ثبت مربی توسط سرور تأیید نشد.");
        }
      }

      /**
       * برای اینکه بعد از ثبت/ویرایش، اطلاعات cache شده هم قدیمی نماند.
       */
      setTrainerDetailsById({});

      await fetchTrainers();

      setShowFormModal(false);
      setEditingTrainerId(null);
      setEditInitialData(null);
    } catch (error) {
      openErrorDialog(
        error,
        isEditing ? "خطا در ویرایش مربی" : "خطا در ثبت مربی",
        isEditing ? "ویرایش مربی ناموفق بود." : "ثبت مربی ناموفق بود."
      );

      /**
       * فرم Insertcoach در حالت خطا نباید مودال را ببندد.
       */
      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  DELETE                                  */
  /* ------------------------------------------------------------------------ */

  const confirmDelete = async () => {
    if (deleteTrainerId === null) {
      return;
    }

    try {
      setIsDeleting(true);

      await ApiService.delete<void>(
        `${TRAINERS_ENDPOINT}/${deleteTrainerId}`
      );

      setTrainers((current) =>
        current.filter((trainer) => trainer.id !== deleteTrainerId)
      );

      setTrainerDetailsById((current) => {
        const next = { ...current };

        delete next[deleteTrainerId];

        return next;
      });

      setDeleteTrainerId(null);
    } catch (error) {
      openErrorDialog(
        error,
        "خطا در حذف مربی",
        "حذف مربی ناموفق بود."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingTrainerId(null);
    setEditInitialData(null);
  };

  /* ------------------------------------------------------------------------ */
  /*                                    UI                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="min-h-screen bg-[var(--primary-subtle)] p-6 text-[var(--primary)] dir-rtl"
      data-role="ADMIN"
    >
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar,
        body::-webkit-scrollbar,
        html::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .no-scrollbar,
        body,
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">
            مدیریت مربیان باشگاه
          </h1>

          <p className="mt-1 text-sm text-[var(--primary-mild)]">
            لیست کامل مربیان، اطلاعات قرارداد، کلاس‌ها و سانس‌های آموزشی
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-mild)] sm:w-auto"
          >
            <HiOutlinePlusCircle className="h-5 w-5" />
            <span>افزودن مربی جدید</span>
          </button>

          <div className="w-full sm:w-60">
            <Select<OptionType>
              isSearchable
              isLoading={isPending}
              placeholder="جستجوی نام مربی..."
              noOptionsMessage={() =>
                isPending ? "در حال جستجو..." : "مربی یافت نشد"
              }
              options={searchOptions}
              onInputChange={handleSearchInputChange}
              onChange={(option) => setSearchQuery(option?.value ?? "")}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select<OptionType>
              options={filterOptions}
              value={selectedCategory}
              onChange={(option) => setSelectedCategory(option)}
              placeholder="دسته‌بندی ورزشی"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoadingTrainers && (
        <div className="rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-8 text-center">
          <p className="text-sm text-[var(--primary-mild)]">
            در حال دریافت لیست مربیان...
          </p>
        </div>
      )}

      {/* Trainers list */}
      {!isLoadingTrainers && (
        <div className="space-y-4">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((trainer) => {
              const isExpanded = expandedTrainerId === trainer.id;
              const isDetailsLoading =
                loadingDetailsTrainerId === trainer.id;

              const trainerDetails = trainerDetailsById[trainer.id];

              const fullName = `${trainer.firstName} ${trainer.lastName}`;

              return (
                <div
                  key={trainer.id}
                  className="overflow-hidden rounded-2xl border border-[var(--primary-mild)]/30 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)] shadow-inner">
                        <Image
                          src={trainer.avatar}
                          alt={fullName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[var(--primary)]">
                          {fullName}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--primary-mild)]">
                          <HiOutlinePhone className="h-4 w-4" />
                          <span>{trainer.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-end gap-2 border-t border-[var(--primary-mild)]/20 pt-2 md:w-auto md:border-t-0 md:pt-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleTrainerDetails(trainer.id)
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-[var(--primary-mild)]/30 bg-[var(--primary-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--primary-mild)] transition-all hover:bg-[var(--primary-subtle)]/80 hover:text-[var(--primary)]"
                      >
                        <span>
                          {isExpanded ? "بستن جزئیات" : "جزئیات و سانس‌ها"}
                        </span>

                        {isExpanded ? (
                          <HiOutlineChevronUp className="h-4 w-4 text-[var(--primary-deep)]" />
                        ) : (
                          <HiOutlineChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(trainer.id)}
                        className="rounded-xl border border-[var(--primary-mild)]/30 bg-[var(--primary-subtle)] p-2.5 text-[var(--primary-mild)] transition-all hover:bg-[var(--primary-subtle)]/80 hover:text-[var(--primary)]"
                        title="ویرایش"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTrainerId(trainer.id)}
                        className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-[var(--primary-deep)] transition-all hover:bg-red-100"
                        title="حذف"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-[var(--primary-mild)]/30 bg-[var(--primary-subtle)]/40 p-6">
                      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 md:grid-cols-4">
                        <div className="flex items-center gap-3 rounded-xl border border-[var(--primary-mild)]/30 bg-white p-3.5">
                          <HiOutlineAcademicCap className="h-6 w-6 shrink-0 text-[var(--primary-mild)]" />
                          <div>
                            <span className="block text-[11px] text-[var(--primary-mild)]">
                              تخصص:
                            </span>
                            <span className="font-semibold text-[var(--primary)]">
                              {trainer.specialty}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-[var(--primary-mild)]/30 bg-white p-3.5">
                          <HiOutlineUsers className="h-6 w-6 shrink-0 text-[var(--primary-mild)]" />
                          <div>
                            <span className="block text-[11px] text-[var(--primary-mild)]">
                              تعداد شاگردان:
                            </span>
                            <span className="font-semibold text-[var(--primary)]">
                              {toPersianNumber(
                                trainerDetails?.totalStudents ?? 0
                              )}{" "}
                              نفر
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-[var(--primary-mild)]/30 bg-white p-3.5">
                          <HiOutlineAcademicCap className="h-6 w-6 shrink-0 text-[var(--primary-mild)]" />
                          <div>
                            <span className="block text-[11px] text-[var(--primary-mild)]">
                              کلاس‌های فعال:
                            </span>
                            <span className="font-semibold text-[var(--primary)]">
                              {toPersianNumber(
                                trainerDetails?.totalActiveClasses ?? 0
                              )}{" "}
                              کلاس
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-[var(--primary-mild)]/30 bg-white p-3.5">
                          <HiOutlineCash className="h-6 w-6 shrink-0 text-[var(--primary-deep)]" />
                          <div>
                            <span className="block text-[11px] text-[var(--primary-mild)]">
                              حقوق پایه / پورسانت:
                            </span>
                            <span className="font-bold text-[var(--primary-deep)]">
                              {formatMoney(trainer.baseSalary)}
                              {" - "}
                              {formatPercentage(
                                trainer.commissionPercentage
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Real schedules from GET /api/trainers/{id} */}
                      <div className="space-y-3 rounded-xl border border-[var(--primary-mild)]/30 bg-white p-4">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
                          <HiOutlineClock className="h-4 w-4 text-[var(--primary-mild)]" />
                          <span>کلاس‌ها و سانس‌های مربی:</span>
                        </h4>

                        {isDetailsLoading ? (
                          <p className="py-5 text-center text-xs text-[var(--primary-mild)]">
                            در حال دریافت کلاس‌ها و سانس‌های مربی...
                          </p>
                        ) : trainerDetails?.classes?.length ? (
                          <div className="space-y-3 pt-1">
                            {trainerDetails.classes.map((gymClass) => (
                              <div
                                key={gymClass.gymClassId}
                                className="rounded-xl border border-[var(--primary-mild)]/20 bg-[var(--primary-subtle)]/50 p-3"
                              >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-bold text-[var(--primary)]">
                                      {gymClass.title}
                                    </p>

                                    <p className="mt-1 text-[11px] text-[var(--primary-mild)]">
                                      رشته: {gymClass.sportName}
                                      {" | "}
                                      ظرفیت:{" "}
                                      {toPersianNumber(gymClass.capacity)} نفر
                                    </p>
                                  </div>
                                </div>

                                {gymClass.schedules?.length ? (
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {gymClass.schedules.map(
                                      (schedule, index) => (
                                        <div
                                          key={`${gymClass.gymClassId}-${schedule.dayOfWeek}-${index}`}
                                          className="rounded-lg border border-[var(--primary-mild)]/20 bg-white p-2.5 text-xs text-[var(--primary)]"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-1 font-semibold">
                                              <HiOutlineCalendar className="h-3.5 w-3.5 text-[var(--primary-mild)]" />
                                              {
                                                DAY_OF_WEEK_LABELS[
                                                  schedule.dayOfWeek
                                                ]
                                              }
                                            </span>

                                            <span className="font-mono text-[var(--primary-mild)]">
                                              {schedule.startTime} الی{" "}
                                              {schedule.endTime}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="py-2 text-center text-[11px] text-[var(--primary-mild)]">
                                    برای این کلاس هنوز سانسی ثبت نشده است.
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="py-5 text-center text-xs text-[var(--primary-mild)]">
                            این مربی در حال حاضر کلاس یا سانس فعالی ندارد.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="space-y-3 rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-12 text-center">
              <p className="font-bold text-[var(--primary)]">
                مربی با این مشخصات یافت نشد.
              </p>

              <p className="text-xs text-[var(--primary-mild)]">
                لطفاً عبارت جستجو یا دسته‌بندی ورزشی را تغییر دهید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add / edit modal */}
      <TrainerFormModal
        isOpen={showFormModal}
        mode={editingTrainerId !== null ? "edit" : "create"}
        initialData={editInitialData}
        onSubmit={handleTrainerSubmit}
        onClose={handleCloseFormModal}
      />

      {/* Central API error dialog */}
      <ApiErrorDialog
        isOpen={errorDialog.isOpen}
        title={errorDialog.title}
        message={errorDialog.message}
        onClose={closeErrorDialog}
      />

      {/* Delete confirmation dialog */}
      {deleteTrainerId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[var(--primary-deep)]">
              <HiOutlineExclamation className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--primary)]">
                حذف مربی
              </h3>

              <p className="mt-1 text-xs text-[var(--primary-mild)]">
                آیا از حذف این مربی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTrainerId(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[var(--primary-mild)]/40 px-4 py-2 text-xs font-medium text-[var(--primary-mild)] transition-colors hover:bg-[var(--primary-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-[var(--primary-deep)] px-4 py-2 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "در حال حذف..." : "حذف شود"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

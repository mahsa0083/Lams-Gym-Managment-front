"use client";

import { useEffect, useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import Select from "@/components/ui/Select";

type SelectOption = {
  value: string;
  label: string;
};

// مطابق enum بک‌اند:
// Male = 0
// Female = 1
export type GenderType = 0 | 1;

export interface CreateTrainerDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: GenderType | null;
  specialty: string | null;
  baseSalary: number;
  commissionPercentage: number;
}

interface CreateTrainerFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: GenderType | null;
  specialty: string | null;
  baseSalary: number | "";
  commissionPercentage: number | "";
}

interface TrainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTrainerDto) => Promise<void> | void;

  // برای حالت ویرایش
  initialData?: CreateTrainerDto | null;
  mode?: "create" | "edit";
}

const genderOptions: SelectOption[] = [
  { value: "0", label: "آقا" },
  { value: "1", label: "خانم" },
];

const specialtyOptions: SelectOption[] = [
  { value: "بدنسازی", label: "بدنسازی" },
  { value: "فیتنس", label: "فیتنس" },
  { value: "کراس فیت", label: "کراس فیت" },
  { value: "پیلاتس", label: "پیلاتس" },
  { value: "یوگا", label: "یوگا" },
  { value: "زومبا", label: "زومبا" },
  { value: "رزمی", label: "ورزش‌های رزمی" },
  { value: "شنا", label: "شنا" },
];

const initialFormData: CreateTrainerFormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  nationalCode: "",
  gender: null,
  specialty: null,
  baseSalary: "",
  commissionPercentage: "",
};

const TrainerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: TrainerFormModalProps) => {
  const [formData, setFormData] =
    useState<CreateTrainerFormData>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // هنگام بازشدن فرم:
  // - در حالت افزودن: فرم خالی شود.
  // - در حالت ویرایش: اطلاعات مربی داخل فرم قرار بگیرد.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrorMessage("");

    if (mode === "edit" && initialData) {
      setFormData({
        firstName: initialData.firstName ?? "",
        lastName: initialData.lastName ?? "",
        phoneNumber: initialData.phoneNumber ?? "",
        nationalCode: initialData.nationalCode ?? "",
        gender: initialData.gender ?? null,
        specialty: initialData.specialty ?? null,
        baseSalary: initialData.baseSalary ?? "",
        commissionPercentage: initialData.commissionPercentage ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setFormData(initialFormData);
    setErrorMessage("");
    onClose();
  };

  const handlePhoneChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "").slice(0, 11);

    setFormData((previous) => ({
      ...previous,
      phoneNumber: cleanedValue,
    }));
  };

  const handleNationalCodeChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "").slice(0, 10);

    setFormData((previous) => ({
      ...previous,
      nationalCode: cleanedValue,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.firstName.trim()) {
      setErrorMessage("لطفاً نام را وارد کنید.");
      return;
    }

    if (!formData.lastName.trim()) {
      setErrorMessage("لطفاً نام خانوادگی را وارد کنید.");
      return;
    }

    if (formData.phoneNumber.length !== 11) {
      setErrorMessage("شماره موبایل باید دقیقاً ۱۱ رقم باشد.");
      return;
    }

    if (formData.nationalCode.length !== 10) {
      setErrorMessage("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    if (formData.gender === null) {
      setErrorMessage("لطفاً جنسیت را انتخاب کنید.");
      return;
    }

    if (!formData.specialty) {
      setErrorMessage("لطفاً تخصص را انتخاب کنید.");
      return;
    }

    if (formData.baseSalary === "") {
      setErrorMessage("لطفاً حقوق پایه را وارد کنید.");
      return;
    }

    if (formData.commissionPercentage === "") {
      setErrorMessage("لطفاً درصد کمیسیون را وارد کنید.");
      return;
    }

    if (
      Number(formData.commissionPercentage) < 0 ||
      Number(formData.commissionPercentage) > 100
    ) {
      setErrorMessage("درصد کمیسیون باید بین ۰ تا ۱۰۰ باشد.");
      return;
    }

    const payload: CreateTrainerDto = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phoneNumber: formData.phoneNumber,
      nationalCode: formData.nationalCode,
      gender: formData.gender,
      specialty: formData.specialty,
      baseSalary: Number(formData.baseSalary),
      commissionPercentage: Number(formData.commissionPercentage),
    };

    try {
      setIsSubmitting(true);

      await onSubmit(payload);

      setFormData(initialFormData);
      onClose();
    } catch (error) {
      console.error("Trainer submit error:", error);

      const message =
        error instanceof Error && error.message
          ? error.message
          : "خطایی در ذخیره اطلاعات مربی رخ داد. دوباره تلاش کنید.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    mode === "edit" ? "ویرایش اطلاعات مربی" : "افزودن مربی جدید";

  const submitButtonText =
    mode === "edit" ? "ذخیره تغییرات" : "ثبت مربی";

  const submittingText =
    mode === "edit" ? "در حال ذخیره..." : "در حال ثبت...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="no-scrollbar max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--primary-mild)]/30 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--primary-mild)]/20 pb-3">
          <h3 className="text-base font-bold text-[var(--primary)]">
            {modalTitle}
          </h3>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="بستن فرم"
            className="rounded-lg p-1 text-[var(--primary-mild)] transition-colors hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                نام <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                placeholder="مثلاً: علی"
                value={formData.firstName}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    firstName: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2.5 text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                نام خانوادگی <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                placeholder="مثلاً: حسینی"
                value={formData.lastName}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    lastName: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2.5 text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                شماره همراه <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                required
                dir="ltr"
                placeholder="09123456789"
                value={formData.phoneNumber}
                onChange={(event) =>
                  handlePhoneChange(event.target.value)
                }
                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2.5 text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                کد ملی <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                required
                dir="ltr"
                placeholder="0012345678"
                value={formData.nationalCode}
                onChange={(event) =>
                  handleNationalCodeChange(event.target.value)
                }
                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2.5 text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                جنسیت <span className="text-red-500">*</span>
              </label>

              <Select<SelectOption>
                placeholder="انتخاب جنسیت"
                options={genderOptions}
                value={
                  genderOptions.find(
                    (item) => Number(item.value) === formData.gender
                  ) ?? null
                }
                onChange={(option) =>
                  setFormData((previous) => ({
                    ...previous,
                    gender: option
                      ? (Number(option.value) as GenderType)
                      : null,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                تخصص <span className="text-red-500">*</span>
              </label>

              <Select<SelectOption>
                placeholder="انتخاب تخصص"
                options={specialtyOptions}
                value={
                  specialtyOptions.find(
                    (item) => item.value === formData.specialty
                  ) ?? null
                }
                onChange={(option) =>
                  setFormData((previous) => ({
                    ...previous,
                    specialty: option?.value ?? null,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                حقوق پایه <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                min="0"
                required
                placeholder="مثلاً: 15000000"
                value={formData.baseSalary}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    baseSalary:
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2.5 text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-[var(--primary)]">
                درصد کمیسیون <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                min="0"
                max="100"
                required
                placeholder="مثلاً: 60"
                value={formData.commissionPercentage}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    commissionPercentage:
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-[var(--primary-mild)]/40 bg-[var(--primary-subtle)]/30 px-3 py-2.5 text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[var(--primary-mild)]/20 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[var(--primary-mild)]/40 px-4 py-2.5 font-semibold text-[var(--primary-mild)] transition-colors hover:bg-[var(--primary-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[var(--primary-mild)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? submittingText : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerFormModal;

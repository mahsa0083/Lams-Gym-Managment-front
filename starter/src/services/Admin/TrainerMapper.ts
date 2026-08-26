import type {
  CreateTrainerRequest,
  Trainer,
  TrainerListItemResponse,
  TrainerGender,
} from "@/@types/trainer";
import type { CreateTrainerDto } from "@/app/(protected-pages)/admin/coach/addcoach/Insertcoach";


const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300";

const toPersianNumber = (value: number): string => {
  return new Intl.NumberFormat("fa-IR").format(value);
};

export function mapTrainerToTableRow(
  trainer: TrainerListItemResponse
): Trainer {
  return {
    id: trainer.id,
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    phone: trainer.phoneNumber,

    // API ممکن است specialty را null برگرداند
    specialty: trainer.specialty ?? "نامشخص",
    subSpecialty: trainer.specialty ?? "ثبت نشده",

    // این دو مقدار در API لیست وجود ندارند
    studentCount: 0,
    schedule: [],

    avatar: DEFAULT_AVATAR,
    percentage: `${toPersianNumber(trainer.commissionPercentage)}٪`,
    monthlySalary: `${toPersianNumber(trainer.baseSalary)} تومان`,
  };
}


export function mapCoachFormToCreateRequest(
  data: CreateTrainerDto
): CreateTrainerRequest {
  if (data.gender === null) {
    throw new Error("لطفاً جنسیت مربی را انتخاب کنید.");
  }

  if (!data.specialty?.trim()) {
    throw new Error("لطفاً تخصص مربی را انتخاب کنید.");
  }

  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phoneNumber: data.phoneNumber.trim(),
    nationalCode: data.nationalCode.trim(),

    /*
      طبق گزینه‌های فرم:
      0 → Male
      1 → Female

      اگر labelهای خود فرم برعکس هستند، فقط همین دو مقدار را جابه‌جا کن.
    */
    gender: data.gender === 1 ? "Female" : "Male",

    specialty: data.specialty.trim(),
    baseSalary: Number(data.baseSalary),
    commissionPercentage: Number(data.commissionPercentage),
  };
  
}




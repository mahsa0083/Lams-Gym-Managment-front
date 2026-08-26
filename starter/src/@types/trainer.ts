// src/types/trainer.ts

// ===============================
// API Request DTOs
// ===============================

export type TrainerGender = "Male" | "Female";

export interface CreateTrainerRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: TrainerGender;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
}

export interface UpdateTrainerRequest extends CreateTrainerRequest {
  trainerActive: boolean;
}

// ===============================
// API Response DTOs
// ===============================

export interface TrainerListItemResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  userActive: boolean;
  trainerActive: boolean;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
}

export interface TrainerCourseResponse {
  id: number;
  groupName: string;
  sportCategory: string;
  remainingCapacity: number;
  classDays: string;
  classTime: string;
  capacity: number;
}

export interface TrainerScheduleResponse {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface TrainerClassResponse {
  gymClassId: number;
  title: string;
  sportName: string;
  capacity: number;
  schedules: TrainerScheduleResponse[];
}

export interface TrainerDetailResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: TrainerGender;
  userActive: boolean;
  trainerActive: boolean;
  createdAt: string;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
  totalStudents: number;
  totalActiveClasses: number;
  classes: TrainerClassResponse[];
}

// ===============================
// UI Models
// این مدل‌ها فقط برای قالب و کامپوننت‌ها هستند.
// لازم نیست با DTO بک‌اند یکی باشند.
// ===============================

export type CoachFormGender = 0 | 1;

export interface CoachFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: CoachFormGender;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;

  // اگر UI بعداً فیلد اضافه داشت، اینجا اضافه کن.
  // این فیلدها فقط زمانی به API می‌روند که mapper تعیین کند.
}

export interface TrainerTableRow {
  id: number;
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
  isActive: boolean;

  // چون API لیست، schedule و studentCount را نمی‌دهد،
  // فعلاً برای نمایش جدول مقدار پیش‌فرض می‌گیرند.
  schedule: string;
  studentCount: number;
}
export interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  specialty: string;
  subSpecialty: string;
  studentCount: number;
  percentage: string;
  monthlySalary: string;
  avatar: string;
  schedule: {
    days: string;
    time: string;
    location: string;
  }[];
}

export type ApiDayOfWeek =
  | "Saturday"
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export interface TrainerClassScheduleResponse {
  dayOfWeek: ApiDayOfWeek;
  startTime: string;
  endTime: string;
}



export interface TrainerDetailsResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: "Male" | "Female";
  userActive: boolean;
  trainerActive: boolean;
  createdAt: string;
  specialty: string;
  baseSalary: number;
  commissionPercentage: number;
  totalStudents: number;
  totalActiveClasses: number;
  classes: TrainerClassResponse[];
}
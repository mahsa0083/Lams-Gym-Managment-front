import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
// تایپ روزها و ساعات برگزاری کلاس
export interface ScheduleDTO {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// تایپ سوابق حضور و غیاب
export interface AttendanceDTO {
  attendanceDate: string;
  isPresent: boolean;
}

// تایپ کلاس‌های ثبت‌نام شده (دوره‌ها)
export interface CourseEnrollmentDTO {
  enrollmentId: number;
  classId: number;
  classTitle: string;
  groupName: string;
  sportName: string;
  trainerFullName: string;
  schedules: ScheduleDTO[];
  attendances: AttendanceDTO[];
}

// تایپ اشتراک‌ها و پکیج‌ها
export interface MemberSubscriptionDTO {
  subscriptionId: number;
  packageName: string;
  trainerFullName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  remainingSessions: number;
  status: string; // مثل "PendingPayment", "Active", "Expired"
}

// ساختار کامل Response خروجی API
export interface MemberDetailsDTO {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  gender: string;
  birthDate: string;
  joinDate: string;
  medicalNotes: string;
  emergencyPhone: string;
  isActive: boolean;
  subscriptions: MemberSubscriptionDTO[];
  courses: CourseEnrollmentDTO[];
}


export interface Course {
  id: number;
  title: string;
  description?: string;
  instructor: string;
  duration?: string;
  startDate?: string;
  price?: string;
  category?: string;
  image?: string;
  level?: string;
  capacity?: string;
  isFull?: boolean;
  location?: string;
  features?: string[];
  prerequisites?: string;
  packageName?: string;
  totalSessions?: number;
  remainingSessions?: number;
  status?: string;
  schedules?: ScheduleDTO[];
  attendances?: AttendanceDTO[];
}

interface CourseStore {
  selectedCourse: Course | null;
  step: number;
  setSelectedCourse: (course: Course | null) => void;
  setStep: (step: number) => void;
  clearSelectedCourse: () => void;
  renewCourse: (course: Course) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      selectedCourse: null,
      step: 1,
      setSelectedCourse: (course) => set({ selectedCourse: course }),
      setStep: (step) => set({ step }),
      clearSelectedCourse: () => set({ selectedCourse: null, step: 1 }),
      renewCourse: (course) => set({ selectedCourse: course, step: 3 }),
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        selectedCourse: state.selectedCourse,
        step: state.step 
      }),
    }
  )
)

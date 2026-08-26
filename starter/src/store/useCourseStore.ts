import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  startDate: string
  price: string
  category: string
  image: string
  level: string
  capacity: string
  isFull: boolean
  location: string
  features: string[]
  prerequisites: string
}

interface CourseStore {
  selectedCourse: Course | null
  step: number
  setSelectedCourse: (course: Course | null) => void
  setStep: (step: number) => void
  clearSelectedCourse: () => void
  renewCourse: (course: Course) => void
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      selectedCourse: null,
      step: 1,
      setSelectedCourse: (course) => set({ selectedCourse: course }),
      setStep: (step) => set({ step }),
      clearSelectedCourse: () => set({ selectedCourse: null, step: 1 }),
      // متد اختصاصی برای تمدید دوره و هدایت مستقیم به گام پرداخت
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
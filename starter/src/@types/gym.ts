// src/types/gym.ts

// 1. رشته ورزشی (Sport)
export interface Sport {
  id: number
  name: string
  description?: string
}

// 2. پکیج ورزشی (Package)
export interface PackageItem {
  id: number
  sportid:number
  trainerid:number
  title: string
  description:string
  trainerName?: string
  durationDays: number
  totalSessions: number
  price: number
}

// 3. زمان‌بندی (Schedule)
export interface GymClassSchedule {
  id?: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

// 4. کلاس ورزشی (Gym Class)
export interface GymClass {
  id: number
  title: string
  groupName: string
  trainerName: string
  sportName: string
  capacity: number
  remainingCapacity: number
  startDate: string
  isActive?: boolean
  schedules: GymClassSchedule[]
}
'use client'

import React, { useState } from 'react'
import SportsSection from './component/SportsSection'
import PackagesSection from './component/PackagesSection'
import ClassesSection from './component/ClassesSection'

export default function CoursesManagementPage() {
  const [activeTab, setActiveTab] = useState<'sports' | 'packages' | 'classes'>('sports')

  return (
    <div className="p-6 bg-[var(--primary-subtle)] min-h-screen text-[var(--primary)] dir-rtl text-xs space-y-6">
      {/* هدر صفحه */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--primary-mild)]/30">
        <h1 className="text-xl font-bold text-[var(--primary)]">مدیریت دوره‌ها و کلاس‌های ورزشی</h1>
        <p className="text-xs text-[var(--primary-mild)] mt-1">
          تعریف رشته‌های ورزشی، پکیج‌های تمرینی و برنامه‌ریزی سانس‌ها
        </p>
      </div>

      {/* منوی تب‌ها */}
      <div className="flex gap-3 border-b border-[var(--primary-mild)]/20 pb-3">
        <button
          onClick={() => setActiveTab('sports')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'sports'
              ? 'bg-[#0f172a] text-white shadow-md'
              : 'bg-white text-[var(--primary-mild)] hover:bg-slate-100'
          }`}
        >
          ۱. رشته‌های ورزشی 
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'packages'
              ? 'bg-[#0f172a] text-white shadow-md'
              : 'bg-white text-[var(--primary-mild)] hover:bg-slate-100'
          }`}
        >
          ۲. پکیج‌های ورزشی 
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'classes'
              ? 'bg-[#0f172a] text-white shadow-md'
              : 'bg-white text-[var(--primary-mild)] hover:bg-slate-100'
          }`}
        >
          ۳.  کلاس‌ها 
        </button>
      </div>

      {/* نمایش بخش مربوط به هر تب */}
      <div className="mt-4">
        {activeTab === 'sports' && <SportsSection />}
        {activeTab === 'packages' && <PackagesSection />}
        {activeTab === 'classes' && <ClassesSection />}
      </div>
    </div>
  )
}
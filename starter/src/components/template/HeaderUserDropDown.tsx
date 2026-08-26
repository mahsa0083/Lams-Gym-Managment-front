'use client'

import { useState, useRef, useEffect } from 'react'
import { HiOutlineUser, HiOutlineCog, HiOutlineChartBar, HiOutlineLogout } from 'react-icons/hi'

export default function HeaderUserDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // بستن منو با کلیک بیرون از آن
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* دکمه دایره‌ای شکل در هدر */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-[#161E54] text-[#BBE0EF] border-2 border-[#BBE0EF]/40 flex items-center justify-center font-bold text-sm shadow-sm hover:border-[#F16D34] transition-all focus:outline-none cursor-pointer"
                title="پروفایل کاربری"
            >
                ع
            </button>

            {/* منوی پاپ‌آپ بازشونده */}
            {isOpen && (
                <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 text-slate-700 dir-rtl">
                    {/* اطلاعات کاربر */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-[#161E54]">علی مربی</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">trainer@gym.com</p>
                    </div>

                    {/* گزینه‌های منو */}
                    <div className="py-1">
                        <a href="#profile" className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-slate-50 text-slate-600 transition-colors">
                            <HiOutlineUser className="w-4 h-4 text-[#F16D34]" />
                            <span>پروفایل</span>
                        </a>
                        <a href="#settings" className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-slate-50 text-slate-600 transition-colors">
                            <HiOutlineCog className="w-4 h-4 text-[#161E54]" />
                            <span>تنظیمات حساب</span>
                        </a>
                        <a href="#reports" className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-slate-50 text-slate-600 transition-colors">
                            <HiOutlineChartBar className="w-4 h-4 text-[#161E54]" />
                            <span>گزارش فعالیت‌ها</span>
                        </a>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                        <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-red-50 text-red-600 transition-colors text-right cursor-pointer">
                            <HiOutlineLogout className="w-4 h-4 text-red-500" />
                            <span>خروج</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
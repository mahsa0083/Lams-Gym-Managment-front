'use client'

import React, { Fragment, useState, useRef, useEffect } from 'react'
import classNames from '@/utils/classNames'
import {
    HEADER_HEIGHT,
    HEADER_EXTENDED_HEIGHT,
} from '@/constants/theme.constant'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { HiOutlineUser, HiOutlineLogout } from 'react-icons/hi'
import type { ReactNode, JSX } from 'react'
import type { CommonProps } from '@/@types/common'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import HeaderUserDropdown from './HeaderUserDropDown'

type HeaderContent = {
    component: ((props: Record<string, unknown>) => JSX.Element) | ReactNode
}

type HeaderContents = Array<HeaderContent>

interface HeaderProps extends CommonProps {
    headerStart?: HeaderContents
    headerEnd?: HeaderContents
    headerBottom?: HeaderContents
    headerMiddle?: ReactNode
    extended?: ReactNode
    container?: boolean
    wrapperClass?: string
    sticky?: boolean
}

// export default از این قسمت حذف شد
function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    router.push('/sign-in');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full p-0.5 border-2 border-[#A8DADC]/40 hover:border-[#E63946] transition-all focus:outline-none cursor-pointer shadow-sm"
        title="پروفایل کاربری"
      >
        <Avatar
          size={38}
          shape="circle"
          className="bg-[#1D3557] text-[#A8DADC] font-bold text-sm"
        >
        
        </Avatar>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 text-slate-700 dir-rtl">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <Avatar
              size={36}
              shape="circle"
              className="bg-[#1D3557] text-[#A8DADC] font-bold text-xs"
            >
              
            </Avatar>
            <div>
              <p className="text-xs font-bold text-[#1D3557]">علی مربی</p>
              <p className="text-[10px] text-slate-400 mt-0.5">trainer@gym.com</p>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/trainer/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <HiOutlineUser className="w-4 h-4 text-[#E63946]" />
              <span>پروفایل</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-red-50 text-red-600 transition-colors text-right cursor-pointer"
            >
              <HiOutlineLogout className="w-4 h-4 text-red-500" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Header = (props: HeaderProps) => {
    const {
        headerStart = [],
        headerEnd = [],
        headerMiddle,
        className,
        container,
        wrapperClass,
        extended,
        sticky = true,
    } = props

    const headerActionClass = 'flex items-center gap-2'

    const renderContent = (item: HeaderContent, index: number) => {
        if (typeof item.component === 'function') {
            const Component = withHeaderItem(item.component)
            return <Component key={`header-start-${index}`} />
        }
        return (
            <Fragment key={`header-start-${index}`}>{item.component}</Fragment>
        )
    }

    return (
        <header
            className={classNames(
                'header',
                sticky && 'sticky top-0',
                className,
            )}
        >
            <div
                className={classNames(
                    'header-wrapper',
                    container && 'container mx-auto',
                    wrapperClass,
                )}
                style={{ height: HEADER_HEIGHT }}
            >
                <div
                    className={classNames(
                        'header-action-start',
                        headerActionClass,
                    )}
                >
                    {headerStart.map(renderContent)}
                </div>
                {headerMiddle && (
                    <div
                        className={classNames(
                            'header-action-middle',
                            headerActionClass,
                        )}
                    >
                        {headerMiddle}
                    </div>
                )}
                <div
                    className={classNames(
                        'header-action-end',
                        headerActionClass,
                    )}
                >
                    {headerEnd.map(renderContent)}
                    <HeaderUserDropdown />
                </div>
            </div>
            {extended && (
                <div
                    className={classNames(
                        'header-extended-wrapper',
                        container && 'container mx-auto',
                    )}
                >
                    <div
                        className="flex items-center justify-between gap-2 w-full"
                        style={{ height: HEADER_EXTENDED_HEIGHT }}
                    >
                        {extended}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
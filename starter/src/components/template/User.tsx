'use client'

import ApiService from '@/services/client/ApiService';
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

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>('کاربر');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  
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

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken) {
        const name = 
          decodedToken.name || 
          decodedToken.fullName || 
          decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
          decodedToken.unique_name || 
          'کاربر سیستم';
          
        const email = 
          decodedToken.email || 
          decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
          '';

        const avatar = decodedToken.avatar || decodedToken.photo || '';

        setUserName(name);
        setUserEmail(email);
        setUserAvatar(avatar);
      }
    }
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await ApiService.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      router.push('/sign-in');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full p-1.5 border border-slate-200 hover:border-[#E63946] transition-all focus:outline-none cursor-pointer bg-slate-50 text-slate-600"
        title="پروفایل کاربری"
      >
        {userAvatar ? (
          <Avatar size={32} shape="circle" src={userAvatar} />
        ) : (
          <HiOutlineUser className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 text-slate-700 dir-rtl">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              {userAvatar ? (
                <Avatar size={32} shape="circle" src={userAvatar} />
              ) : (
                <HiOutlineUser className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#1D3557] truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{userEmail}</p>
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
                    <UserDropdown />
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

export default Header;
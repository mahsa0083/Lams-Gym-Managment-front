'use client'

import React, { Fragment, useState, useRef, useEffect } from 'react'
import classNames from '@/utils/classNames'
import {
    HEADER_HEIGHT,
    HEADER_EXTENDED_HEIGHT,
} from '@/constants/theme.constant'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import {
    HiOutlineUser,
    HiOutlineLogout,
} from 'react-icons/hi'
import type { ReactNode, JSX } from 'react'
import type { CommonProps } from '@/@types/common'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import { useSession } from 'next-auth/react'
import { serverLogout } from '@/server/actions/auth/logoutAction'

type HeaderContent = {
    component:
        | ((props: Record<string, unknown>) => JSX.Element)
        | ReactNode
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
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const base64Url = parts[1]
        if (!base64Url) return null

        const base64 = base64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const paddedBase64 =
            base64 +
            '='.repeat(
                (4 - (base64.length % 4)) % 4,
            )

        const binaryString = atob(paddedBase64)
        const bytes = Uint8Array.from(
            binaryString,
            (char) => char.charCodeAt(0),
        )

        const jsonPayload = new TextDecoder().decode(bytes)
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('JWT parse error:', error)
        return null
    }
}

export function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [userName, setUserName] = useState<string>('کاربر')
    const [userEmail, setUserEmail] = useState<string>('')
    const [userAvatar, setUserAvatar] = useState<string>('')
    const [userRole, setUserRole] = useState<string>('')
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const { data: session, status } = useSession()

    // -----------------------------------------
    // Close dropdown on outside click
    // -----------------------------------------
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // -----------------------------------------
    // Extract User Claims
    // -----------------------------------------
    useEffect(() => {
        if (status !== 'authenticated') return

        const accessToken = (session as any)?.accessToken
        if (!accessToken) return

        const decodedToken = parseJwt(accessToken)
        if (!decodedToken) return

        const name =
            decodedToken.name ||
            decodedToken.fullName ||
            decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            decodedToken.unique_name ||
            'کاربر سیستم'

        const email =
            decodedToken.email ||
            decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
            ''

        const avatar = decodedToken.avatar || decodedToken.photo || ''

        const roleClaim =
            decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

        let role = ''
        if (Array.isArray(roleClaim)) {
            role = String(roleClaim[0] ?? '')
        } else {
            role = String(roleClaim ?? '')
        }

        switch (role) {
            case '1':
                setUserRole('ADMIN')
                break
            case '2':
                setUserRole('TRAINER')
                break
            case '3':
                setUserRole('MEMBER')
                break
            default:
                setUserRole('')
                break
        }

        setUserName(String(name))
        setUserEmail(String(email))
        setUserAvatar(String(avatar))
    }, [session, status])

    const getProfilePath = () => {
        switch (userRole) {
            case 'ADMIN':
                return '/admin/profile'
            case 'TRAINER':
                return '/trainer/profile'
            case 'MEMBER':
                return '/member/user/profile'
            default:
                return '/'
        }
    }

    // -----------------------------------------
    // Logout Handler (Using Server Action)
    // -----------------------------------------
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            setIsOpen(false)

            // پاکسازی کش و توکن‌های محلی
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            }

            // فراخوانی اکشن سمت سرور (خواندن رفرش‌توکن مستقیم از Session سروری و ارسال به بک‌اند)
            await serverLogout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-all hover:border-[#E63946] focus:outline-none"
                title="پروفایل کاربری"
                disabled={isLoggingOut}
            >
                {userAvatar ? (
                    <Avatar size={32} shape="circle" src={userAvatar} />
                ) : (
                    <HiOutlineUser className="h-5 w-5 text-slate-600" />
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 z-50 mt-3 w-56 rounded-2xl border border-slate-200 bg-white py-2 text-slate-700 shadow-2xl dir-rtl">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                        <div className="flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600">
                            {userAvatar ? (
                                <Avatar size={32} shape="circle" src={userAvatar} />
                            ) : (
                                <HiOutlineUser className="h-5 w-5" />
                            )}
                        </div>

                        <div className="overflow-hidden">
                            <p className="truncate text-xs font-bold text-[#1D3557]">
                                {userName}
                            </p>
                            {userEmail && (
                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                    {userEmail}
                                </p>
                            )}
                            {userRole && (
                                <p className="mt-1 text-[9px] font-semibold text-[#E63946]">
                                    {userRole === 'ADMIN'
                                        ? 'مدیر سیستم'
                                        : userRole === 'TRAINER'
                                          ? 'مربی'
                                          : userRole === 'MEMBER'
                                            ? 'عضو'
                                            : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="py-1">
                        <Link
                            href={getProfilePath()}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <HiOutlineUser className="h-4 w-4 text-[#E63946]" />
                            <span>پروفایل</span>
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-right text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                            <HiOutlineLogout className="h-4 w-4 text-red-500" />
                            <span>{isLoggingOut ? 'در حال خروج...' : 'خروج'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
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

        return <Fragment key={`header-start-${index}`}>{item.component}</Fragment>
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
                style={{
                    height: HEADER_HEIGHT,
                }}
            >
                <div className={classNames('header-action-start', headerActionClass)}>
                    {headerStart.map(renderContent)}
                </div>

                {headerMiddle && (
                    <div className={classNames('header-action-middle', headerActionClass)}>
                        {headerMiddle}
                    </div>
                )}

                <div className={classNames('header-action-end', headerActionClass)}>
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
                        className="flex w-full items-center justify-between gap-2"
                        style={{
                            height: HEADER_EXTENDED_HEIGHT,
                        }}
                    >
                        {extended}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header

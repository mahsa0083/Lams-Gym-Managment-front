// 'use client'

// import React, { createContext, useContext, useState, useEffect } from 'react'

// interface UserPayload {
//     id: string | number
//     fullName?: string
//     role?: string
//     exp?: number
// }

// interface AuthContextType {
//     user: UserPayload | null
//     token: string | null
//     login: (token: string) => void
//     logout: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// // تابع پارس JWT
// function parseJwt(token: string): UserPayload | null {
//     try {
//         const base64Url = token.split('.')[1]
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
//         const jsonPayload = decodeURIComponent(
//             atob(base64)
//                 .split('')
//                 .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//                 .join('')
//         )
//         const parsed = JSON.parse(jsonPayload)
//         return {
//             id: parsed.userId || parsed.sub || parsed.id || parsed.user_id,
//             role: parsed.role || parsed.userRole,
//             fullName: parsed.fullName || parsed.name,
//             exp: parsed.exp
//         }
//     } catch (e) {
//         console.error('Invalid JWT token', e)
//         return null
//     }
// }

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     const [user, setUser] = useState<UserPayload | null>(null)
//     const [token, setToken] = useState<string | null>(null)

//     useEffect(() => {
//         // خواندن توکن در اولین لود برنامه و پارس کردن آن (فقط یک بار)
//         const savedToken = localStorage.getItem('token')
//         if (savedToken) {
//             const userData = parseJwt(savedToken)
//             setToken(savedToken)
//             setUser(userData)
//         }
//     }, [])

//     const login = (newToken: string) => {
//         localStorage.setItem('token', newToken)
//         const userData = parseJwt(newToken)
//         setToken(newToken)
//         setUser(userData)
//     }

//     const logout = () => {
//         localStorage.removeItem('token')
//         setToken(null)
//         setUser(null)
//     }

//     return (
//         <AuthContext.Provider value={{ user, token, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

// // هوک اختصاصی جهت استفاده راحت در کامپوننت‌ها
// export function useAuth() {
//     const context = useContext(AuthContext)
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider')
//     }
//     return context
// }
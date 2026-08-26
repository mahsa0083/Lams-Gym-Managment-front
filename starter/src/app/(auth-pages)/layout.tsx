import { ReactNode } from 'react'
import AuthLayout from '@/components/layouts/AuthLayout'
import PreLoginLayout from '@/components/layouts/PreLoginLayout'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <PreLoginLayout>
            <AuthLayout>{children}</AuthLayout>
        </PreLoginLayout>
    )
}

export default Layout

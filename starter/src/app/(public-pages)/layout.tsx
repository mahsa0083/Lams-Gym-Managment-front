import { ReactNode } from 'react'
import PreLoginLayout from '@/components/layouts/PreLoginLayout'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <PreLoginLayout>
            {children}
        </PreLoginLayout>
    )
}

export default Layout

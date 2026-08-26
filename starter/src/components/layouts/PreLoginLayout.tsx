'use client'

import type { CommonProps } from '@/@types/common'

const PreLoginLayout = ({ children }: CommonProps) => {
    return <div className="flex flex-auto flex-col min-h-screen">{children}</div>
}

export default PreLoginLayout

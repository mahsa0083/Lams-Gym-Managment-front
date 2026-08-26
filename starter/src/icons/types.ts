import type { CSSProperties } from 'react'

export interface IconProps {
    className?: string
    style?: CSSProperties
    size?: string | number
}

export interface IconData {
    tag: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attr: Record<string, any>
    child: IconData[]
}

export interface IconMetadata {
    name: string
    displayName: string
    category: string
    filePath: string
    componentPath: string
    svgContent: string
    keywords: string[]
}

export interface IconIndex {
    categories?: Record<string, IconMetadata[]>
    allIcons: IconMetadata[]
    totalCount: number
}

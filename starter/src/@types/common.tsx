import type { ReactNode, CSSProperties, ComponentProps } from 'react'

export interface CommonProps {
    id?: string
    className?: string
    children?: ReactNode
    style?: CSSProperties
}

export type TableQueries = {
    total?: number
    pageIndex?: number
    pageSize?: number
    query?: string
    sortOrder: 'asc' | 'desc' | ''
    sortKey?: string | number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TranslationFn = any

export type SvgProps = ComponentProps<'svg'>

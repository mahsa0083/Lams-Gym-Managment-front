import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

/**
 * A hook to append or update query parameters in the current URL without losing existing ones.
 * This triggers a Next.js server-side re-render of the current page.
 */
export const useAppendQueryParams = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const appendQueryParams = useCallback(
        (
            params: Record<
                string,
                string | number | boolean | undefined | null
            >,
        ) => {
            const current = new URLSearchParams(
                Array.from(searchParams.entries()),
            )

            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    current.delete(key)
                } else {
                    current.set(key, String(value))
                }
            })

            const search = current.toString()
            const query = search ? `?${search}` : ''

            router.push(`${pathname}${query}`)
        },
        [router, pathname, searchParams],
    )

    return appendQueryParams
}

export default useAppendQueryParams

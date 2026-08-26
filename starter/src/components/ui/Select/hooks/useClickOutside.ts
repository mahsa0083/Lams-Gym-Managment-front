import { useEffect, RefObject } from 'react'

export interface UseClickOutsideProps {
    ref: RefObject<HTMLElement | null>
    onClickOutside: () => void
    enabled?: boolean
}

export const useClickOutside = ({
    ref,
    onClickOutside,
    enabled = true,
}: UseClickOutsideProps) => {
    useEffect(() => {
        if (!enabled) return

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClickOutside()
            }
        }

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClickOutside()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [ref, onClickOutside, enabled])
}

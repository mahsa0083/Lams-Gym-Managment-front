import { useEffect } from 'react'
import useCallbackRef from './useCallbackRef'

function useResizeObserver(element: HTMLElement | null, onResize: () => void) {
    const handleResize = useCallbackRef(onResize)

    useEffect(() => {
        let rAF = 0
        if (element) {
            const resizeObserver = new ResizeObserver(() => {
                cancelAnimationFrame(rAF)
                rAF = window.requestAnimationFrame(handleResize)
            })

            resizeObserver.observe(element)

            return () => {
                window.cancelAnimationFrame(rAF)
                resizeObserver.unobserve(element)
            }
        }

        return undefined
    }, [element, handleResize])
}

export default useResizeObserver

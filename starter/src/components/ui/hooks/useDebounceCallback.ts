import { useCallback, useEffect, useRef } from 'react'
import useCallbackRef from './useCallbackRef'

const noop = () => {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    options: number | { delay: number; flushOnUnmount?: boolean },
) {
    const delay = typeof options === 'number' ? options : options.delay
    const flushOnUnmount =
        typeof options === 'number' ? false : options.flushOnUnmount
    const handleCallback = useCallbackRef(callback)
    const debounceTimerRef = useRef(0)

    const lastCallback = Object.assign(
        useCallback(
            (...args: Parameters<T>) => {
                window.clearTimeout(debounceTimerRef.current)
                const flush = () => {
                    if (debounceTimerRef.current !== 0) {
                        debounceTimerRef.current = 0
                        handleCallback(...args)
                    }
                }
                lastCallback.flush = flush
                debounceTimerRef.current = window.setTimeout(flush, delay)
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [handleCallback, delay],
        ),
        { flush: noop },
    )

    useEffect(
        () => () => {
            window.clearTimeout(debounceTimerRef.current)
            if (flushOnUnmount) {
                lastCallback.flush()
            }
        },
        [lastCallback, flushOnUnmount],
    )

    return lastCallback
}

export default useDebouncedCallback

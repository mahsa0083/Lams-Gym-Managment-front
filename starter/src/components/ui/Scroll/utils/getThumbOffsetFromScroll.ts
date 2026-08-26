import type { Sizes } from '../types'
import getThumbSize from './getThumbSize'
import linearScale from './linearScale'

function clamp(value: number, [min, max]: [number, number]): number {
    return Math.min(max, Math.max(min, value))
}

function getThumbOffsetFromScroll(
    scrollPos: number,
    sizes: Sizes,
    dir: 'rtl' | 'ltr' = 'ltr',
) {
    const thumbSizePx = getThumbSize(sizes)
    const scrollbarPadding =
        sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd
    const scrollbar = sizes.scrollbar.size - scrollbarPadding
    const maxScrollPos = sizes.content - sizes.viewport
    const maxThumbPos = scrollbar - thumbSizePx
    const scrollClampRange =
        dir === 'ltr' ? [0, maxScrollPos] : [maxScrollPos * -1, 0]
    const scrollWithoutMomentum = clamp(
        scrollPos,
        scrollClampRange as [number, number],
    )
    const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos])
    return interpolate(scrollWithoutMomentum)
}

export default getThumbOffsetFromScroll

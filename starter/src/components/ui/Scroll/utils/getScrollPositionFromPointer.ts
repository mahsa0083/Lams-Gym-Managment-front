import type { Sizes } from '../types'
import getThumbSize from './getThumbSize'
import linearScale from './linearScale'

function getScrollPositionFromPointer(
    pointerPos: number,
    pointerOffset: number,
    sizes: Sizes,
    dir: 'ltr' | 'rtl' = 'ltr',
) {
    const thumbSizePx = getThumbSize(sizes)
    const thumbCenter = thumbSizePx / 2
    const offset = pointerOffset || thumbCenter
    const thumbOffsetFromEnd = thumbSizePx - offset
    const minPointerPos = sizes.scrollbar.paddingStart + offset
    const maxPointerPos =
        sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd
    const maxScrollPos = sizes.content - sizes.viewport
    const scrollRange =
        dir === 'ltr' ? [0, maxScrollPos] : [maxScrollPos * -1, 0]
    const interpolate = linearScale(
        [minPointerPos, maxPointerPos],
        scrollRange as [number, number],
    )
    return interpolate(pointerPos)
}

export default getScrollPositionFromPointer

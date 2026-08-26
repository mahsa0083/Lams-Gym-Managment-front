import type { Sizes } from '../types'
import getThumbRatio from './getThumbRatio'

function getThumbSize(sizes: Sizes) {
    const ratio = getThumbRatio(sizes.viewport, sizes.content)
    const scrollbarPadding =
        sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd
    const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio
    return Math.max(thumbSize, 18)
}

export default getThumbSize

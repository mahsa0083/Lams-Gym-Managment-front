function isScrollingWithinScrollbarBounds(
    scrollPos: number,
    maxScrollPos: number,
) {
    return scrollPos > 0 && scrollPos < maxScrollPos
}

export default isScrollingWithinScrollbarBounds

function getContrast(color: string): 'light' | 'dark' {
    let r: number, g: number, b: number

    if (color.startsWith('#')) {
        let hex = color.slice(1)
        if (hex.length === 3) {
            hex = hex
                .split('')
                .map((c) => c + c)
                .join('')
        }
        const num = parseInt(hex, 16)
        r = (num >> 16) & 255
        g = (num >> 8) & 255
        b = num & 255
    } else if (color.startsWith('rgb')) {
        const values = color
            .replace(/[^\d,]/g, '')
            .split(',')
            .map(Number)
        ;[r, g, b] = values
    } else {
        throw new Error('Unsupported color format')
    }

    // Perceived brightness (W3C formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    return brightness > 130 ? 'light' : 'dark'
}

export default getContrast

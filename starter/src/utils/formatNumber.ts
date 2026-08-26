// Format large numbers with K, M, B, T suffixes
export default function formatNumber(
    value: number,
    decimals: number = 2,
): string {
    if (value === 0) return '0'

    const suffixes = ['', 'K', 'M', 'B', 'T']
    const tier = (Math.log10(Math.abs(value)) / 3) | 0

    if (tier === 0) return value.toString()

    const suffix = suffixes[tier]
    const scale = Math.pow(10, tier * 3)
    const scaled = value / scale

    return scaled.toFixed(decimals) + suffix
}

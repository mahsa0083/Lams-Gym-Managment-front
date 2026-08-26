import formatCurrency from './formatCurrency'

// Format currency with large number suffixes
export default function formatCurrencyCompact(
    value: number,
    currency: string = 'USD',
    toFixed: number = 2,
): string {
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(toFixed)}T`
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(toFixed)}B`
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(toFixed)}M`
    } else if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(toFixed)}K`
    } else {
        return formatCurrency(value, currency)
    }
}

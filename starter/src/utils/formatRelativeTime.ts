function formatRelativeTime(date: Date | string | number): string {
    const now = new Date()
    const targetDate = new Date(date)
    const diffInSeconds = Math.floor(
        (now.getTime() - targetDate.getTime()) / 1000,
    )

    if (isNaN(targetDate.getTime())) {
        return 'Invalid date'
    }

    if (diffInSeconds < 60) {
        return 'just now'
    }

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['week', 60 * 60 * 24 * 7],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
    ]

    for (const [unit, secondsInUnit] of units) {
        const diff = Math.floor(diffInSeconds / secondsInUnit)
        if (diff >= 1) {
            return rtf.format(-diff, unit)
        }
    }

    return 'just now'
}

export default formatRelativeTime

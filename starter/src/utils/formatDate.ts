import dayjs from 'dayjs'

export const formatDate = (
    date: string | Date,
    format: string = 'MMM DD, YYYY',
): string => {
    if (!date) return ''
    return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
    if (!date) return ''
    return dayjs(date).format('MMM DD, YYYY HH:mm')
}

export const formatRelativeTime = (date: string | Date): string => {
    if (!date) return ''
    return dayjs(date).fromNow()
}

export const isValidDate = (date: string | Date): boolean => {
    return dayjs(date).isValid()
}

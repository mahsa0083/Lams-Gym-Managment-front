import React from 'react'

const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightSearchMatch = (
    text: string,
    searchTerm: string,
): React.ReactNode => {
    if (!searchTerm.trim()) {
        return text
    }

    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
        if (regex.test(part)) {
            return (
                <mark
                    key={index}
                    className="bg-yellow-200 text-yellow-900 px-0.5 rounded-sm font-medium"
                >
                    {part}
                </mark>
            )
        }
        return part
    })
}

export default highlightSearchMatch

import { useCallback } from 'react'

const whiteListTwColor = [
    {
        background: 'bg-indigo-200 dark:bg-indigo-200',
        text: 'text-indigo-200 dark:text-indigo-200',
    },
    {
        background: 'bg-sky-200 dark:bg-sky-200',
        text: 'text-sky-200 dark:text-sky-200',
    },
    {
        background: 'bg-green-200 dark:bg-green-200',
        text: 'text-green-200 dark:text-green-200',
    },
    {
        background: 'bg-emerald-200 dark:bg-emerald-200',
        text: 'text-emerald-200 dark:text-emerald-200',
    },
    {
        background: 'bg-cyan-200 dark:bg-cyan-200',
        text: 'text-cyan-200 dark:text-cyan-200',
    },
    {
        background: 'bg-blue-200 dark:bg-blue-200',
        text: 'text-blue-200 dark:text-blue-200',
    },
    {
        background: 'bg-teal-200 dark:bg-teal-200',
        text: 'text-teal-200 dark:text-teal-200',
    },
    {
        background: 'bg-fuchsia-200 dark:bg-fuchsia-200',
        text: 'text-fuchsia-200 dark:text-fuchsia-200',
    },
    {
        background: 'bg-pink-200 dark:bg-pink-200',
        text: 'text-pink-200 dark:text-pink-200',
    },
    {
        background: 'bg-rose-200 dark:bg-rose-200',
        text: 'text-rose-200 dark:text-rose-200',
    },
    {
        background: 'bg-red-200 dark:bg-red-200',
        text: 'text-red-200 dark:text-red-200',
    },
    {
        background: 'bg-amber-200 dark:bg-amber-200',
        text: 'text-amber-200 dark:text-amber-200',
    },
    {
        background: 'bg-violet-200 dark:bg-violet-200',
        text: 'text-violet-200 dark:text-violet-200',
    },
    {
        background: 'bg-purple-200 dark:bg-purple-200',
        text: 'text-purple-200 dark:text-purple-200',
    },
]

function useRandomColor() {
    const hashName = (name: string) => {
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            const charCode = name.charCodeAt(i)
            hash += charCode
        }
        return hash
    }

    const generateColor = useCallback((name: string) => {
        const hash = hashName(name)
        const index = hash % whiteListTwColor.length
        return whiteListTwColor[index]
    }, [])

    return generateColor
}

export default useRandomColor

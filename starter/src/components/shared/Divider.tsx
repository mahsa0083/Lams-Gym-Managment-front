import classNames from '@/utils/classNames'

type DividerProps = {
    orientation?: 'horizontal' | 'vertical'
    className?: string
}

const Divider = ({
    orientation = 'horizontal',
    className = '',
}: DividerProps) => {
    const baseClasses = 'bg-gray-200 dark:bg-gray-800'
    const orientationClasses =
        orientation === 'vertical' ? 'w-px h-full mx-2' : 'h-px w-full my-2'

    return (
        <div
            className={classNames(baseClasses, orientationClasses, className)}
            role="separator"
        />
    )
}

export default Divider

import classNames from '@/utils/classNames'
import { ComponentProps } from 'react'

type ContentFrameProps = ComponentProps<'div'> & {
    withGap?: boolean
}

const ContentFrame = ({ className, children, withGap }: ContentFrameProps) => {
    if (withGap) {
        return (
            <div className="min-h-screen min-w-0 relative w-full p-2">
                <div className="bg-white dark:bg-gray-900 shadow flex flex-col flex-1 h-full rounded-lg over">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <div
            className={classNames(
                'flex flex-col flex-auto min-h-screen min-w-0 relative w-full bg-white dark:bg-gray-900',
                className,
            )}
        >
            {children}
        </div>
    )
}

export default ContentFrame

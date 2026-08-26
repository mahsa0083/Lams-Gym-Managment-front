import type { SvgProps } from '@/@types/common'
import classNames from '@/utils/classNames'

const BlankSvg = ({ className, ...rest }: SvgProps) => {
    return (
        <svg
            viewBox="0 0 170 110"
            className={classNames('w-full fill-none', className)}
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path
                d="M0 0H170V110H0V0Z"
                className="fill-white dark:fill-gray-950"
            />
            <path
                d="M0 0H170V11.3084H0V0Z"
                className="fill-gray-100 dark:fill-gray-700"
            />
            <path
                d="M9.99999 6C9.99999 4.89543 9.10456 4 7.99999 4C6.89542 4 5.99999 4.89543 5.99999 6C5.99999 7.10457 6.89542 8 7.99999 8C9.10456 8 9.99999 7.10457 9.99999 6Z"
                className="fill-red-500"
            />
            <path
                d="M17 6C17 4.89543 16.1046 4 15 4C13.8954 4 13 4.89543 13 6C13 7.10457 13.8954 8 15 8C16.1046 8 17 7.10457 17 6Z"
                className="fill-yellow-400"
            />
            <path
                d="M24 6C24 4.89543 23.1046 4 22 4C20.8954 4 20 4.89543 20 6C20 7.10457 20.8954 8 22 8C23.1046 8 24 7.10457 24 6Z"
                className="fill-emerald-500"
            />
            <path
                d="M0 11L170 11"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
        </svg>
    )
}

export default BlankSvg

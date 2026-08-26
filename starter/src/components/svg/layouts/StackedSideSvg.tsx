import type { SvgProps } from '@/@types/common'
import classNames from '@/utils/classNames'

const StackedSideSvg = ({ className, ...rest }: SvgProps) => {
    return (
        <svg
            viewBox="0 0 170 110"
            className={classNames('w-full fill-none', className)}
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path
                d="M0 0H170V110H0V0Z"
                className="fill-white dark:fill-gray-900"
            />
            <path
                d="M0 11H50V110H0V11Z"
                className="fill-white dark:fill-gray-950"
            />
            <path
                d="M0 0H170V11.3084H0V0Z"
                className="fill-gray-100 dark:fill-gray-700"
            />
            <path
                d="M10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8C9.10457 8 10 7.10457 10 6Z"
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
                d="M50 11H170V23H50V11Z"
                className="fill-white dark:fill-gray-900"
            />
            <path
                d="M0 11.3084H170"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M50 23L170 23"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M50 11.3084L50 110"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M13 11.3084L13 110"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M160.569 31H59.4312C58.6408 31 58 31.8059 58 32.8V101.2C58 102.194 58.6408 103 59.4312 103H160.569C161.359 103 162 102.194 162 101.2V32.8C162 31.8059 161.359 31 160.569 31Z"
                className="fill-gray-300/20 dark:fill-gray-800"
            />
            <path
                d="M9 18.5C9 17.1193 7.88071 16 6.5 16C5.11929 16 4 17.1193 4 18.5C4 19.8807 5.11929 21 6.5 21C7.88071 21 9 19.8807 9 18.5Z"
                className="fill-primary"
            />
            <path
                d="M8 35.5C8 34.6716 7.32843 34 6.5 34C5.67157 34 5 34.6716 5 35.5C5 36.3284 5.67157 37 6.5 37C7.32843 37 8 36.3284 8 35.5Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M8 27.5C8 26.6716 7.32843 26 6.5 26C5.67157 26 5 26.6716 5 27.5C5 28.3284 5.67157 29 6.5 29C7.32843 29 8 28.3284 8 27.5Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M8 43.5C8 42.6716 7.32843 42 6.5 42C5.67157 42 5 42.6716 5 43.5C5 44.3284 5.67157 45 6.5 45C7.32843 45 8 44.3284 8 43.5Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M39.5 17H23.5C22.6716 17 22 17.6716 22 18.5C22 19.3284 22.6716 20 23.5 20H39.5C40.3284 20 41 19.3284 41 18.5C41 17.6716 40.3284 17 39.5 17Z"
                className="fill-primary"
            />
            <path
                d="M39.5 26H23.5C22.6716 26 22 26.6716 22 27.5C22 28.3284 22.6716 29 23.5 29H39.5C40.3284 29 41 28.3284 41 27.5C41 26.6716 40.3284 26 39.5 26Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M39.5 35H23.5C22.6716 35 22 35.6716 22 36.5C22 37.3284 22.6716 38 23.5 38H39.5C40.3284 38 41 37.3284 41 36.5C41 35.6716 40.3284 35 39.5 35Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M39.5 44H23.5C22.6716 44 22 44.6716 22 45.5C22 46.3284 22.6716 47 23.5 47H39.5C40.3284 47 41 46.3284 41 45.5C41 44.6716 40.3284 44 39.5 44Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
        </svg>
    )
}

export default StackedSideSvg

import type { SvgProps } from '@/@types/common'
import classNames from '@/utils/classNames'

const SeamLessSideSvg = ({ className, ...rest }: SvgProps) => {
    return (
        <svg
            viewBox="0 0 170 110"
            className={classNames('w-full fill-none', className)}
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path
                d="M0 0H170V110H0V0Z"
                className="fill-gray-50 dark:fill-gray-900"
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
                d="M0 11H39V110H0V11Z"
                className="fill-white dark:fill-gray-950"
            />
            <path
                d="M0 11.3084H170"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M39 22.6168L170 22.6168"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M39 11.3084L39 110"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M160.417 31.8692H48.5826C47.7085 31.8692 47 32.6631 47 33.6425V101.03C47 102.01 47.7085 102.804 48.5826 102.804H160.417C161.291 102.804 162 102.01 162 101.03V33.6425C162 32.6631 161.291 31.8692 160.417 31.8692Z"
                className="fill-gray-300/20 dark:fill-gray-800"
            />
            <path
                d="M13 22.5C13 20.567 11.433 19 9.5 19C7.567 19 6 20.567 6 22.5C6 24.433 7.567 26 9.5 26C11.433 26 13 24.433 13 22.5Z"
                className="fill-primary"
            />
            <path
                d="M23.5 30H7.5C6.67157 30 6 30.6716 6 31.5C6 32.3284 6.67157 33 7.5 33H23.5C24.3284 33 25 32.3284 25 31.5C25 30.6716 24.3284 30 23.5 30Z"
                className="fill-primary"
            />
            <path
                d="M23.5 39H7.5C6.67157 39 6 39.6716 6 40.5C6 41.3284 6.67157 42 7.5 42H23.5C24.3284 42 25 41.3284 25 40.5C25 39.6716 24.3284 39 23.5 39Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M23.5 48H7.5C6.67157 48 6 48.6716 6 49.5C6 50.3284 6.67157 51 7.5 51H23.5C24.3284 51 25 50.3284 25 49.5C25 48.6716 24.3284 48 23.5 48Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M23.5 57H7.5C6.67157 57 6 57.6716 6 58.5C6 59.3284 6.67157 60 7.5 60H23.5C24.3284 60 25 59.3284 25 58.5C25 57.6716 24.3284 57 23.5 57Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
        </svg>
    )
}

export default SeamLessSideSvg

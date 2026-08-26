import type { SvgProps } from '@/@types/common'
import classNames from '@/utils/classNames'

const DuoTierHeaderSvg = ({ className, ...rest }: SvgProps) => {
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
                d="M0 11H170V32H0V11Z"
                className="fill-white dark:fill-gray-900"
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
                d="M0 11L170 11"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M0 32L170 32"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M157.95 41H13.0505C11.918 41 11 41.694 11 42.55V101.45C11 102.306 11.918 103 13.0505 103H157.95C159.082 103 160 102.306 160 101.45V42.55C160 41.694 159.082 41 157.95 41Z"
                className="fill-gray-300/20 dark:fill-gray-800"
            />
            <path
                d="M17 17.5C17 16.1193 15.8807 15 14.5 15C13.1193 15 12 16.1193 12 17.5C12 18.8807 13.1193 20 14.5 20C15.8807 20 17 18.8807 17 17.5Z"
                className="fill-primary"
            />
            <path
                d="M32.0526 16H21.9474C21.4242 16 21 16.6716 21 17.5C21 18.3284 21.4242 19 21.9474 19H32.0526C32.5758 19 33 18.3284 33 17.5C33 16.6716 32.5758 16 32.0526 16Z"
                className="fill-primary"
            />
            <path
                d="M39.0526 24H28.9474C28.4242 24 28 24.6716 28 25.5C28 26.3284 28.4242 27 28.9474 27H39.0526C39.5758 27 40 26.3284 40 25.5C40 24.6716 39.5758 24 39.0526 24Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M55.0526 24H44.9474C44.4242 24 44 24.6716 44 25.5C44 26.3284 44.4242 27 44.9474 27H55.0526C55.5758 27 56 26.3284 56 25.5C56 24.6716 55.5758 24 55.0526 24Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M157.342 24H139.658C138.742 24 138 24.6716 138 25.5C138 26.3284 138.742 27 139.658 27H157.342C158.258 27 159 26.3284 159 25.5C159 24.6716 158.258 24 157.342 24Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M158.053 16H147.947C147.424 16 147 16.6716 147 17.5C147 18.3284 147.424 19 147.947 19H158.053C158.576 19 159 18.3284 159 17.5C159 16.6716 158.576 16 158.053 16Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M23.0526 24H12.9474C12.4242 24 12 24.6716 12 25.5C12 26.3284 12.4242 27 12.9474 27H23.0526C23.5758 27 24 26.3284 24 25.5C24 24.6716 23.5758 24 23.0526 24Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
        </svg>
    )
}

export default DuoTierHeaderSvg

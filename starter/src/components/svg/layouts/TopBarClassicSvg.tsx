import type { SvgProps } from '@/@types/common'
import classNames from '@/utils/classNames'

const TopBarClassicSvg = ({ className, ...rest }: SvgProps) => {
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
                d="M0 11H170V23H0V11Z"
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
                d="M0 23L170 23"
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            <path
                d="M157.95 31H13.0505C11.918 31 11 31.8059 11 32.8V101.2C11 102.194 11.918 103 13.0505 103H157.95C159.082 103 160 102.194 160 101.2V32.8C160 31.8059 159.082 31 157.95 31Z"
                className="fill-gray-300/20 dark:fill-gray-800"
            />
            <path
                d="M17 17.5C17 16.1193 15.8807 15 14.5 15C13.1193 15 12 16.1193 12 17.5C12 18.8807 13.1193 20 14.5 20C15.8807 20 17 18.8807 17 17.5Z"
                className="fill-primary"
            />
            <path
                d="M32.0526 16H21.9474C21.4242 16 21 16.6716 21 17.5C21 18.3284 21.4242 19 21.9474 19H32.0526C32.5758 19 33 18.3284 33 17.5C33 16.6716 32.5758 16 32.0526 16Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M48.0526 16H37.9474C37.4242 16 37 16.6716 37 17.5C37 18.3284 37.4242 19 37.9474 19H48.0526C48.5758 19 49 18.3284 49 17.5C49 16.6716 48.5758 16 48.0526 16Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M64.0526 16H53.9474C53.4242 16 53 16.6716 53 17.5C53 18.3284 53.4242 19 53.9474 19H64.0526C64.5758 19 65 18.3284 65 17.5C65 16.6716 64.5758 16 64.0526 16Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M158.053 16H147.947C147.424 16 147 16.6716 147 17.5C147 18.3284 147.424 19 147.947 19H158.053C158.576 19 159 18.3284 159 17.5C159 16.6716 158.576 16 158.053 16Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
            <path
                d="M142.053 16H131.947C131.424 16 131 16.6716 131 17.5C131 18.3284 131.424 19 131.947 19H142.053C142.576 19 143 18.3284 143 17.5C143 16.6716 142.576 16 142.053 16Z"
                className="fill-gray-300 dark:fill-gray-700"
            />
        </svg>
    )
}

export default TopBarClassicSvg

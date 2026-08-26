import { SvgProps } from '@/@types/common'
const FileImage = ({ height = 100, width = 100, ...rest }: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            width={width}
            height={height}
            {...rest}
        >
            <path
                d="M4.8 4C4.8 2.2 6.3.8 8 .8h16c.1 0 .2 0 .3.1l10.8 10.8c.1.1.1.2.1.3v24c0 1.8-1.5 3.2-3.2 3.2H8c-1.8 0-3.2-1.5-3.2-3.2V4z"
                className="stroke-gray-400 dark:stroke-gray-500 stroke-[1.5px] fill-white dark:fill-gray-700"
            />
            <path
                d="M24 .5V8c0 2.2 1.8 4 4 4h7.5"
                className="stroke-gray-400 dark:stroke-gray-500 stroke-[1.5px] fill-white dark:fill-gray-700"
            />
            <path
                d="M30 28.1 27 21c-1-2.4-2.9-2.5-4.2-.2L21 24.1c-.9 1.7-2.7 1.8-3.9.3l-.2-.3c-1.3-1.6-3-1.4-3.9.4l-1.7 3.4c-1.3 2.3.4 5.1 3 5.1h12.4c2.6 0 4.3-2.6 3.3-4.9zM15.7 19.4c1.6 0 2.9-1.3 2.9-2.9s-1.3-2.9-2.9-2.9c-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9z"
                className="fill-indigo-500 dark:fill-indigo-500 stroke-[1.5px]"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default FileImage

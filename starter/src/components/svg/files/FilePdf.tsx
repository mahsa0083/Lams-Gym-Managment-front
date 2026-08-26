import { SvgProps } from '@/@types/common'
const FilePdf = ({ height = 100, width = 100, ...rest }: SvgProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 38 40"
            width={width}
            height={height}
            {...rest}
        >
            <path
                d="M6.75 4A3.26 3.26 0 0 1 10 .75h16a.46.46 0 0 1 .32.13l10.8 10.8a.46.46 0 0 1 .13.32v24A3.26 3.26 0 0 1 34 39.25H10A3.26 3.26 0 0 1 6.75 36Z"
                className="stroke-gray-400 dark:stroke-gray-500 stroke-[1.5px] fill-white dark:fill-gray-700"
            />
            <path
                d="M26 .5V8a4 4 0 0 0 4 4h7.5"
                className="stroke-gray-400 dark:stroke-gray-500 stroke-[1.5px] fill-white dark:fill-gray-700"
            />
            <rect
                width={27}
                height={16}
                y={18}
                rx={2}
                className="fill-[#d61316]"
            />
            <g>
                <g>
                    <path
                        className="fill-white"
                        d="M4.1,29.7v-7.9h3c0.6,0,1.1,0.1,1.5,0.3c0.4,0.2,0.7,0.5,0.9,0.9s0.3,0.8,0.3,1.3c0,0.5-0.1,1-0.3,1.3
                        c-0.2,0.4-0.5,0.7-0.9,0.9c-0.4,0.2-0.9,0.3-1.5,0.3h-2v-1.2h1.8c0.4,0,0.6-0.1,0.9-0.2s0.4-0.3,0.5-0.5c0.1-0.2,0.2-0.5,0.2-0.7
                        s-0.1-0.5-0.2-0.7c-0.1-0.2-0.3-0.4-0.5-0.5C7.5,23.1,7.2,23,6.9,23H5.5v6.7H4.1z"
                    />
                    <path
                        className="fill-white"
                        d="M13.5,29.7h-2.7v-7.9h2.7c0.8,0,1.5,0.2,2,0.5c0.6,0.3,1,0.8,1.3,1.4c0.3,0.6,0.5,1.3,0.5,2.1
                        c0,0.8-0.2,1.5-0.5,2.1s-0.7,1-1.3,1.4C15,29.6,14.3,29.7,13.5,29.7z M12.3,28.5h1.2c0.5,0,1-0.1,1.4-0.3c0.4-0.2,0.6-0.5,0.8-0.9
                        c0.2-0.4,0.3-0.9,0.3-1.5s-0.1-1.1-0.3-1.5s-0.5-0.7-0.8-0.9c-0.4-0.2-0.8-0.3-1.3-0.3h-1.2V28.5z"
                    />
                    <path
                        className="fill-white"
                        d="M18.4,29.7v-7.9h5.1v1.2h-3.6v2.1h3.3v1.2h-3.3v3.4H18.4z"
                    />
                </g>
            </g>
        </svg>
    )
}

export default FilePdf

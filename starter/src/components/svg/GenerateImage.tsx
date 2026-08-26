import type { SvgProps } from '@/@types/common'
const GenerateImage = ({ height = 100, width = 100, ...rest }: SvgProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        className="icon"
        viewBox="0 0 96 96"
        {...rest}
    >
        <linearGradient
            id="a"
            x1={35}
            x2={35}
            y1={95.059}
            y2={9.499}
            gradientTransform="matrix(1 0 0 -1 0 98)"
            gradientUnits="userSpaceOnUse"
        >
            <stop stopColor="#f92599"></stop>
            <stop offset="50%" stopColor="#b232ff" />
            <stop offset="100%" stopColor="#2953f6"></stop>
        </linearGradient>
        <path
            d="M26.5 31c0 4.7 3.8 8.5 8.5 8.5s8.5-3.8 8.5-8.5-3.8-8.5-8.5-8.5-8.5 3.8-8.5 8.5zm12 0c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5 1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5z"
            style={{
                fillRule: 'evenodd',
                clipRule: 'evenodd',
                fill: 'url(#a)',
            }}
        />
        <linearGradient
            id="b"
            x1={47.5}
            x2={47.5}
            y1={95.059}
            y2={9.499}
            gradientTransform="matrix(1 0 0 -1 0 98)"
            gradientUnits="userSpaceOnUse"
        >
            <stop stopColor="#f92599"></stop>
            <stop offset="50%" stopColor="#b232ff" />
            <stop offset="100%" stopColor="#2953f6"></stop>
        </linearGradient>
        <path
            d="M80.9 37.4c-2.7-2.7-7.2-2.7-9.9 0L49.9 58.6c-.8.8-2 .8-2.8 0L41.5 53c-2.7-2.7-7.2-2.7-9.9 0l-20 19.8c-.1-.6-.1-1.2-.1-1.8V24c0-6.9 5.6-12.5 12.5-12.5h28.5c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5H24C14.3 6.5 6.5 14.3 6.5 24v47c0 9.7 7.8 17.5 17.5 17.5h47c9.7 0 17.5-7.8 17.5-17.5V49.3c0-2.8-1.1-5.5-3.1-7.4l-4.5-4.5zM83.5 71c0 6.9-5.6 12.5-12.5 12.5H24c-4.3 0-8.2-2.2-10.4-5.6l21.5-21.5c.8-.8 2-.8 2.8 0l5.6 5.6c2.7 2.7 7.2 2.7 9.9 0l21.2-21c.8-.8 2-.8 2.8 0l4.5 4.5c1 1 1.6 2.4 1.6 3.9V71z"
            style={{
                fillRule: 'evenodd',
                clipRule: 'evenodd',
                fill: 'url(#b)',
            }}
        />
        <linearGradient
            id="c"
            x1={70.305}
            x2={84.305}
            y1={6.577}
            y2={25.565}
            gradientTransform="translate(-1.609 .36)"
            gradientUnits="userSpaceOnUse"
        >
            <stop stopColor="#f92599"></stop>
            <stop offset="50%" stopColor="#b232ff" />
            <stop offset="100%" stopColor="#2953f6"></stop>
        </linearGradient>
        <path
            d="M64.2 19.3c2.6 0 5 1.2 6.9 3.3 2 2.3 3.1 5.3 3.1 8.6 0 1 .9 1.7 2.1 1.7h.1c1.2 0 2.1-.8 2.1-1.7 0-3.3 1.1-6.3 3.2-8.6 1.9-2.1 4.3-3.3 6.9-3.2 1.2 0 2.1-.8 2.1-1.7v-.1c0-1-.9-1.7-2.1-1.7-2.6 0-5-1.2-6.9-3.3-2-2.3-3.1-5.3-3.1-8.6 0-1-.9-1.7-2.1-1.7h-.1c-1.2 0-2.1.8-2.1 1.7 0 3.3-1.1 6.3-3.2 8.6-1.9 2.1-4.3 3.3-6.9 3.2-.6 0-1.1.2-1.5.5-.4.3-.6.8-.6 1.2v.1c0 .9.9 1.7 2.1 1.7z"
            style={{
                fill: 'url(#c)',
            }}
        />
    </svg>
)
export default GenerateImage

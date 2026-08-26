import Logo from '@/components/template/Logo'
import Button from '@/components/ui/Button'
import classNames from '@/utils/classNames'
import type { CommonProps } from '@/@types/common'

const Side = ({ children }: CommonProps) => {
    const GRID_WIDTH = 'w-[470px]'
    const DIVIDER_COLOR = 'divide-white/40'
    const SVG_OPACITY = 'opacity-10'

    return (
        <div className="flex h-full p-4 bg-white dark:bg-gray-900 flex-1">
            <div className=" flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children}
                </div>
            </div>
            <div className="lg:flex hidden overflow-hidden rounded-xl relative w-[520px] flex-1 max-w-[720px] border border-gray-200 dark:border-gray-800 bg-primary">
                <div
                    className={classNames(
                        'flex flex-col flex-1 justify-between divide-y z-10',
                        DIVIDER_COLOR,
                    )}
                >
                    <div
                        className={classNames(
                            'flex flex-1 divide-x relative',
                            DIVIDER_COLOR,
                        )}
                    >
                        <div className="flex-1 relative">
                            <div className="absolute w-2 h-2 -bottom-1 -right-1 bg-white z-20"></div>
                        </div>
                        <div className={classNames('relative', GRID_WIDTH)}>
                            <div className="absolute w-full h-full top-0 left-0 bg-primary">
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 161 161"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={SVG_OPACITY}
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M50.7645 0.428005V160.572"
                                        stroke="white"
                                        strokeWidth="0.5px"
                                    />
                                    <path
                                        d="M80.6943 0.428005V160.572"
                                        stroke="white"
                                        strokeWidth="0.5px"
                                    />
                                    <path
                                        d="M110.624 0.386559V160.531"
                                        stroke="white"
                                        strokeWidth="0.5px"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute w-2 h-2 -bottom-1 -left-1 bg-white z-20"></div>
                        </div>
                    </div>
                    <div
                        className={classNames(
                            'flex z-10 divide-x',
                            DIVIDER_COLOR,
                        )}
                    >
                        <div className="flex-1 bg-primary text-white/30 bg-[repeating-linear-gradient(125deg,_transparent,_transparent_6px,_currentColor_6px,_currentColor_7px)]"></div>
                        <div className={classNames('relative', GRID_WIDTH)}>
                            <div className="absolute w-full h-full bottom-0 left-0 bg-primary -z-10">
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 161 161"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={SVG_OPACITY}
                                    preserveAspectRatio="none"
                                >
                                    <g clipPath="url(#section-grid-clip)">
                                        <rect
                                            x={11.1172}
                                            y={10.9229}
                                            width={139.154}
                                            height={139.154}
                                            stroke="white"
                                            strokeWidth="0.5px"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M50.7645 0.428005V160.572"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M80.6943 0.428005V160.572"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M110.624 0.386559V160.531"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M0.622345 50.5702H160.766"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M0.622345 80.5H160.766"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M0.622345 110.43H160.766"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <circle
                                            cx={80.6943}
                                            cy={80.5}
                                            r={69.5771}
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <ellipse
                                            cx={80.6943}
                                            cy={80.5}
                                            rx={42.3682}
                                            ry={42.3682}
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <ellipse
                                            cx={80.6943}
                                            cy={80.5}
                                            rx={29.9298}
                                            ry={29.9298}
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M11.1172 10.9229L150.271 150.077"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                        <path
                                            d="M150.271 10.9229L11.1172 150.077"
                                            stroke="white"
                                            strokeWidth="0.5px"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="section-grid-clip">
                                            <rect
                                                width={161}
                                                height={161}
                                                fill="white"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <div
                                className={classNames(
                                    'h-[470px] flex items-center justify-center border border-white/40 bg-white/20 z-10',
                                    GRID_WIDTH,
                                )}
                            >
                                <div className="max-w-[400px]">
                                    <div className="mb-4">
                                        <Logo
                                            type="streamline"
                                            mode="dark"
                                            logoWidth={60}
                                        />
                                    </div>
                                    <h1 className="text-white font-semibold">
                                        Start your journey with us!
                                    </h1>
                                    <p className="text-white opacity-80 text-xl font-light mt-4">
                                        Discover the power of our template and
                                        unlock a world of possibilities.
                                    </p>
                                    <Button className="mt-8 dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:hover:border-gray-200">
                                        Learn More
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 bg-primary text-white/30 bg-[repeating-linear-gradient(125deg,_transparent,_transparent_6px,_currentColor_6px,_currentColor_7px)]"></div>
                    </div>
                    <div
                        className={classNames(
                            'flex flex-1 divide-x',
                            DIVIDER_COLOR,
                        )}
                    >
                        <div className="flex-1 relative">
                            <div className="absolute w-2 h-2 -top-1 -right-1 bg-white z-20"></div>
                        </div>
                        <div className={classNames('relative', GRID_WIDTH)}>
                            <div className="absolute w-full h-full top-0 left-0 bg-primary">
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 161 161"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={SVG_OPACITY}
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M50.7645 0.428005V160.572"
                                        stroke="white"
                                        strokeWidth="0.5px"
                                    />
                                    <path
                                        d="M80.6943 0.428005V160.572"
                                        stroke="white"
                                        strokeWidth="0.5px"
                                    />
                                    <path
                                        d="M110.624 0.386559V160.531"
                                        stroke="white"
                                        strokeWidth="0.5px"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute w-2 h-2 -top-1 -left-1 bg-white z-20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Side

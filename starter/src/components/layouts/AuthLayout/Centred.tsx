'use client'

import Logo from '@/components/template/Logo'
import Container from '@/components/shared/Container'
import type { CommonProps } from '@/@types/common'

const Centred = ({ children }: CommonProps) => {
    return (
        <div className="bg-white dark:bg-gray-900 h-full">
            <Container size="md" className="h-full px-2">
                <div className="flex flex-col justify-between border-r border-l border-gray-200 dark:border-gray-700 min-h-screen">
                    {/* هدر بالای صفحه و لوگو */}
                    <div className="grid grid-cols-3 flex-1">
                        <div className="w-full h-full relative">
                            <svg
                                width="1"
                                height="100%"
                                className="text-gray-200 dark:text-gray-700 min-h-10 flex-1 absolute right-0"
                            >
                                <line
                                    x1="0.5"
                                    y1="0"
                                    x2="0.5"
                                    y2="100%"
                                    stroke="currentColor"
                                    strokeDasharray="4 6"
                                    strokeLinecap="round"
                                ></line>
                            </svg>
                            <div className="absolute w-2 h-2 -bottom-px -left-2 border-b border-r border-gray-400"></div>
                        </div>
                        <div className="py-8 flex justify-center">
                            <Logo logoWidth={100} />
                        </div>
                        <div className="w-full h-full relative">
                            <svg
                                width="1"
                                height="100%"
                                className="text-gray-200 dark:text-gray-700 min-h-10 flex-1 absolute left-0"
                            >
                                <line
                                    x1="0.5"
                                    y1="0"
                                    x2="0.5"
                                    y2="100%"
                                    stroke="currentColor"
                                    strokeDasharray="4 6"
                                    strokeLinecap="round"
                                ></line>
                            </svg>
                            <div className="absolute w-2 h-2 -bottom-px -right-2 border-b border-l border-gray-400"></div>
                        </div>
                    </div>

                    {/* بخش اصلی: حذف بنر جانبی و قرار گرفتن فرم کاملاً در مرکز */}
                    <div className="flex justify-center items-center py-12 border-t border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div className="w-full px-4 max-w-md flex justify-center">
                            {children}
                        </div>
                    </div>

                    {/* فوتر پایین صفحه */}
                    <div className="grid grid-cols-3 flex-1 min-h-25">
                        <div className="w-full h-full relative">
                            <svg
                                width="1"
                                height="100%"
                                className="text-gray-200 dark:text-gray-700 min-h-10 flex-1 absolute right-0"
                            >
                                <line
                                    x1="0.5"
                                    y1="0"
                                    x2="0.5"
                                    y2="100%"
                                    stroke="currentColor"
                                    strokeDasharray="4 6"
                                    strokeLinecap="round"
                                ></line>
                            </svg>
                            <div className="absolute w-2 h-2 -top-px -left-2 border-t border-r border-gray-400"></div>
                        </div>
                        <div />
                        <div className="w-full h-full relative">
                            <svg
                                width="1"
                                height="100%"
                                className="text-gray-200 dark:text-gray-700 min-h-10 flex-1 absolute left-0"
                            >
                                <line
                                    x1="0.5"
                                    y1="0"
                                    x2="0.5"
                                    y2="100%"
                                    stroke="currentColor"
                                    strokeDasharray="4 6"
                                    strokeLinecap="round"
                                ></line>
                            </svg>
                            <div className="absolute w-2 h-2 -top-px -right-2 border-t border-l border-gray-400"></div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Centred
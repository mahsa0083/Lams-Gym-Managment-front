import { useState, useEffect, useRef, useCallback } from 'react'
import Tabs from '@/components/ui/Tabs'
import Dropdown from '../ui/Dropdown'
import Button from '@/components/ui/Button'
import classNames from '@/utils/classNames'
import type { ReactNode, ComponentProps } from 'react'

type OverflowTabsProps = Omit<ComponentProps<'div'>, 'onChange'> & {
    tabList: Array<{ label: string | ReactNode; value: string }>
    value?: string
    onChange?: (value: string) => void
    tabListClass?: string
    tabNavClass?: string
}

const OverflowTabs = ({
    tabList,
    value,
    onChange,
    children,
    tabListClass,
    tabNavClass,
    className,
    ...props
}: OverflowTabsProps) => {
    const [visibleTabs, setVisibleTabs] =
        useState<Array<{ label: string | ReactNode; value: string }>>(tabList)
    const [overflowTabs, setOverflowTabs] = useState<
        Array<{ label: string | ReactNode; value: string }>
    >([])
    const [hasOverflow, setHasOverflow] = useState(false)

    const childrenRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const tabListRef = useRef<HTMLDivElement>(null)
    const measureRef = useRef<HTMLDivElement>(null)
    const dropdownWidth = 75

    const calculateOverflow = useCallback(() => {
        if (!containerRef.current || !tabListRef.current || !measureRef.current)
            return

        requestAnimationFrame(() => {
            if (
                !containerRef.current ||
                !tabListRef.current ||
                !measureRef.current
            )
                return

            const containerWidth = containerRef.current.offsetWidth
            const childrenWidth = children
                ? childrenRef.current?.offsetWidth || 0
                : 0
            const allTabElements = Array.from(
                measureRef.current.children,
            ) as HTMLElement[]

            let currentWidth = 0
            let visibleCount = 0

            const availableWidth = containerWidth - childrenWidth

            for (let i = 0; i < allTabElements.length; i++) {
                const tabWidth = allTabElements[i].offsetWidth
                if (currentWidth + tabWidth <= availableWidth) {
                    currentWidth += tabWidth
                    visibleCount++
                } else {
                    break
                }
            }

            if (visibleCount < tabList.length) {
                const availableWidthWithDropdown =
                    containerWidth - childrenWidth - dropdownWidth
                currentWidth = 0
                visibleCount = 0

                for (let i = 0; i < allTabElements.length; i++) {
                    const tabWidth = allTabElements[i].offsetWidth
                    if (currentWidth + tabWidth <= availableWidthWithDropdown) {
                        currentWidth += tabWidth
                        visibleCount++
                    } else {
                        break
                    }
                }
            }

            const newVisibleTabs = tabList.slice(0, visibleCount)
            const newOverflowTabs = tabList.slice(visibleCount)
            const newHasOverflow = newOverflowTabs.length > 0

            setVisibleTabs(newVisibleTabs)
            setOverflowTabs(newOverflowTabs)
            setHasOverflow(newHasOverflow)
        })
    }, [tabList, children, dropdownWidth])

    useEffect(() => {
        const handleResize = () => {
            requestAnimationFrame(calculateOverflow)
        }

        handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [calculateOverflow])

    useEffect(() => {
        requestAnimationFrame(calculateOverflow)
    }, [tabList, calculateOverflow])

    const handleTabChange = (newValue: string) => {
        onChange?.(newValue)
    }

    const handleDropdownItemClick = (eventKey: string) => {
        onChange?.(eventKey)
    }

    const selectedOverflowTab = overflowTabs.find((tab) => tab.value === value)
    const isOverflowTabSelected = !!selectedOverflowTab

    return (
        <div ref={containerRef} className="w-full" {...props}>
            <Tabs
                value={isOverflowTabSelected ? '' : value}
                onChange={handleTabChange}
                className={classNames(
                    'flex items-center',
                    className,
                    isOverflowTabSelected && 'tab-transparent-indicator',
                )}
            >
                <Tabs.TabList
                    ref={tabListRef}
                    className={classNames(
                        'flex-1 overflow-hidden flex-nowrap',
                        tabListClass,
                    )}
                >
                    {visibleTabs.map((tab) => (
                        <Tabs.TabNav
                            key={tab.value}
                            value={tab.value}
                            className={classNames(
                                'flex items-center gap-2 whitespace-nowrap',
                                tabNavClass,
                            )}
                        >
                            <span>{tab.label}</span>
                        </Tabs.TabNav>
                    ))}
                    {hasOverflow && (
                        <div className="flex items-center flex-shrink-0 ltr:ml-auto rtl:mr-auto">
                            <Dropdown
                                placement="bottom-end"
                                renderTitle={
                                    <Button
                                        variant={
                                            selectedOverflowTab
                                                ? 'subtle'
                                                : 'default'
                                        }
                                        size="sm"
                                        className="px-3"
                                    >
                                        More{' '}
                                        {overflowTabs.length > 0 &&
                                            `(${overflowTabs.length})`}
                                    </Button>
                                }
                            >
                                {overflowTabs.map((tab) => (
                                    <Dropdown.Item
                                        key={tab.value}
                                        eventKey={tab.value}
                                        className={classNames(
                                            'cursor-pointer',
                                            value === tab.value &&
                                                'bg-gray-100 font-medium',
                                        )}
                                        onClick={() =>
                                            handleDropdownItemClick(tab.value)
                                        }
                                    >
                                        {tab.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        </div>
                    )}
                </Tabs.TabList>

                <div
                    ref={childrenRef}
                    className="flex items-center gap-2 flex-shrink-0 ltr:ml-2 rtl:mr-2"
                >
                    {children}
                </div>
            </Tabs>
            <div
                ref={measureRef}
                className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1] flex"
                style={{ visibility: 'hidden' }}
            >
                {tabList.map((tab) => (
                    <div
                        key={`measure-${tab.value}`}
                        className="flex items-center gap-2 whitespace-nowrap px-4 py-2"
                    >
                        <span>{tab.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OverflowTabs

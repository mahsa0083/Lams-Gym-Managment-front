import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import classNames from '@/utils/classNames'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import ScrollBar from '@/components/ui/Scroll'
import IconFrame from '@/components/shared/IconFrame'
import highlightSearchMatch from '@/utils/highlightSearchMatch'
import {
    LiSearch,
    LiArrowUp,
    LiArrowDown,
    LiUser,
    LiBuilding,
    LiZap,
    LiSetting,
    LiNoteText2,
    LiAdd,
    LiBox,
    LiMessageQuestion,
    LiTickCircle,
    LiBook,
    LiFolder,
} from '@/icons'
import { apiGetSearchResult } from '@/services/client/CommonService'
import debounce from 'lodash/debounce'
import type {
    ReactNode,
    ChangeEvent,
    KeyboardEvent as ReactKeyboardEvent,
} from 'react'

type SearchData =
    | {
          type: 'quickAction'
          icon: string
          title: string
          path: string
          shortcut?: string
      }
    | { type: 'files'; fileType: string; title: string }
    | { type: 'user'; img: string; id: string; name: string; email: string }
    | { type: 'companies'; img: string; name: string; email: string }

type SearchResult = { title: string; data: SearchData[] }
type SearchCategory = 'all' | 'user' | 'companies' | 'quickAction'
type SearchProps = { className?: string; trigger?: 'icon' | 'input' }

const actionIcons: Record<string, ReactNode> = {
    task: <LiTickCircle />,
    settings: <LiSetting />,
    note: <LiNoteText2 />,
    person: <LiAdd />,
    product: <LiBox />,
    feedback: <LiMessageQuestion />,
    file: <LiFolder />,
    document: <LiBook />,
}

const categoryFilters: {
    value: SearchCategory
    label: string
    icon: ReactNode
}[] = [
    { value: 'user', label: 'People', icon: <LiUser className="text-sm" /> },
    {
        value: 'companies',
        label: 'Companies',
        icon: <LiBuilding className="text-sm" />,
    },
    {
        value: 'quickAction',
        label: 'Actions',
        icon: <LiZap className="text-sm" />,
    },
]

const defaultQuickActions: SearchResult[] = [
    {
        title: 'Quick Actions',
        data: [
            {
                type: 'quickAction',
                title: 'Create Task',
                icon: 'task',
                path: '/apps/projects/tasks',
                shortcut: 'T',
            },
            {
                type: 'quickAction',
                title: 'Open Personal Settings',
                icon: 'settings',
                path: 'apps/accounts/settings/profile',
            },
            {
                type: 'quickAction',
                title: 'Add Person',
                icon: 'person',
                path: '/apps/customers/list',
                shortcut: '⌘3',
            },
            {
                type: 'quickAction',
                title: 'Add Product',
                icon: 'email',
                path: '/apps/sales/order',
                shortcut: 'E',
            },
            {
                type: 'quickAction',
                title: 'Send Feedback',
                icon: 'feedback',
                path: '/apps/customers/helpdesk',
            },
        ],
    },
    {
        title: 'Help',
        data: [
            {
                type: 'quickAction',
                title: 'Documentation',
                icon: 'document',
                path: '/guide/documentation/introduction',
            },
        ],
    },
]

const Kbd = ({ children }: { children: ReactNode }) => (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400">
        {children}
    </kbd>
)

type SearchItemProps = {
    data: SearchData
    keyWord: string
    isSelected: boolean
    onSelect: () => void
    onNavigate: () => void
}

const SearchItem = ({
    data,
    keyWord,
    isSelected,
    onSelect,
    onNavigate,
}: SearchItemProps) => {
    const baseClass = classNames(
        'flex items-center justify-between rounded-lg p-2 cursor-pointer',
        isSelected
            ? 'bg-gray-100 dark:bg-gray-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700',
    )

    const renderContent = () => {
        switch (data.type) {
            case 'user':
            case 'companies':
                return (
                    <div className="flex items-center gap-2">
                        <Avatar
                            src={data.img}
                            size={32}
                            className={
                                data.type === 'companies'
                                    ? 'border-0 bg-transparent'
                                    : ''
                            }
                        />
                        <div>
                            <div className="heading-text font-medium">
                                {highlightSearchMatch(data.name, keyWord)}
                            </div>
                            <div className="text-xs">{data.email}</div>
                        </div>
                    </div>
                )
            case 'quickAction':
                return (
                    <>
                        <div className="flex items-center gap-2">
                            <IconFrame
                                size={32}
                                className="text-lg heading-text"
                            >
                                {actionIcons[data.icon] || <LiZap />}
                            </IconFrame>
                            <div className="heading-text">
                                {highlightSearchMatch(data.title, keyWord)}
                            </div>
                        </div>
                        {data.shortcut && <Kbd>{data.shortcut}</Kbd>}
                    </>
                )
            case 'files':
                return (
                    <div className="flex items-center gap-2">
                        <IconFrame size={32} className="text-lg heading-text">
                            {actionIcons.file}
                        </IconFrame>
                        <div>
                            <div className="heading-text font-medium">
                                {highlightSearchMatch(data.title, keyWord)}
                            </div>
                            <div className="text-xs">{data.fileType}</div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div onClick={onNavigate} onMouseEnter={onSelect} className={baseClass}>
            {renderContent()}
        </div>
    )
}

const Search = ({ className, trigger = 'icon' }: SearchProps) => {
    const [searchDialogOpen, setSearchDialogOpen] = useState(false)
    const [searchResult, setSearchResult] =
        useState<SearchResult[]>(defaultQuickActions)
    const [activeCategory, setActiveCategory] = useState<SearchCategory>('all')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const flattenedItems = useMemo(() => {
        return searchResult.flatMap((result) =>
            result.data.filter(
                (item) =>
                    activeCategory === 'all' || item.type === activeCategory,
            ),
        )
    }, [searchResult, activeCategory])

    const filteredResults = useMemo(() => {
        if (activeCategory === 'all') return searchResult
        return searchResult
            .map((result) => ({
                ...result,
                data: result.data.filter(
                    (item) => item.type === activeCategory,
                ),
            }))
            .filter((result) => result.data.length > 0)
    }, [searchResult, activeCategory])

    const handleSearchClose = useCallback(() => {
        setSearchDialogOpen(false)
        setSearchResult(defaultQuickActions)
        setActiveCategory('all')
        setSelectedIndex(0)
        setSearchQuery('')
    }, [])

    const handleSelect = useCallback(
        (item: SearchData) => {
            handleSearchClose()
            const routes: Record<string, string | ((d: SearchData) => string)> =
                {
                    user: (d) =>
                        `/apps/customers/${(d as Extract<SearchData, { type: 'user' }>).id}/overview`,
                    companies: '/apps/accounts/settings/integrations',
                    quickAction: (d) =>
                        (d as Extract<SearchData, { type: 'quickAction' }>)
                            .path,
                }
            const route = routes[item.type]
            if (route)
                router.push(typeof route === 'function' ? route(item) : route)
        },
        [router, handleSearchClose],
    )

    const debounceFn = useMemo(
        () =>
            debounce(async (query: string) => {
                if (!query) {
                    setSearchResult(defaultQuickActions)
                    return
                }
                const respond = await apiGetSearchResult<SearchResult[]>({
                    query,
                })
                if (respond) setSearchResult(respond)
            }, 200),
        [],
    )

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setSelectedIndex(0)
        debounceFn(e.target.value)
    }

    const handleKeyDown = useCallback(
        (e: ReactKeyboardEvent) => {
            const actions: Record<string, () => void> = {
                ArrowDown: () =>
                    setSelectedIndex((prev) =>
                        prev < flattenedItems.length - 1 ? prev + 1 : 0,
                    ),
                ArrowUp: () =>
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : flattenedItems.length - 1,
                    ),
                Enter: () =>
                    flattenedItems[selectedIndex] &&
                    handleSelect(flattenedItems[selectedIndex]),
                Escape: handleSearchClose,
            }
            if (actions[e.key]) {
                e.preventDefault()
                actions[e.key]()
            }
        },
        [flattenedItems, selectedIndex, handleSearchClose, handleSelect],
    )

    useEffect(() => {
        if (searchDialogOpen) {
            const timeout = setTimeout(() => inputRef.current?.focus(), 100)
            return () => clearTimeout(timeout)
        }
    }, [searchDialogOpen])

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchDialogOpen(true)
            }
        }
        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [])

    let currentItemIndex = -1

    return (
        <>
            <div
                className={classNames(className, 'cursor-pointer')}
                onClick={() => setSearchDialogOpen(true)}
            >
                {trigger === 'icon' && <LiSearch className="text-xl" />}
                {trigger === 'input' && (
                    <Input
                        className="cursor-pointer max-w-[150px] sm:max-w-[200px]"
                        readOnly
                        placeholder="Search"
                        prefix={<LiSearch className="text-base" />}
                        suffix={<Kbd>⌘K</Kbd>}
                    />
                )}
            </div>
            <Dialog
                isOpen={searchDialogOpen}
                className="p-0"
                closable={false}
                onClose={handleSearchClose}
                width={700}
            >
                <div onKeyDown={handleKeyDown}>
                    <div className="px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center flex-1">
                            <LiSearch className="text-xl" />
                            <input
                                ref={inputRef}
                                className="ring-0 outline-hidden block w-full p-4 text-base bg-transparent text-gray-900 dark:text-gray-100"
                                placeholder="Search for quick actions & contacts..."
                                onChange={handleSearch}
                                value={searchQuery}
                            />
                        </div>
                        <Button size="sm" onClick={handleSearchClose}>
                            Esc
                        </Button>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-col gap-2">
                            <span>I&apos;m searching for...</span>
                            <div className="flex items-center gap-2">
                                {categoryFilters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => {
                                            setActiveCategory(
                                                activeCategory === filter.value
                                                    ? 'all'
                                                    : filter.value,
                                            )
                                            setSelectedIndex(0)
                                        }}
                                        className={classNames(
                                            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors',
                                            activeCategory === filter.value
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white dark:bg-gray-700 heading-text border-gray-200 dark:border-gray-700',
                                        )}
                                    >
                                        {filter.icon}
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="py-4 px-4">
                        <ScrollBar.FlexSize className="max-h-[380px]">
                            {filteredResults.map((result) => (
                                <div key={result.title} className="mb-4">
                                    <div className="mb-2 text-xs heading-text font-medium uppercase px-2">
                                        {result.title}
                                    </div>
                                    {result.data.map((data, index) => {
                                        currentItemIndex++
                                        const itemIndex = currentItemIndex
                                        return (
                                            <SearchItem
                                                key={`${data.type}-${index}`}
                                                data={data}
                                                keyWord={searchQuery}
                                                isSelected={
                                                    selectedIndex === itemIndex
                                                }
                                                onSelect={() =>
                                                    setSelectedIndex(itemIndex)
                                                }
                                                onNavigate={() =>
                                                    handleSelect(data)
                                                }
                                            />
                                        )
                                    })}
                                </div>
                            ))}
                            {filteredResults.length === 0 && (
                                <div className="my-10 text-center text-lg">
                                    <span>No results</span>
                                    {searchQuery && (
                                        <>
                                            <span> for </span>
                                            <span className="heading-text font-medium">
                                                &apos;{searchQuery}&apos;
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </ScrollBar.FlexSize>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Kbd>
                                        <LiArrowUp className="text-xs" />
                                    </Kbd>
                                    <Kbd>
                                        <LiArrowDown className="text-xs" />
                                    </Kbd>
                                    <span className="text-xs heading-text ml-1">
                                        Navigate
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Kbd>↵</Kbd>
                                    <span className="text-xs heading-text ml-1">
                                        Select
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Kbd>Esc</Kbd>
                                <span className="text-xs heading-text ml-1">
                                    Close
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default Search

import { useState, useMemo } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import Scroll from '@/components/ui/Scroll'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import NotificationExtension from './NotificationExtension'
import NotificationMessage from './NotificationMessage'
import EmptyState from '@/components/shared/EmptyState'
import Elements from '@/components/svg/Elements'
import {
    apiGetNotificationList,
    apiGetNotificationCount,
} from '@/services/client/CommonService'
import useResponsive from '@/utils/hooks/useResponsive'
import { useRouter } from 'next/navigation'

import useSWR from 'swr'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import type { NotificationItem } from './types'
import { LiCross } from '@/icons'

dayjs.extend(relativeTime)

const { TabList, TabNav, TabContent } = Tabs

type NotificationCategory = 'general' | 'mentions' | 'archive'

const notificationHeight = 'h-[calc(100vh-200px)]'

const NotificationList = ({
    notifications,
    loading,
    noResult,
}: {
    notifications: NotificationItem[]
    loading: boolean
    noResult: boolean
}) => {
    if (loading) {
        return (
            <div
                className={classNames(
                    'flex items-center justify-center',
                    notificationHeight,
                )}
            >
                <Spinner size={40} />
            </div>
        )
    }

    if (noResult || notifications.length === 0) {
        return (
            <div
                className={classNames(
                    'flex items-center justify-center',
                    notificationHeight,
                )}
            >
                <div className="text-center">
                    <EmptyState
                        size={250}
                        variant="grid"
                        offset={20}
                        illustration={
                            <div className="bg-white dark:bg-gray-800 shadow-white-xl rounded-full p-2">
                                <Elements height={120} width={120} />
                            </div>
                        }
                    >
                        <div className="text-center">
                            <h3>No notifications!</h3>
                            <p className="text-base">Please Try again later</p>
                        </div>
                    </EmptyState>
                </div>
            </div>
        )
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((item) => (
                <div key={item.id} className="relative flex p-4">
                    <NotificationAvatar
                        type={item.type}
                        actor={item.actor}
                        payload={item.payload}
                    />
                    <div className="mx-3 flex-1">
                        <div>
                            <NotificationMessage notification={item} />
                        </div>
                        <span className="text-xs">
                            {dayjs(item.createdAt).fromNow()}
                        </span>
                        <NotificationExtension
                            type={item.type}
                            payload={item.payload}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

const Notification = ({ className }: { className?: string }) => {
    const [activeTab, setActiveTab] = useState<NotificationCategory>('general')
    const [isOpen, setIsOpen] = useState(false)

    const router = useRouter()
    const { larger } = useResponsive()

    const { data: countData, mutate: mutateCount } = useSWR(
        '/notification/count',
        apiGetNotificationCount,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        },
    )

    const {
        data: notifications,
        isLoading,
        mutate: mutateNotificationItem,
    } = useSWR<NotificationItem[]>(
        '/notification/list',
        apiGetNotificationList<NotificationItem[]>,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        },
    )

    const unreadCount = countData?.count || 0
    const hasUnread = unreadCount > 0
    const noResult = countData !== undefined && unreadCount === 0

    const filteredNotifications = useMemo(() => {
        return (notifications || [])?.filter((item) => item.category === activeTab) || []
    }, [notifications, activeTab])

    const onDrawerOpen = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const onMarkAllAsRead = () => {
        if (!notifications) {
            return
        }

        mutateNotificationItem(
            notifications.map((item) => ({
                ...item,
                read: true,
            })),
            false,
        )
        mutateCount({ count: 0 }, false)
        setIsOpen(false)
    }

    const handleViewAllActivity = () => {
        setIsOpen(false)
        router.push('/apps/accounts/activity')
    }

    return (
        <>
            <NotificationToggle
                dot={hasUnread}
                className={className}
                onClick={onDrawerOpen}
            />
            <Drawer
                isOpen={isOpen}
                onClose={onDrawerClose}
                width={larger.lg ? 520 : 370}
                closable={false}
                shouldCloseOnOverlayClick
                shouldCloseOnEsc
                bodyClass="p-0"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button onClick={onMarkAllAsRead}>Mark all read</Button>
                        <Button variant="solid" onClick={handleViewAllActivity}>
                            View All Activity
                        </Button>
                    </div>
                }
            >
                <div className="flex items-center justify-between py-4 px-4">
                    <h5>Notifications</h5>
                    <Button
                        size="sm"
                        variant="subtle"
                        icon={<LiCross className="text-xl" />}
                        onClick={() => setIsOpen(false)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Tabs
                        value={activeTab}
                        onChange={(val) =>
                            setActiveTab(val as NotificationCategory)
                        }
                        className="flex-1"
                    >
                        <TabList className="px-2">
                            <TabNav value="general">General</TabNav>
                            <TabNav value="mentions">Mentions</TabNav>
                            <TabNav value="archive">Archive</TabNav>
                        </TabList>
                    </Tabs>
                </div>
                <Scroll
                    scrollbars="vertical"
                    className={classNames(
                        'overflow-y-auto',
                        notificationHeight,
                    )}
                >
                    <Tabs value={activeTab}>
                        <TabContent value="general">
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={isLoading}
                                noResult={noResult && activeTab === 'general'}
                            />
                        </TabContent>
                        <TabContent value="mentions">
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={isLoading}
                                noResult={noResult && activeTab === 'mentions'}
                            />
                        </TabContent>
                        <TabContent value="archive">
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={isLoading}
                                noResult={noResult && activeTab === 'archive'}
                            />
                        </TabContent>
                    </Tabs>
                </Scroll>
            </Drawer>
        </>
    )
}

export default Notification

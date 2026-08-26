import Image from 'next/image'
import Tag from '@/components/ui/Tag'
import type { NotificationItem } from './types'

type NotificationMessageProps = {
    notification: NotificationItem
}

const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="font-medium heading-text">{children}</span>
)

const EntityTag = ({ entity }: { entity: NotificationItem['entity'] }) => (
    <Tag
        className="bg-transparent gap-1"
        prefix={
            entity.image ? (
                <Image
                    src={entity.image}
                    alt={entity.name}
                    className="rounded object-cover"
                    width={16}
                    height={16}
                />
            ) : undefined
        }
    >
        <span className="font-medium heading-text">{entity.name}</span>
    </Tag>
)

const notificationCopyMap: Record<
    string,
    (notification: NotificationItem) => React.ReactNode
> = {
    COMMENT_MENTION: ({ actor, entity }) => (
        <span className="inline-flex flex-wrap gap-1 items-center">
            <Highlight>{actor?.name}</Highlight>
            {' mentioned you in '}
            <EntityTag entity={entity} />
        </span>
    ),

    COMMENT: ({ actor, entity }) => (
        <span className="inline-flex flex-wrap gap-1 items-center">
            <Highlight>{actor?.name}</Highlight>
            {' commented in '}
            <EntityTag entity={entity} />
        </span>
    ),

    MEETING_INVITED: ({ actor, entity }) => (
        <span className="inline-flex flex-wrap gap-1 items-center">
            <Highlight>{actor?.name}</Highlight>
            {' invited you to '}
            <EntityTag entity={entity} />
        </span>
    ),

    TASK_ASSIGNED: ({ actor, entity }) => (
        <span className="inline-flex flex-wrap gap-1 items-center">
            <Highlight>{actor?.name}</Highlight>
            {' assigned you to '}
            <EntityTag entity={entity} />
        </span>
    ),

    FILE_SHARED: ({ actor, entity, payload }) => {
        const fileCount = payload.attachments?.length || 0
        const fileText = fileCount === 1 ? 'a file' : `${fileCount} files`
        return (
            <span className="inline-flex flex-wrap gap-1 items-center">
                <Highlight>{actor?.name}</Highlight>
                {` shared ${fileText} in `}
                <EntityTag entity={entity} />
            </span>
        )
    },

    ACCESS_REQUESTED: ({ actor, entity }) => (
        <span className="inline-flex flex-wrap gap-1 items-center">
            <Highlight>{actor?.name}</Highlight>
            {' requested access to '}
            <EntityTag entity={entity} />
        </span>
    ),

    STATUS_UPDATE: ({ entity, payload }) => (
        <span className="inline-flex flex-wrap gap-1 items-center">
            {entity.name}
            {` was ${payload.status || 'updated'}`}
        </span>
    ),

    SYSTEM: ({ payload }) => (
        <span>{payload.message || 'System notification'}</span>
    ),
}

const defaultMessage = (notification: NotificationItem): React.ReactNode => (
    <>
        {notification.actor && (
            <>
                <Highlight>{notification.actor.name}</Highlight>{' '}
            </>
        )}
        {'sent you a notification'}
    </>
)

const NotificationMessage = ({ notification }: NotificationMessageProps) => {
    const getMessage = notificationCopyMap[notification.type] || defaultMessage

    return <span>{getMessage(notification)}</span>
}

export default NotificationMessage

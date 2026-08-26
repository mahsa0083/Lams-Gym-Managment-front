import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FileIcon from '@/components/shared/FileIcon'
import { LiDownload } from '@/icons'
import dayjs from 'dayjs'
import type { NotificationPayload } from './types'

type NotificationExtensionProps = {
    type: string
    payload: NotificationPayload
}

const CommentExtension = ({ comment }: { comment?: string }) => {
    if (!comment) return null

    return (
        <Card bodyClass="p-2">
            <span className="heading-text">{comment}</span>
        </Card>
    )
}

const MeetingExtension = ({ payload }: { payload: NotificationPayload }) => {
    if (!payload.startTime || !payload.endTime) return null

    const startTime = dayjs(payload.startTime)
    const endTime = dayjs(payload.endTime)

    return (
        <Card bodyClass="flex items-center gap-2 p-2">
            <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800 flex flex-col">
                <div className="bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-center py-0.25">
                    {startTime.format('ddd')}
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span className="font-semibold heading-text">
                        {startTime.format('D')}
                    </span>
                </div>
            </div>
            <div>
                <div className="font-medium heading-text">{payload.name}</div>
                <div className="text-xs">
                    {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
                </div>
            </div>
        </Card>
    )
}

const FileAttachmentExtension = ({
    attachments,
}: {
    attachments?: NotificationPayload['attachments']
}) => {
    if (!attachments || attachments.length === 0) return null

    return (
        <div className="space-y-2">
            {attachments.map((attachment) => (
                <Card key={attachment.id} bodyClass="p-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileIcon type={attachment.fileType} size={25} />
                            <div>
                                <div className="font-medium heading-text">
                                    {attachment.name}
                                </div>
                                <div className="text-xs">{attachment.size}</div>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            icon={<LiDownload />}
                            onClick={() => {
                                console.log('Download:', attachment.downloadUrl)
                            }}
                        />
                    </div>
                </Card>
            ))}
        </div>
    )
}

const AccessRequestExtension = () => {
    return (
        <div className="flex gap-2">
            <Button size="sm" variant="default">
                Decline
            </Button>
            <Button size="sm" variant="solid">
                Accept
            </Button>
        </div>
    )
}

const NotificationExtension = ({
    type,
    payload,
}: NotificationExtensionProps) => {
    switch (type) {
        case 'COMMENT':
        case 'COMMENT_MENTION':
            return (
                <div className="mt-2">
                    <CommentExtension comment={payload.comment} />
                </div>
            )

        case 'MEETING_INVITED':
            return (
                <div className="mt-2">
                    <MeetingExtension payload={payload} />
                </div>
            )

        case 'FILE_SHARED':
            return (
                <div className="mt-2">
                    <FileAttachmentExtension
                        attachments={payload.attachments}
                    />
                </div>
            )

        case 'ACCESS_REQUESTED':
            return (
                <div className="mt-2">
                    <AccessRequestExtension />
                </div>
            )
        default:
            return null
    }
}

export default NotificationExtension

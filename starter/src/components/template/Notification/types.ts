// Notification types
export type NotificationActor = {
    id: string
    name: string
    avatar?: string
} | null

export type NotificationEntity = {
    type: string
    id: string
    name: string
    image?: string
}

export type NotificationAttachment = {
    id: string
    name: string
    size: string
    fileType: string
    downloadUrl: string
}

export type NotificationPayload = {
    name?: string
    comment?: string
    message?: string
    department?: string
    priority?: string
    status?: string
    reason?: string
    requestType?: string
    startTime?: string
    endTime?: string
    dueDate?: string
    deadline?: string
    attachments?: NotificationAttachment[]
}

export type NotificationItem = {
    id: string
    type: string
    category: 'general' | 'mentions' | 'archive'
    actor: NotificationActor
    entity: NotificationEntity
    payload: NotificationPayload
    read: boolean
    createdAt: string
}

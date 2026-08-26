import classNames from '@/utils/classNames'
import Badge from '@/components/ui/Badge'
import { LiBell } from '@/icons'

const NotificationToggle = ({
    className,
    dot,
    onClick,
}: {
    className?: string
    dot: boolean
    onClick?: () => void
}) => {
    return (
        <div
            className={classNames('text-xl cursor-pointer', className)}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.()
                }
            }}
        >
            {dot ? (
                <Badge badgeStyle={{ top: '3px', right: '6px' }}>
                    <LiBell />
                </Badge>
            ) : (
                <LiBell />
            )}
        </div>
    )
}

export default NotificationToggle

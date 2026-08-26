import { useState } from 'react'
import Popover from '@/components/ui/Popover'
import classNames from '@/utils/classNames'
import { LuSmile } from 'react-icons/lu'
import type { ReactNode } from 'react'

const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉']

const DEFAULT_SIZE_CLASS = 'w-7 h-7'

type Emoji = (typeof DEFAULT_EMOJIS)[number]

export interface ReactionEmojiPickerProps {
    emojis?: readonly Emoji[]
    onSelect?: (emoji: Emoji) => void
    trigger?: ReactNode
    placement?: Parameters<typeof Popover>[0]['placement']
    width?: number
}

const ReactionEmojiPicker = ({
    emojis = DEFAULT_EMOJIS,
    onSelect,
    trigger,
    placement = 'top',
    width = 250,
}: ReactionEmojiPickerProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false)

    const handleSelect = (emoji: Emoji) => {
        onSelect?.(emoji)
        setPopoverOpen(false)
    }

    return (
        <Popover
            placement={placement}
            className="p-1"
            width={width}
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            renderTrigger={
                trigger ?? (
                    <button
                        className={classNames(
                            DEFAULT_SIZE_CLASS,
                            'inline-flex items-center justify-center gap-1 rounded-md p-1 border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-gray-100',
                        )}
                        type="button"
                    >
                        <LuSmile className="text-base" />
                    </button>
                )
            }
        >
            <div className="inline-flex items-center flex-wrap">
                {emojis.map((emoji) => (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSelect(emoji)}
                        className={classNames(
                            'transition-transform hover:scale-110 p-1 text-base rounded hover:bg-gray-200/60 dark:hover:bg-gray-800',
                        )}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </Popover>
    )
}

export default ReactionEmojiPicker

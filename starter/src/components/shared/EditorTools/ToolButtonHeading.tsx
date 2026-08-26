import {
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuHeading4,
    LuHeading5,
    LuHeading6,
    LuType,
} from 'react-icons/lu'
import ToolButton from './ToolButton'
import Dropdown from '@/components/ui/Dropdown'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps, HeadingLevel } from './types'
import type { ReactNode } from 'react'

type ToolButtonCodeBlockProp = BaseToolButtonProps & {
    headingLevel?: HeadingLevel[]
}

type HeadingMap = Record<
    number,
    {
        label: string
        value: HeadingLevel
        icon: ReactNode
    }
>

const headingMap: HeadingMap = {
    1: { label: 'Heading 1', value: 1, icon: <LuHeading1 /> },
    2: { label: 'Heading 2', value: 2, icon: <LuHeading2 /> },
    3: { label: 'Heading 3', value: 3, icon: <LuHeading3 /> },
    4: { label: 'Heading 4', value: 4, icon: <LuHeading4 /> },
    5: { label: 'Heading 5', value: 5, icon: <LuHeading5 /> },
    6: { label: 'Heading 6', value: 6, icon: <LuHeading6 /> },
}

const ToolButtonCodeBlock = ({
    editor,
    headingLevel = [1, 2, 3, 4, 5, 6],
}: ToolButtonCodeBlockProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <>
            <Dropdown
                renderTitle={
                    <ToolButton title="Heading" disabled={!ready}>
                        <LuType />
                    </ToolButton>
                }
            >
                {headingLevel.map((level) => (
                    <Dropdown.Item
                        key={`heading-${level}`}
                        eventKey={`heading-${level}`}
                        active={
                            ready &&
                            editor.isActive('heading', {
                                level: headingMap[level].value,
                            })
                        }
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({
                                    level: headingMap[level].value,
                                })
                                .run()
                        }
                    >
                        <span className="text-lg">
                            {headingMap[level].icon}
                        </span>
                        {headingMap[level].label}
                    </Dropdown.Item>
                ))}
                <Dropdown.Item
                    onClick={() => editor.chain().focus().setParagraph().run()}
                >
                    <span className="text-lg">
                        <LuType />
                    </span>
                    <span>Paragraph</span>
                </Dropdown.Item>
            </Dropdown>
        </>
    )
}

export default ToolButtonCodeBlock

import { TbStrikethrough } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonStrikeProp = BaseToolButtonProps

const ToolButtonStrike = ({ editor }: ToolButtonStrikeProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Strikethrough"
            disabled={
                !ready || !editor.can().chain().focus().toggleStrike().run()
            }
            active={ready && editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
        >
            <TbStrikethrough />
        </ToolButton>
    )
}

export default ToolButtonStrike

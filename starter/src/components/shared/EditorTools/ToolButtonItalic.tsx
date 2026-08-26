import { TbItalic } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonItalicProp = BaseToolButtonProps

const ToolButtonItalic = ({ editor }: ToolButtonItalicProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Italic"
            disabled={
                !ready || !editor.can().chain().focus().toggleItalic().run()
            }
            active={ready && editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
        >
            <TbItalic />
        </ToolButton>
    )
}

export default ToolButtonItalic

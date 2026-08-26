import { CgUndo } from 'react-icons/cg'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonUndoProp = BaseToolButtonProps

const ToolButtonUndo = ({ editor }: ToolButtonUndoProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Code"
            disabled={!ready || !editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
        >
            <CgUndo />
        </ToolButton>
    )
}

export default ToolButtonUndo

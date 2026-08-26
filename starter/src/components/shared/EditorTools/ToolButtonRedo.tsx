import { CgRedo } from 'react-icons/cg'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonRedoProp = BaseToolButtonProps

const ToolButtonRedo = ({ editor }: ToolButtonRedoProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Code"
            disabled={!ready || !editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
        >
            <CgRedo />
        </ToolButton>
    )
}

export default ToolButtonRedo

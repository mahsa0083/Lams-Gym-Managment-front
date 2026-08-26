import { TbSpacingVertical } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonHardBreakProp = BaseToolButtonProps

const ToolButtonHardBreak = ({ editor }: ToolButtonHardBreakProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Horizontal Rule"
            disabled={!ready}
            onClick={() => editor.chain().focus().setHardBreak().run()}
        >
            <TbSpacingVertical />
        </ToolButton>
    )
}

export default ToolButtonHardBreak

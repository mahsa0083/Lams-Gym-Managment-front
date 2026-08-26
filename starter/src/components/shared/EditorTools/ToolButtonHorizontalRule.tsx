import { TbMinus } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonHorizontalRuleProp = BaseToolButtonProps

const ToolButtonHorizontalRule = ({ editor }: ToolButtonHorizontalRuleProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Horizontal Rule"
            disabled={!ready}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
            <TbMinus />
        </ToolButton>
    )
}

export default ToolButtonHorizontalRule

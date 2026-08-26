import { TbCodeDots } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonCodeBlockProp = BaseToolButtonProps

const ToolButtonCodeBlock = ({ editor }: ToolButtonCodeBlockProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Code Block"
            disabled={!ready}
            active={ready && editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
            <TbCodeDots />
        </ToolButton>
    )
}

export default ToolButtonCodeBlock

import { BiParagraph } from 'react-icons/bi'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonParagraphProp = BaseToolButtonProps

const ToolButtonParagraph = ({ editor }: ToolButtonParagraphProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Paragraph"
            disabled={!ready}
            active={ready && editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
        >
            <BiParagraph />
        </ToolButton>
    )
}

export default ToolButtonParagraph

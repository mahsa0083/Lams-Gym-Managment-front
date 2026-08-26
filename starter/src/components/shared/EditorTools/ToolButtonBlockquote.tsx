import { TbQuote } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonBlockquoteProp = BaseToolButtonProps

const ToolButtonBlockquote = ({ editor }: ToolButtonBlockquoteProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Blockquote"
            disabled={!ready}
            active={ready && editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
            <TbQuote />
        </ToolButton>
    )
}

export default ToolButtonBlockquote

import { TbListNumbers } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonOrderedListProp = BaseToolButtonProps

const ToolButtonOrderedList = ({ editor }: ToolButtonOrderedListProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Ordered List"
            disabled={!ready}
            active={ready && editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
            <TbListNumbers />
        </ToolButton>
    )
}

export default ToolButtonOrderedList

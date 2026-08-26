import { TbCode } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonCodeProp = BaseToolButtonProps

const ToolButtonCode = ({ editor }: ToolButtonCodeProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Code"
            disabled={
                !ready || !editor.can().chain().focus().toggleCode().run()
            }
            active={ready && editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
        >
            <TbCode />
        </ToolButton>
    )
}

export default ToolButtonCode

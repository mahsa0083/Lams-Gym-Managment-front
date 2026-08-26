import { TbBold } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { ToolButtonProps } from './ToolButton'
import type { BaseToolButtonProps } from './types'

type ToolButtonBoldProp = BaseToolButtonProps & ToolButtonProps

const ToolButtonBold = ({ editor, ...rest }: ToolButtonBoldProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Bold"
            disabled={
                !ready || !editor.can().chain().focus().toggleBold().run()
            }
            active={ready && editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            {...rest}
        >
            <TbBold />
        </ToolButton>
    )
}

export default ToolButtonBold

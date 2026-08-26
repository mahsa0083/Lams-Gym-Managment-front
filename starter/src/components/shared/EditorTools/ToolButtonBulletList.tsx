import { TbList } from 'react-icons/tb'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonBulletListProp = BaseToolButtonProps

const ToolButtonBulletList = ({ editor }: ToolButtonBulletListProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    return (
        <ToolButton
            title="Bullet List"
            disabled={!ready}
            active={ready && editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
            <TbList />
        </ToolButton>
    )
}

export default ToolButtonBulletList

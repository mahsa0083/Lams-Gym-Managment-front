import { LuImage } from 'react-icons/lu'
import '@tiptap/extension-image'
import ToolButton from './ToolButton'
import { isEditorReady } from './utils'
import useEditorUpdate from './useEditorUpdate'
import type { BaseToolButtonProps } from './types'

type ToolButtonImageProp = BaseToolButtonProps & {
    onUpload?: (file: File) => void
}

function imageToBase64FromFile(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            resolve(reader.result)
        }

        reader.onerror = (error) => {
            reject(error)
        }

        reader.readAsDataURL(file)
    })
}

const ToolButtonImage = ({ editor, onUpload }: ToolButtonImageProp) => {
    useEditorUpdate(editor)
    const ready = isEditorReady(editor)

    const addImage = (url: string) => {
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        onUpload?.(file)
        const base64 = await imageToBase64FromFile(file)
        addImage(base64 as string)
    }

    return (
        <ToolButton
            title="Image"
            variant="input"
            disabled={!ready}
            active={ready && editor.isActive('blockquote')}
            type="file"
            onChange={handleChange}
        >
            <LuImage />
        </ToolButton>
    )
}

export default ToolButtonImage

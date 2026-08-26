import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'

const useEditorUpdate = (editor: Editor) => {
    const [, forceUpdate] = useState({})

    useEffect(() => {
        if (!editor) return

        const update = () => forceUpdate({})

        editor.on('transaction', update)

        return () => {
            editor.off('transaction', update)
        }
    }, [editor])
}

export default useEditorUpdate

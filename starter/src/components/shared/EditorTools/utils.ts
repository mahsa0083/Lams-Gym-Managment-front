import type { Editor } from '@tiptap/react'

export const isEditorReady = (editor: Editor): boolean => {
    try {
        return !!editor?.view?.dom
    } catch {
        return false
    }
}

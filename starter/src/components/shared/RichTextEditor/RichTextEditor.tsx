import { useEffect } from 'react'
import classNames from '@/utils/classNames'
import ToolButtonBold from '../EditorTools/ToolButtonBold'
import ToolButtonItalic from '../EditorTools/ToolButtonItalic'
import ToolButtonStrike from '../EditorTools/ToolButtonStrike'
import ToolButtonCode from '../EditorTools/ToolButtonCode'
import ToolButtonOrderedList from '../EditorTools/ToolButtonOrderedList'
import ToolButtonCodeBlock from '../EditorTools/ToolButtonCodeBlock'
import ToolButtonBlockquote from '../EditorTools/ToolButtonBlockquote'
import ToolButtonHorizontalRule from '../EditorTools/ToolButtonHorizontalRule'
import ToolButtonHeading from '../EditorTools/ToolButtonHeading'
import ToolButtonParagraph from '../EditorTools/ToolButtonParagraph'
import ToolButtonUndo from '../EditorTools/ToolButtonUndo'
import ToolButtonRedo from '../EditorTools/ToolButtonRedo'
import ToolButtonBulletList from '../EditorTools/ToolButtonBulletList'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Editor, EditorContentProps, JSONContent } from '@tiptap/react'
import type { ReactNode, JSX, Ref } from 'react'
import type { BaseToolButtonProps, HeadingLevel } from '../EditorTools/types'

export type RichTextEditorRef = HTMLDivElement

type RichTextEditorProps = {
    content?: string
    invalid?: boolean
    customToolBar?: (
        editor: Editor,
        components: {
            ToolButtonBold: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonItalic: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonStrike: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonCode: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonBlockquote: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonHeading: ({
                editor,
            }: BaseToolButtonProps & {
                headingLevel?: HeadingLevel[]
            }) => JSX.Element
            ToolButtonBulletList: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonOrderedList: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonCodeBlock: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonHorizontalRule: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonParagraph: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonUndo: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonRedo: ({ editor }: BaseToolButtonProps) => JSX.Element
        },
    ) => ReactNode
    onChange?: (content: {
        text: string
        html: string
        json: JSONContent
    }) => void
    editorContentClass?: string
    customEditor?: Editor | null
    ref?: Ref<RichTextEditorRef>
} & Omit<EditorContentProps, 'editor' | 'ref' | 'onChange'>

const RichTextEditor = (props: RichTextEditorProps) => {
    const {
        content = '',
        customToolBar,
        invalid,
        onChange,
        editorContentClass,
        customEditor,
        ref,
        ...rest
    } = props
    const internalEditor = useEditor(
        customEditor
            ? { extensions: [], immediatelyRender: false }
            : {
                  extensions: [
                      StarterKit.configure({
                          bulletList: {
                              keepMarks: true,
                          },
                          orderedList: {
                              keepMarks: true,
                          },
                      }),
                  ],
                  editorProps: {
                      attributes: {
                          class: 'm-0! p-2 min-h-[80px] focus:outline-hidden',
                      },
                  },
                  content,
                  immediatelyRender: false,
                  onUpdate({ editor }) {
                      onChange?.({
                          text: editor.getText(),
                          html: editor.getHTML(),
                          json: editor.getJSON(),
                      })
                  },
              },
    )
    const editor = customEditor ?? internalEditor

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [editor, content])

    if (!editor) return null

    return (
        <div
            className={classNames(
                'rich-text-editor rounded-lg ring-1 ring-transparent border border-gray-200 dark:border-gray-600 pt-2',
                editor.isFocused && 'ring-primary border-primary',
                invalid && 'bg-error-subtle border-error',
                editor.isFocused && invalid && 'bg-error-subtle ring-error',
            )}
        >
            <div className="flex gap-x-1 gap-y-2 px-2">
                {customToolBar ? (
                    customToolBar(editor, {
                        ToolButtonBold,
                        ToolButtonItalic,
                        ToolButtonStrike,
                        ToolButtonCode,
                        ToolButtonBlockquote,
                        ToolButtonHeading,
                        ToolButtonBulletList,
                        ToolButtonOrderedList,
                        ToolButtonCodeBlock,
                        ToolButtonHorizontalRule,
                        ToolButtonParagraph,
                        ToolButtonUndo,
                        ToolButtonRedo,
                    })
                ) : (
                    <>
                        <ToolButtonBold editor={editor} />
                        <ToolButtonItalic editor={editor} />
                        <ToolButtonStrike editor={editor} />
                        <ToolButtonCode editor={editor} />
                        <ToolButtonBlockquote editor={editor} />
                        <ToolButtonHeading editor={editor} />
                        <ToolButtonBulletList editor={editor} />
                        <ToolButtonOrderedList editor={editor} />
                        <ToolButtonCodeBlock editor={editor} />
                        <ToolButtonHorizontalRule editor={editor} />
                    </>
                )}
            </div>

            <EditorContent
                ref={ref}
                className={classNames(
                    'max-h-[600px] overflow-auto px-2 prose prose-p:text-sm prose-p:my-1 dark:prose-p:text-gray-100 max-w-full',
                    editorContentClass,
                )}
                editor={editor}
                {...rest}
            />
        </div>
    )
}

export default RichTextEditor

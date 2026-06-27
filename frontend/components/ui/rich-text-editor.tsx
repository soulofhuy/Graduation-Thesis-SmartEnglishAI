'use client'

import { useEffect, useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react'
import { cn } from '@/lib/utils'

type RichTextEditorProps = {
    value: string
    onChange: (value: string) => void
    placeholder: string
    minHeightClass?: string
    className?: string
    disabled?: boolean
}

const getPlainText = (html: string) => html.replace(/<[^>]*>/g, '').trim()

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    minHeightClass = 'min-h-24',
    className,
    disabled = false
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!editorRef.current) {
            return
        }

        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    const applyCommand = (command: string) => {
        if (disabled) return
        editorRef.current?.focus()
        document.execCommand(command)
        onChange(editorRef.current?.innerHTML ?? '')
    }

    const isEmpty = !getPlainText(value)

    return (
        <div className={cn('rounded-md border bg-background', className)}>
            <div className="border-b px-2 py-1.5 flex flex-wrap gap-1">
                <button
                    type="button"
                    disabled={disabled}
                    className="h-8 w-8 rounded border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyCommand('bold')}
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    className="h-8 w-8 rounded border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyCommand('italic')}
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    className="h-8 w-8 rounded border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyCommand('underline')}
                >
                    <Underline className="h-4 w-4" />
                </button>
            </div>

            <div className="relative">
                {isEmpty && (
                    <div className="pointer-events-none absolute left-3 top-2 text-muted-foreground text-sm">
                        {placeholder}
                    </div>
                )}
                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    className={cn(
                        'px-3 py-2 outline-none min-w-0 w-full max-w-full whitespace-pre-wrap break-words disabled:opacity-80',
                        minHeightClass
                    )}
                    style={{
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word'
                    }}
                    onInput={(e) => !disabled && onChange((e.target as HTMLDivElement).innerHTML)}
                    onBlur={(e) => !disabled && onChange((e.target as HTMLDivElement).innerHTML)}
                />
            </div>
        </div>
    )
}

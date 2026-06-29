'use client'

import { useRef, useState, useEffect } from 'react'
import { SendHorizontal, Wand2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/components/language-provider'
import { editAssignmentWithAI, type AIEditConversationTurn } from '@/services/teacher/ai-edit-assignments'
import { MarkdownContent } from '@/components/markdown-content'
import type { TaskDraft, AssignmentFormData } from './quiz-builder-types'
import { createId } from './quiz-builder-utils'

type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
}

type AIEditChatPanelProps = {
    accessToken: string
    assignmentId: string
    currentPayload: object
    onApplyChanges: (tasks: TaskDraft[], formData?: Partial<AssignmentFormData>) => void
    initialSession?: any
    onSessionCreated?: () => void
}

function mapAITasksToDrafts(aiTasks: any[]): TaskDraft[] {
    return (aiTasks ?? []).map((task: any) => {
        const passages = (task.passages ?? []).map((p: any) => ({
            id: createId(),
            passageContent: p.passageContent ?? ''
        }))

        const questions = (task.questions ?? []).map((q: any) => {
            const choices = (q.choices ?? []).map((c: any) => ({
                id: createId(),
                choiceContent: c.choiceContent ?? '',
                isCorrect: Boolean(c.isCorrect)
            }))

            // Ensure exactly one correct choice
            const hasCorrect = choices.some((c: any) => c.isCorrect)
            if (!hasCorrect && choices.length > 0) {
                choices[0].isCorrect = true
            }

            const passageIndex = q.passageIndex !== undefined && q.passageIndex !== null
                ? String(q.passageIndex)
                : 'none'

            return {
                id: createId(),
                questionContent: q.questionContent ?? '',
                topicTag: '',
                passageIndex,
                choices
            }
        })

        return {
            id: createId(),
            taskTitle: task.taskContent ?? task.taskTitle ?? task.taskType ?? '',
            taskDescription: task.taskContent ?? '',
            taskType: task.taskType,
            passages,
            questions: questions.length > 0 ? questions : []
        }
    })
}

export function AIEditChatPanel({ accessToken, assignmentId, currentPayload, onApplyChanges, initialSession, onSessionCreated }: AIEditChatPanelProps) {
    const { t } = useLanguage()
    const [prompt, setPrompt] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [chatSessionId, setChatSessionId] = useState<string | undefined>(initialSession?.id)
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const conversationHistory = useRef<AIEditConversationTurn[]>([])

    useEffect(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight
        }
    }, [messages, isGenerating])

    const handleSend = async () => {
        const trimmed = prompt.trim()
        if (!trimmed || isGenerating) return

        setPrompt('')
        setMessages(prev => [...prev, { id: createId(), role: 'user', content: trimmed }])
        setIsGenerating(true)

        try {
            const result = await editAssignmentWithAI(accessToken, trimmed, currentPayload, {
                conversationHistory: conversationHistory.current,
                assignmentId,
                chatSessionId,
                chatSessionTitle: `AI chỉnh sửa bài tập`
            })

            if (result.chatSession?.id) {
                const isNew = result.chatSession.id !== chatSessionId
                setChatSessionId(result.chatSession.id)
                if (isNew) onSessionCreated?.()
            }

            const assistantContent = result.explanation || 'Đã áp dụng thay đổi vào bài tập.'

            conversationHistory.current = [
                ...conversationHistory.current,
                { role: 'user', content: trimmed },
                { role: 'assistant', content: assistantContent }
            ]

            // Keep sliding window of 20 turns
            if (conversationHistory.current.length > 20) {
                conversationHistory.current = conversationHistory.current.slice(-20)
            }

            setMessages(prev => [...prev, {
                id: createId(),
                role: 'assistant',
                content: assistantContent
            }])

            // Parse and apply assignment changes
            const aiAssignment = result.assignment
            if (aiAssignment?.tasks && Array.isArray(aiAssignment.tasks)) {
                const newTasks = mapAITasksToDrafts(aiAssignment.tasks)
                const formUpdate: Partial<AssignmentFormData> = {}
                if (aiAssignment.title) formUpdate.title = aiAssignment.title
                if (aiAssignment.description !== undefined) formUpdate.description = aiAssignment.description

                onApplyChanges(newTasks, Object.keys(formUpdate).length > 0 ? formUpdate : undefined)
                toast.success(t.teacher.assignments.aiEditPanel.appliedSuccess)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi gọi AI'
            toast.error(message)
            setMessages(prev => [...prev, {
                id: createId(),
                role: 'assistant',
                content: `❌ ${message}`
            }])
        } finally {
            setIsGenerating(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-[610px] flex-col gap-4 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm">
            {/* Chat messages */}
            <div ref={viewportRef} className="flex-1 overflow-y-auto rounded-xl border border-muted/40 bg-background/70 px-4 py-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-2 max-w-[80%]">
                                <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                <div className="rounded-2xl rounded-bl-sm border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                                    {t.teacher.assignments.aiEditPanel.initialMessage}
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex items-start gap-2 max-w-[80%]">
                                    <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                    <div className="rounded-2xl rounded-bl-sm border bg-muted/40 px-4 py-2 text-sm">
                                        <MarkdownContent content={msg.content} />
                                    </div>
                                </div>
                            )}
                            {msg.role === 'user' && (
                                <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-orange-100 px-4 py-2 text-sm text-orange-950 dark:bg-orange-500/20 dark:text-orange-100">
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-2">
                                <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500 animate-pulse" />
                                <div className="rounded-2xl rounded-bl-sm border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                                    {t.teacher.assignments.aiEditPanel.generating}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="relative">
                <ScrollArea className="w-full max-h-[160px] rounded-xl border border-muted/40 bg-background/80 shadow-sm">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t.teacher.assignments.aiEditPanel.placeholder}
                        className="min-h-[48px] max-h-none resize-none border-0 bg-transparent pl-4 pr-14 py-3 text-sm shadow-none focus-visible:ring-0"
                        disabled={isGenerating}
                    />
                </ScrollArea>
                <Button
                    onClick={handleSend}
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute right-2 bottom-2 rounded-full h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                    aria-label="Send"
                >
                    <SendHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

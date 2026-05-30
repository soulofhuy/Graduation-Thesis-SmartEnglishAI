'use client'

import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Plus, Send } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { useAuth } from '@/components/auth-provider'
import { aiResultAnalysisService } from '@/services/teacher/ai-result-analysis'
import { toast } from 'sonner'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { dateTimeFormat } from '@/lib/format'

type ChatThread = {
    id: string
    title: string
    subtitle: string
}

type ChatMessage = {
    id: string
    role: 'ai' | 'teacher'
    name: string
    message: string
    time: string
}

type ResultsChatPanelProps = {
    className?: string
    classId: string
    assignmentId: string
}

export function ResultsChatPanel({
    className,
    classId,
    assignmentId,
}: ResultsChatPanelProps) {
    const { t, language } = useLanguage()
    const { user, accessToken } = useAuth()
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
    const [inputValue, setInputValue] = useState('')
    const [chatSessionId, setChatSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)

    const formatChatMessages = (messages: any[]): ChatMessage[] => {
        return messages.map((item) => ({
            id: item.id,
            role: item.role === 'USER' ? 'teacher' : 'ai',
            name: item.role === 'USER' ? user?.name || 'Teacher' : 'AI Assistant',
            message: item.content,
            time: dateTimeFormat(item.createdAt),
        }))
    }

    const loadSessionDetail = async (sessionId: string) => {
        if (!accessToken) return

        const sessionDetail = await aiResultAnalysisService.getAnalysisChatSessionDetail(
            accessToken,
            sessionId
        )

        setChatMessages(formatChatMessages(sessionDetail.messages ?? []))
        setChatSessionId(sessionDetail.id)
        setActiveThreadId(sessionDetail.id)
    }

    const handleStartNewChat = () => {
        setChatMessages([])
        setChatSessionId(null)
        setActiveThreadId(null)
        setInputValue('')
    }

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }

    useEffect(() => {
        const loadHistory = async () => {
            if (!classId || !assignmentId || !accessToken) return
            try {
                setIsLoading(true)
                const history = await aiResultAnalysisService.getAnalysisChatHistory(accessToken)
                const formattedThreads: ChatThread[] = history.map((session: any) => ({
                    id: session.id,
                    title: session.title || t.teacher.results.chatWithAI.title,
                    subtitle: dateTimeFormat(session.updatedAt),
                }))
                setChatThreads(formattedThreads)

                const lastSessionId = history.at(0)?.id ?? null
                if (lastSessionId) {
                    await loadSessionDetail(lastSessionId)
                } else {
                    setChatMessages([])
                    setChatSessionId(null)
                    setActiveThreadId(null)
                }
            } catch (error) {
                toast.error(getToastMessage('loadFailed', language), {
                    className: TOAST_COLORS.error,
                })
            } finally {
                setIsLoading(false)
            }
        }
        loadHistory()
    }, [classId, assignmentId, accessToken, user, language])

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !accessToken || !user) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'teacher',
            name: user.name,
            message: inputValue,
            time: dateTimeFormat(new Date().toISOString()),
        }

        setChatMessages((prev) => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            console.log('Sending message to AI:', inputValue)
            const aiResponse = await aiResultAnalysisService.sendAnalysisChat({
                accessToken,
                userId: user.id,
                chatSessionId,
                prompt: inputValue,
            })
            if (aiResponse?.chatSessionId) {
                setChatSessionId(aiResponse.chatSessionId)
                setActiveThreadId(aiResponse.chatSessionId)
                setChatThreads((prev) => {
                    if (prev.some((thread) => thread.id === aiResponse.chatSessionId)) {
                        return prev
                    }

                    return [
                        {
                            id: aiResponse.chatSessionId,
                            title: t.teacher.results.chatWithAI.title,
                            subtitle: dateTimeFormat(aiResponse.createdAt),
                        },
                        ...prev,
                    ]
                })
            }
            const aiMessage: ChatMessage = {
                id: aiResponse.id,
                role: 'ai',
                name: 'AI Assistant',
                message: aiResponse.content,
                time: dateTimeFormat(aiResponse.createdAt),
            }
            setChatMessages((prev) => [...prev, aiMessage])
        } catch (error) {
            toast.error(getToastMessage('aiResponseFailed', language), {
                className: TOAST_COLORS.error,
            })
            setChatMessages((prev) => prev.slice(0, -1)) // Remove user message on error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className={cn('max-h-[80vh] h-[80vh] shadow-sm', className)}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="size-10">
                        <AvatarImage src="/logo/logo.png" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                        <DialogTitle asChild>
                            <CardTitle className="text-lg">{t.teacher.results.chatWithAI.title}</CardTitle>
                        </DialogTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 min-h-0 flex-col">
                <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="space-y-3">
                        <div className="text-xs text-center font-semibold tracking-wide text-muted-foreground">
                            {t.teacher.results.chatWithAI.recentChats}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start gap-2 rounded-full border-dashed"
                            onClick={handleStartNewChat}
                        >
                            <Plus className="size-4" />
                            Tạo cuộc trò chuyện mới
                        </Button>
                        <div className="space-y-2">
                            {chatThreads.map((thread) => (
                                <button
                                    key={thread.id}
                                    type="button"
                                    onClick={() => loadSessionDetail(thread.id)}
                                    className={cn(
                                        'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5',
                                        activeThreadId === thread.id && 'border-primary/40 bg-primary/5'
                                    )}
                                >
                                    <div className="font-semibold text-foreground">{thread.title}</div>
                                    <div className="text-xs text-muted-foreground">{thread.subtitle}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-background">
                        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
                            <div className="space-y-4 px-4 py-3">
                                {isLoading && chatMessages.length === 0 ? (
                                    <div className="text-center text-muted-foreground">Loading chat...</div>
                                ) : (
                                    chatMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex gap-3',
                                                message.role === 'teacher' ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            {message.role === 'ai' && (
                                                <Avatar className="size-8">
                                                    <AvatarImage src="/logo/logo.png" alt="AI" />
                                                    <AvatarFallback>AI</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={cn(
                                                    'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                                                    message.role === 'teacher'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-foreground'
                                                )}
                                            >
                                                <div className="text-xs font-semibold opacity-80">
                                                    {message.name}
                                                </div>
                                                <div className="mt-1 leading-relaxed">{message.message}</div>
                                                <div className="mt-2 text-[11px] opacity-70">{message.time}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isLoading && chatMessages.length > 0 && (
                                    <div className="flex justify-start">
                                        <Avatar className="size-8">
                                            <AvatarImage src="/logo/logo.png" alt="AI" />
                                            <AvatarFallback>AI</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-3 max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-muted text-foreground">
                                            Typing...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="border-t p-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder={t.teacher.results.chatWithAI.textInputPlaceholder}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isLoading}
                                />
                                <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                                    <Send className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

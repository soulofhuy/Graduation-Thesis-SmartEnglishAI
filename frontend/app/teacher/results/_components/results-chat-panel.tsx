'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Send, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

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
    chatMessages: ChatMessage[]
    chatThreads: ChatThread[]
}

export function ResultsChatPanel({
    className,
    chatMessages = [],
    chatThreads = [],
}: ResultsChatPanelProps) {
    const { t, language } = useLanguage()
    return (
        <Card className={cn('shadow-sm', className)}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="size-10">
                        <AvatarImage src="/logo/logo.png" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{t.teacher.results.chatWithAI.title}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <div className="grid gap-4 lg:grid-cols-[220px_1fr] flex-grow">
                    <div className="space-y-3">
                        <div className="text-xs text-center font-semibold tracking-wide text-muted-foreground">
                            {t.teacher.results.chatWithAI.recentChats}
                        </div>
                        <div className="space-y-2">
                            {chatThreads.map((thread) => (
                                <button
                                    key={thread.id}
                                    className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                                >
                                    <div className="font-semibold text-foreground">{thread.title}</div>
                                    <div className="text-xs text-muted-foreground">{thread.subtitle}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex h-full flex-col rounded-lg border bg-background">
                        <ScrollArea className="flex-grow">
                            <div className="space-y-4 px-4 py-3">
                                {chatMessages.map((message) => (
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
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="border-t p-3">
                            <div className="flex items-center gap-2">
                                <Input placeholder={t.teacher.results.chatWithAI.textInputPlaceholder} />
                                <Button size="icon">
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

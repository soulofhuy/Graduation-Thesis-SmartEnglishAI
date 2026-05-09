'use client'

import { useEffect, useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

type AIChatSectionProps = {
    prompt: string
    onPromptChange: (value: string) => void
    onGenerate: () => void
    isGenerating: boolean
    canGenerate: boolean
}

type ChatMessage = {
    id: string
    role: 'assistant' | 'user'
    content: string
}

export function AIChatSection({
    prompt,
    onPromptChange,
    onGenerate,
    isGenerating,
    canGenerate,
}: AIChatSectionProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const viewportRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!viewportRef.current) {
            return
        }

        viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }, [messages, isGenerating])

    const handleSend = () => {
        const trimmedPrompt = prompt.trim()
        if (!trimmedPrompt || isGenerating || !canGenerate) {
            return
        }

        setMessages((previous) => [
            ...previous,
            {
                id: `${Date.now()}`,
                role: 'user',
                content: trimmedPrompt,
            },
        ])

        onGenerate()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="relative z-10 flex h-[610px] flex-col gap-4 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm">
            <div className="hidden lg:block absolute inset-0 rounded-xl bg-gradient-to-br from-background via-background to-background" />
            <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#e6e7e9_40%,#d9dade_100%)] blur-[70px] opacity-50 dark:opacity-30 pointer-events-none" />

            <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-xl border border-muted/40 bg-background/70">
                <div ref={viewportRef} className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                                    Hãy mô tả yêu cầu của bạn. Tôi sẽ giúp tạo bộ câu hỏi phù hợp.
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-orange-100 text-orange-950 dark:bg-orange-500/20 dark:text-orange-100' : 'rounded-bl-sm border bg-muted/40 text-foreground'}`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isGenerating && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                                    AI đang tạo nội dung, vui lòng đợi...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto flex justify-center">
                <div className="relative w-full">

                    <ScrollArea className="w-full max-h-[180px] rounded-xl border border-muted/40 bg-background/80 shadow-sm">
                        <Textarea
                            value={prompt}
                            onChange={(event) => onPromptChange(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Hỏi bất kỳ điều gì"
                            className="min-h-[48px] max-h-none resize-none border-0 bg-transparent pl-4 pr-14 py-3 text-sm shadow-none focus-visible:ring-0"
                        />
                    </ScrollArea>

                    <Button
                        onClick={handleSend}
                        disabled={!canGenerate || isGenerating}
                        className="absolute right-2 bottom-2 rounded-full h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                        aria-label="Send"
                    >
                        <SendHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
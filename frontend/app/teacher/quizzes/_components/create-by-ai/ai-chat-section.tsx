'use client'

import { Plus, Sparkles, SendHorizontal } from 'lucide-react'
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

const quickPrompts = [
    'Tạo bài tập 10 câu trắc nghiệm về thì hiện tại đơn.',
    'Thiết kế bài tập từ vựng chủ đề trường học cho lớp 6.',
    'Tạo bài đọc hiểu 1 đoạn ngắn kèm 5 câu hỏi.',
]

export function AIChatSection({
    prompt,
    onPromptChange,
    onGenerate,
    isGenerating,
    canGenerate,
}: AIChatSectionProps) {
    return (
        <div className="relative flex h-screen flex-col overflow-hidden">
            <div className="hidden lg:block absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
                <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#e6e7e9_40%,#d9dade_100%)] blur-[80px] opacity-60 dark:opacity-40 animate-bubble-drift pointer-events-none" />
            </div>

            <ScrollArea className="relative z-10 flex-1 min-h-0">
                <div className="flex min-h-full flex-col items-center justify-center gap-8 py-8">
                    <div className="flex flex-col items-center gap-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h2 className="text-lg font-medium text-foreground">Ask our AI anything</h2>
                    </div>

                    <div className="w-full max-w-4xl px-4">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {quickPrompts.map((item) => (
                                <Button
                                    key={item}
                                    onClick={() => onPromptChange(item)}
                                    className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-foreground hover:border-primary/40"
                                >
                                    {item}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className="relative z-10 w-full px-4 pb-4 flex-shrink-0">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="relative flex-1">
                        <Textarea
                            value={prompt}
                            onChange={(event) => onPromptChange(event.target.value)}
                            placeholder="Hỏi bất kỳ điều gì"
                            className="min-h-[48px] max-h-[200px] resize-none border-muted/40 bg-background/80 pl-4 pr-14 py-3 text-sm shadow-sm"
                        />

                        <Button
                            onClick={onGenerate}
                            disabled={!canGenerate || isGenerating}
                            className="absolute right-2 bottom-2 rounded-full h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                            aria-label="Send"
                        >
                            <SendHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
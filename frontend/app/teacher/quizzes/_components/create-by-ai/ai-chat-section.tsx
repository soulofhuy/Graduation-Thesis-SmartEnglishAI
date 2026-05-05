'use client'

import { Bot, Sparkles, SendHorizontal, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
        <div className="relative">
            <div className="hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
                <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#e6e7e9_40%,#d9dade_100%)] blur-[80px] opacity-60 dark:opacity-40 animate-bubble-drift pointer-events-none" />
            </div>

            <div className="flex flex-col items-center justify-center min-h-[72vh] gap-8 relative z-10">
                <div className="flex flex-col items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h2 className="text-lg font-medium text-foreground">Ask our AI anything</h2>
                </div>

                <Card className="w-full max-w-4xl border-muted/40 shadow-sm bg-card/90">
                    <div className="p-6">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {quickPrompts.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => onPromptChange(item)}
                                    className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-foreground hover:border-primary/40"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <Textarea
                                    value={prompt}
                                    onChange={(event) => onPromptChange(event.target.value)}
                                    placeholder="Ask me anything about your projects"
                                    className="min-h-[56px] resize-none rounded-full border-muted/40 bg-background/80 p-3 pr-14 text-sm shadow-sm"
                                />

                                <Button
                                    onClick={onGenerate}
                                    disabled={!canGenerate || isGenerating}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 p-0"
                                    aria-label="Send"
                                >
                                    <SendHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
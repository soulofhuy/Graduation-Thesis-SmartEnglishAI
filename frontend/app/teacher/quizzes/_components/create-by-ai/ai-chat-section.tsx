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
        <div className="space-y-4">
            <Card className="overflow-hidden border-muted/40 shadow-sm">
                <div className="border-b bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">AI Chat</h3>
                            <p className="text-sm text-muted-foreground">Nhập yêu cầu, AI sẽ sinh bài tập và nội dung để bạn chỉnh tiếp</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    <div className="rounded-2xl border border-dashed border-primary/20 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Gợi ý nhanh
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {quickPrompts.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => onPromptChange(item)}
                                    className="rounded-xl border border-border/70 bg-background px-4 py-3 text-left text-sm text-foreground transition-all hover:border-primary/40 hover:shadow-sm"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Yêu cầu của bạn</label>
                        <Textarea
                            value={prompt}
                            onChange={(event) => onPromptChange(event.target.value)}
                            placeholder="Ví dụ: Tạo bài tập 10 câu trắc nghiệm về thì hiện tại đơn cho học sinh lớp 6"
                            className="min-h-[180px] resize-none rounded-2xl border-muted/60 bg-background/80 p-4 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Sau khi tạo xong, bạn có thể chỉnh nội dung ở tab Edit nội dung.
                        </div>
                        <Button onClick={onGenerate} disabled={!canGenerate || isGenerating} className="gap-2">
                            <SendHorizontal className="h-4 w-4" />
                            {isGenerating ? 'Đang tạo...' : 'Tạo nội dung'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
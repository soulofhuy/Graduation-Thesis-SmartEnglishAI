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

export function AIChatSection({
    prompt,
    onPromptChange,
    onGenerate,
    isGenerating,
    canGenerate,
}: AIChatSectionProps) {
    return (
        <div className="relative z-10 flex flex-col gap-4 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm h-[600px]">
            <div className="hidden lg:block absolute inset-0 rounded-xl bg-gradient-to-br from-background via-background to-background" />
            <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#e6e7e9_40%,#d9dade_100%)] blur-[70px] opacity-50 dark:opacity-30 pointer-events-none" />

            <div className="relative flex flex-col items-center gap-3 py-6">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-medium text-foreground">Ask our AI anything</h2>
            </div>

            <div className="relative flex flex-col gap-4">
                <div className="relative w-full">
                    <Textarea
                        value={prompt}
                        onChange={(event) => onPromptChange(event.target.value)}
                        placeholder="Hỏi bất kỳ điều gì"
                        className="min-h-[48px] resize-none rounded-xl border-muted/40 bg-background/80 pl-4 pr-14 py-3 text-sm shadow-sm"
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
    )
}
'use client'

import { ClipboardList, Wand2, X } from 'lucide-react'
import { Card, CardDescription } from '@/components/ui/card'
import { useLanguage } from '@/components/language-provider'

type AICreateModeCardProps = {
    onSelectTraditional: () => void
    onSelectAI: () => void
    onClose: () => void
}

export function AICreateModeCard({ onSelectTraditional, onSelectAI, onClose }: AICreateModeCardProps) {
    const { t } = useLanguage()

    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <Card className="w-full max-w-2xl overflow-hidden py-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                <div className="flex justify-center mt-8">
                    <h2 className="text-lg font-bold text-center">
                        Chọn cách bạn tạo bài tập
                    </h2>
                </div>
                <div className="p-8 sm:p-10">
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={onSelectTraditional}
                                className="group rounded-2xl border border-border/70 bg-background/80 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
                            >
                                <div className="mb-4 flex h-25 w-25 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary mx-auto">
                                    <ClipboardList className="h-10 w-10" />
                                </div>
                                <div className="text-center text-base text-foreground">
                                    Tạo thủ công
                                </div>
                            </button>

                            <button
                                onClick={onSelectAI}
                                className="group rounded-2xl border border-border/70 bg-background/80 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
                            >
                                <div className="mb-4 flex h-25 w-25 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary mx-auto">
                                    <Wand2 className="h-10 w-10" />
                                </div>
                                <div className="text-center text-sm text-foreground">
                                    Tạo bằng AI
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div >
    )
}
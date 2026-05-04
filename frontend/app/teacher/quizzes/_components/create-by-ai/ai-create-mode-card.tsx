'use client'

import { ClipboardList, Wand2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <div></div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-8 sm:p-10">
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight">{t.teacher.assignments.createAssignment.title}</h2>
                            <p className="text-sm text-muted-foreground">Chọn cách tạo bài tập</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={onSelectTraditional}
                                className="group rounded-2xl border border-border/70 bg-background/80 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-primary">
                                    <ClipboardList className="h-10 w-10" />
                                </div>
                                <div className="text-center text-sm font-semibold text-foreground">
                                    Tạo câu hỏi cho bài kiểm tra
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={onSelectAI}
                                className="group rounded-2xl border border-border/70 bg-background/80 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-primary">
                                    <Wand2 className="h-10 w-10" />
                                </div>
                                <div className="text-center text-sm font-semibold text-foreground">
                                    Tạo bằng AI
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
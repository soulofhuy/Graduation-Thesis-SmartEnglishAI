'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getInstructionSteps } from './ai-instruction-data'
import { useLanguage } from '@/components/language-provider'

interface AIInstructionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AIInstructionModal({ open, onOpenChange }: AIInstructionModalProps) {
    const { language, t } = useLanguage()
    const steps = getInstructionSteps(language)

    const title = language === 'en' ? 'AI assignment creation guide' : 'Hướng dẫn tạo bài tập bằng AI'
    const description = language === 'en' ? 'Follow the steps below to create assignments with AI faster.' : 'Làm theo các bước sau để tạo bài tập bằng AI nhanh hơn.'
    const closeLabel = language === 'en' ? 'Close' : 'Đóng'
    const understoodLabel = language === 'en' ? "Got it" : 'Tôi đã hiểu'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl !sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {steps.map((step) => (
                        <div key={step.stepNumber} className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                {step.stepNumber}
                            </div>

                            <h3 className="text-base leading-none">
                                {step.title}
                            </h3>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {closeLabel}
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                        {understoodLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

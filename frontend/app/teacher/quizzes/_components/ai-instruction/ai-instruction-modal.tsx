'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { AI_INSTRUCTION_STEPS } from './ai-instruction-data'

interface AIInstructionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AIInstructionModal({ open, onOpenChange }: AIInstructionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Hướng dẫn tạo bài tập bằng AI</DialogTitle>
                    <DialogDescription>
                        Làm theo các bước sau để tạo bài tập bằng AI nhanh hơn.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {AI_INSTRUCTION_STEPS.map((step) => (
                        <div key={step.stepNumber} className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                {step.stepNumber}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                        Tôi đã hiểu
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

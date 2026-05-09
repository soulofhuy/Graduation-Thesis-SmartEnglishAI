'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getInstructionSteps } from './ai-instruction-data'
import { useLanguage } from '@/components/language-provider'

interface AIInstructionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AIInstructionModal({ open, onOpenChange }: AIInstructionModalProps) {
    const { language, t } = useLanguage()
    const steps = getInstructionSteps(language)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl !sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{t.teacher.assignments.createAssignment.title}</DialogTitle>
                    <DialogDescription>
                        {t.teacher.assignments.createAssignment.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {steps.map((step) => (
                        <div key={step.stepNumber} className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                    {step.stepNumber}
                                </div>

                                <h3 className="text-base leading-none">
                                    {step.title}
                                </h3>
                            </div>

                            {step.imageUrl && (
                                <div className="pl-14">
                                    <img
                                        src={step.imageUrl}
                                        alt={step.title}
                                        className="max-h-64 rounded-lg border object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.close}
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                        {t.common.understandLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import { QuizPreviewContent } from './quiz-preview-content'
import type { CreateAssignmentInput } from '@/lib/types'

interface QuizPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    payload: CreateAssignmentInput | null
}

export function QuizPreviewModal({ isOpen, onClose, payload }: QuizPreviewModalProps) {
    const { t } = useLanguage()

    if (!payload) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.common.preview}</DialogTitle>
                </DialogHeader>

                <QuizPreviewContent payload={payload} />

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

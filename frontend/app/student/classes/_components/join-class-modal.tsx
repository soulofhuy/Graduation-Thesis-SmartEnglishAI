'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModalWrapper } from '@/components/modal-wrapper'
import { useLanguage } from '@/components/language-provider'

interface JoinClassModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    classCode: string
    onClassCodeChange: (value: string) => void
    isJoining: boolean
    onJoin: () => void
}

export function JoinClassModal({
    isOpen,
    onOpenChange,
    classCode,
    onClassCodeChange,
    isJoining,
    onJoin,
}: JoinClassModalProps) {

    const { t } = useLanguage();

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t.student.classes.buttonJoinClass.title}
            description={t.student.classes.buttonJoinClass.description}
            footer={
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={onJoin} disabled={isJoining || !classCode.trim()}>
                        {isJoining ? 'Đang tham gia...' : 'Tham gia'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                        {t.student.classes.buttonJoinClass.fieldClassCode}
                    </label>
                    <Input
                        placeholder="Ví dụ: ABC123"
                        value={classCode}
                        onChange={e => onClassCodeChange(e.target.value)}
                        disabled={isJoining}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        {t.student.classes.buttonJoinClass.fieldClassCodePlaceholder}
                    </p>
                </div>
            </div>
        </ModalWrapper>
    )
}

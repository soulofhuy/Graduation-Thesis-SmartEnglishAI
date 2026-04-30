'use client'

import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { toggleClassStatus } from '@/services/teacher/classes'
import type { Class as BackendClass } from '@/lib/types'
import { TOAST_COLORS } from '@/lib/toast/color'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'

interface DeleteClassModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    classItem: BackendClass | null
    accessToken: string
    onSuccess: (classId: string) => void
}

export function DeleteClassModal({
    isOpen,
    onOpenChange,
    classItem,
    accessToken,
    onSuccess,
}: DeleteClassModalProps) {
    const { t, language } = useLanguage()
    const [isDeleting, setIsDeleting] = React.useState(false)

    async function handleDelete() {
        if (!accessToken || !classItem?.id) {
            toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
            return
        }

        setIsDeleting(true)
        try {
            const result = await toggleClassStatus(accessToken, classItem.id)
            onSuccess(classItem.id)
            onOpenChange(false)
            toast.success(result.message, { className: TOAST_COLORS.success })
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('deleteFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsDeleting(false)
        }
    }

    const studentCount = classItem?.students?.length ?? 0

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">
                        {t.teacher.classes.deleteClass.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t.teacher.classes.deleteClass.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {classItem && (
                    <div className="my-6 space-y-4">
                        <h3 className="font-semibold text-lg mb-6">{t.teacher.classes.deleteClass.classInformation.title}</h3>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t.teacher.classes.deleteClass.classInformation.fieldClassName}</p>
                                    <p className="font-medium">{classItem.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t.teacher.classes.deleteClass.classInformation.fieldClassDescription}</p>
                                    <p className="text-sm">{classItem.description || 'Không có mô tả'}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t.teacher.classes.deleteClass.classInformation.fieldClassCode}</p>
                                    <p className="font-mono font-bold">{classItem.classCode}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t.teacher.classes.deleteClass.classInformation.fieldStudentNumber}</p>
                                    <p className="font-medium text-lg">{studentCount}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t.teacher.classes.deleteClass.classInformation.fieldAssignmentNumber}</p>
                                    <p className="font-medium text-lg">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <AlertDialogCancel disabled={isDeleting}>
                        {t.common.cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? t.common.isDeleting : t.common.delete}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModalWrapper } from '@/components/modal-wrapper'
import type { Class as BackendClass, ClassMember } from '@/lib/types'
import { approveStudentJoinClass, rejectStudentJoinClass } from '@/services/teacher/classes'
import { toast } from 'sonner'
import { TOAST_COLORS } from '@/lib/toast/color'
import { Loader2, UserCheck, UserX, QrCode } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { dateTimeFormat } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'

interface PendingRequestsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    classItem: BackendClass | null
    accessToken: string
    onActionSuccess: () => Promise<void> | void
}

const getStudentDisplayName = (request: ClassMember) => {
    const profile = request.student?.profile
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')

    if (fullName.trim()) {
        return fullName
    }

    return request.student?.email ?? 'Học sinh'
}

export function PendingRequestsModal({
    isOpen,
    onOpenChange,
    classItem,
    accessToken,
    onActionSuccess,
}: PendingRequestsModalProps) {
    const { t, language } = useLanguage()
    const [pendingRequests, setPendingRequests] = useState<ClassMember[]>([])
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) {
            return
        }
        setPendingRequests(classItem?.classMembers?.filter(request => !request.isApproved && !request.isRejected && !request.isBanned) ?? [])
    }, [classItem, isOpen])

    const removePendingRequest = (studentId: string) => {
        setPendingRequests(currentRequests =>
            currentRequests.filter(request => request.studentId !== studentId)
        )
    }

    const handleApprove = async (studentId: string) => {
        if (!classItem?.id) return

        const snapshot = pendingRequests
        removePendingRequest(studentId)
        setProcessingRequestId(studentId)
        try {
            const result = await approveStudentJoinClass(accessToken, classItem.id, studentId)
            toast.success(result.message, { className: TOAST_COLORS.success })
            await onActionSuccess()
        } catch (error) {
            setPendingRequests(snapshot)
            const message = error instanceof Error ? error.message : getToastMessage('acceptStudentFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setProcessingRequestId(null)
        }
    }

    const handleReject = async (studentId: string) => {
        if (!classItem?.id) return

        const snapshot = pendingRequests
        removePendingRequest(studentId)
        setProcessingRequestId(studentId)
        try {
            const result = await rejectStudentJoinClass(accessToken, classItem.id, studentId)
            toast.success(result.message, { className: TOAST_COLORS.success })
            await onActionSuccess()
        } catch (error) {
            setPendingRequests(snapshot)
            const message = error instanceof Error ? error.message : getToastMessage('rejectStudentFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setProcessingRequestId(null)
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t.teacher.classes.viewPendingRequests.title}
            description={t.teacher.classes.viewPendingRequests.class + ': ' + (classItem?.name || classItem?.classCode)}
            footer={null}
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl border bg-muted/30 px-4 py-3">
                        <p className="text-sm text-muted-foreground">
                            {t.teacher.classes.viewPendingRequests.pendingRequestsCount}
                        </p>
                        <p className="text-2xl font-bold">
                            {pendingRequests.length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-muted/30 px-4 py-3">
                        <Badge variant="secondary" className="gap-1">
                            <QrCode className="h-3.5 w-3.5" />
                            {classItem?.classCode ?? 'N/A'}
                        </Badge>
                    </div>
                </div>

                {pendingRequests.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            {t.teacher.classes.viewPendingRequests.noPendingRequests}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3 max-h-[430px] overflow-auto pr-1">
                        {pendingRequests.map((request) => (
                            <Card key={request.id} className="border-border/70 shadow-sm">
                                <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{t.teacher.classes.viewPendingRequests.status}</Badge>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {getStudentDisplayName(request)}
                                        </span>
                                        <p className="text-sm text-muted-foreground">
                                            {request.student?.email ?? request.studentId}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t.teacher.classes.viewPendingRequests.timeRequest} {request.joinedAt ? dateTimeFormat(request.joinedAt) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                            onClick={() => handleApprove(request.studentId)}
                                            disabled={processingRequestId === request.studentId}
                                        >
                                            {processingRequestId === request.studentId ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                            onClick={() => handleReject(request.studentId)}
                                            disabled={processingRequestId === request.studentId}
                                        >
                                            {processingRequestId === request.studentId ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ModalWrapper>
    )
}
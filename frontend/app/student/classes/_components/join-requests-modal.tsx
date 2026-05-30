'use client'

import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/modal-wrapper'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/components/language-provider'
import { getStudentRequestJoinStatusColor } from '@/lib/color-mappers/student-request-join-status-mapper'
import { getStudentRequestJoinStatusLabel } from '@/lib/language-mappers/student-request-join-status-mapper'

export interface JoinRequestItem {
    id: string
    classCode: string
    status: 'pending' | 'approved' | 'rejected'
    requestedAt: string
}

interface JoinRequestsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    requests: JoinRequestItem[]
    isLoading: boolean
}

export function JoinRequestsModal({
    isOpen,
    onOpenChange,
    requests,
    isLoading,
}: JoinRequestsModalProps) {
    const { t, language } = useLanguage();

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t.student.classes.buttonViewRequests.title}
            description={t.student.classes.buttonViewRequests.description}
            contentClassName="w-[98vw] sm:max-w-2xl"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        {t.common.close}
                    </Button>
                </div>
            }
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">{t.student.classes.buttonViewRequests.columnClassCode}</TableHead>
                        <TableHead className="text-center">{t.student.classes.buttonViewRequests.columnTimeRequest}</TableHead>
                        <TableHead className="text-center">{t.student.classes.buttonViewRequests.columnStatus}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                {t.common.loading}
                            </TableCell>
                        </TableRow>
                    ) : requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                {t.student.classes.buttonViewRequests.noRequests}
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map(request => (
                            <TableRow key={request.id}>
                                <TableCell className="font-semibold text-center">{request.classCode}</TableCell>
                                <TableCell className="text-center">{new Date(request.requestedAt).toLocaleString('vi-VN')}</TableCell>
                                <TableCell className="text-center">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStudentRequestJoinStatusColor(request.status)}`}>
                                        {getStudentRequestJoinStatusLabel(request.status, language)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ModalWrapper>
    )
}
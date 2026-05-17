'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { TablePagination } from '@/components/pagination'
import { dateTimeFormat } from '@/lib/format'
import type { ClassMember } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

type DeactivatedStudentsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    members: ClassMember[]
    isLoading: boolean
    isMutating: boolean
    totalItems: number
    currentPage: number
    pageSize: number
    hasPrevPage: boolean
    hasNextPage: boolean
    isPaging: boolean
    onPageSizeChange: (nextPageSize: number) => void
    onPrevPage: () => void
    onNextPage: () => void
    onReactivateMember: (member: ClassMember) => Promise<void>
}

function getStudentName(member: ClassMember) {
    const firstName = member.student?.profile?.firstName ?? ''
    const lastName = member.student?.profile?.lastName ?? ''
    const fullName = `${lastName} ${firstName}`.trim()
    return fullName || member.student?.email || '-'
}

export function DeactivatedStudentsModal({
    open,
    onOpenChange,
    members,
    isLoading,
    isMutating,
    totalItems,
    currentPage,
    pageSize,
    hasPrevPage,
    hasNextPage,
    isPaging,
    onPageSizeChange,
    onPrevPage,
    onNextPage,
    onReactivateMember,
}: DeactivatedStudentsModalProps) {
    const { t } = useLanguage()
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[50vw] max-w-[95vw] sm:max-w-[1400px]">
                <DialogHeader>
                    <DialogTitle>{t.teacher.students.viewBannedStudents.title}</DialogTitle>
                    <DialogDescription>
                        {t.teacher.students.viewBannedStudents.description}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        {t.common.loading}
                    </div>
                ) : members.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        {t.teacher.students.viewBannedStudents.noData}
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="text-center">
                                    <TableHead className="w-16 text-center">{t.teacher.students.viewBannedStudents.columnNo}</TableHead>
                                    <TableHead className="text-center">{t.teacher.students.viewBannedStudents.columnName}</TableHead>
                                    <TableHead className="text-center">{t.teacher.students.viewBannedStudents.columnEmail}</TableHead>
                                    <TableHead className="text-center">{t.teacher.students.viewBannedStudents.columnDateJoined}</TableHead>
                                    <TableHead className="text-center">{t.teacher.students.viewBannedStudents.columnActions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member, index) => (
                                    <TableRow key={member.id} className="text-center">
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{getStudentName(member)}</TableCell>
                                        <TableCell>{member.student?.email || '-'}</TableCell>
                                        <TableCell>
                                            {member.joinedAt ? dateTimeFormat(member.joinedAt) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isMutating}
                                                onClick={() => void onReactivateMember(member)}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                {t.teacher.students.viewBannedStudents.unbanButton}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {!isLoading && members.length > 0 ? (
                    <TablePagination
                        totalItems={totalItems}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        isPaging={isPaging}
                        pageSize={pageSize}
                        onPrevPage={onPrevPage}
                        onNextPage={onNextPage}
                        onPageSizeChange={onPageSizeChange}
                        totalLabel={t.common.pagination.total}
                        previousLabel={t.common.pagination.previous}
                        nextLabel={t.common.pagination.next}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
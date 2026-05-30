import { useMemo, useState } from 'react'
import { UserX2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/pagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { dateTimeFormat } from '@/lib/format'
import type { ClassMember } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'
import { toast } from 'sonner'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getStudentBannedStatusLabel } from '@/lib/language-mappers/student-banned-status-mapper'
import { getStudentBannedStatusColor } from '@/lib/color-mappers/student-banned-status-mapper'

type StudentListTableProps = {
    members: ClassMember[]
    isLoading: boolean
    isPaging: boolean
    isMutating: boolean
    hasSelectedClass: boolean
    selectedClassName: string
    searchValue: string
    pageSize: number
    totalItems: number
    hasPrevPage: boolean
    hasNextPage: boolean
    onDeactivateMember: (member: ClassMember) => Promise<void>
    onPageSizeChange: (nextPageSize: number) => void
    onPrevPage: () => void
    onNextPage: () => void
}

function getStudentName(member: ClassMember) {
    const firstName = member.student?.profile?.firstName ?? ''
    const lastName = member.student?.profile?.lastName ?? ''
    const fullName = `${lastName} ${firstName}`.trim()
    return fullName || member.student?.email || ''
}

export function StudentListTable({
    members,
    isLoading,
    isPaging,
    isMutating,
    hasSelectedClass,
    selectedClassName,
    searchValue,
    pageSize,
    totalItems,
    hasPrevPage,
    hasNextPage,
    onDeactivateMember,
    onPageSizeChange,
    onPrevPage,
    onNextPage,
}: StudentListTableProps) {
    const { t, language } = useLanguage();
    const [memberToRemove, setMemberToRemove] = useState<ClassMember | null>(null)

    const normalizedSearch = searchValue.trim().toLowerCase()

    const filteredMembers = useMemo(() => {
        return members
            .filter((member) => {
                if (!normalizedSearch) {
                    return true
                }

                const studentName = getStudentName(member).toLowerCase()
                const studentEmail = member.student?.email?.toLowerCase() ?? ''
                return studentName.includes(normalizedSearch) || studentEmail.includes(normalizedSearch)
            })
    }, [members, normalizedSearch])

    const handleConfirmRemove = async () => {
        if (!memberToRemove) {
            return
        }

        try {
            await onDeactivateMember(memberToRemove)
            setMemberToRemove(null)
        } catch {
            toast.error(getToastMessage('removeStudentFailed', language), { className: TOAST_COLORS.error })
        }
    }

    if (isLoading) {
        return <div className="py-10 text-center text-muted-foreground">{t.common.loading}</div>
    }

    if (!hasSelectedClass) {
        return <div className="py-10 text-center text-muted-foreground">{t.teacher.students.tableView.requestToChooseClass}</div>
    }

    if (filteredMembers.length === 0) {
        return (
            <>
                <div className="py-10 text-center text-muted-foreground">
                    {t.teacher.students.tableView.noData}.
                </div>
            </>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16 text-center">{t.teacher.students.tableView.columnNo}</TableHead>
                            <TableHead className="text-center">{t.teacher.students.tableView.columnName}</TableHead>
                            <TableHead className="text-center">{t.teacher.students.tableView.columnEmail}</TableHead>
                            <TableHead className="text-center">{t.teacher.students.tableView.columnStatus}</TableHead>
                            <TableHead className="text-center">{t.teacher.students.tableView.columnDateJoined}</TableHead>
                            <TableHead className="text-center">{t.teacher.students.tableView.columnActions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.map((member, index) => {
                            return (
                                <TableRow key={member.id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell className="text-center font-medium">{getStudentName(member)}</TableCell>
                                    <TableCell className="text-center">{member.student?.email || '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`gap-1.5 ${getStudentBannedStatusColor(member.isBanned)}`}>
                                            {getStudentBannedStatusLabel(member.isBanned, language)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{member.joinedAt ? dateTimeFormat(member.joinedAt) : '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                disabled={isMutating}
                                                onClick={() => setMemberToRemove(member)}
                                            >
                                                <UserX2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

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

            <AlertDialog open={Boolean(memberToRemove)} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.teacher.students.banStudent.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.teacher.students.banStudent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.no}</AlertDialogCancel>
                        <AlertDialogAction disabled={isMutating} onClick={() => void handleConfirmRemove()}>
                            {t.common.yes}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

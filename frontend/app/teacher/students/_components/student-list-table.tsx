import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { UserX, CheckCircle2, XCircle, Clock3, UserX2 } from 'lucide-react'
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
import { PageSizeSelect } from '@/components/page-size-select'
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
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

type StudentListTableProps = {
    members: ClassMember[]
    isLoading: boolean
    isPaging: boolean
    hasSelectedClass: boolean
    selectedClassName: string
    searchValue: string
    pageSize: number
    totalItems: number
    hasPrevPage: boolean
    hasNextPage: boolean
    removedMemberIds: Record<string, boolean>
    onDeactivateMember: (memberId: string) => void
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

function getMemberStatus(member: ClassMember) {
    if (member.isBanned) {
        return {
            label: 'Da chan',
            className: 'bg-destructive/10 text-destructive border-destructive/30',
            icon: <UserX className="h-3.5 w-3.5" />,
        }
    }

    if (member.isApproved) {
        return {
            label: 'Dang hoc',
            className: 'bg-emerald-500/10 text-emerald-700 border-emerald-400/40',
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        }
    }

    if (member.isRejected) {
        return {
            label: 'Da tu choi',
            className: 'bg-orange-500/10 text-orange-700 border-orange-400/40',
            icon: <XCircle className="h-3.5 w-3.5" />,
        }
    }

    return {
        label: 'Cho duyet',
        className: 'bg-blue-500/10 text-blue-700 border-blue-400/40',
        icon: <Clock3 className="h-3.5 w-3.5" />,
    }
}

export function StudentListTable({
    members,
    isLoading,
    isPaging,
    hasSelectedClass,
    selectedClassName,
    searchValue,
    pageSize,
    totalItems,
    hasPrevPage,
    hasNextPage,
    removedMemberIds,
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
            .filter((member) => !removedMemberIds[member.id])
            .filter((member) => {
                if (!normalizedSearch) {
                    return true
                }

                const studentName = getStudentName(member).toLowerCase()
                const studentEmail = member.student?.email?.toLowerCase() ?? ''
                return studentName.includes(normalizedSearch) || studentEmail.includes(normalizedSearch)
            })
    }, [members, normalizedSearch, removedMemberIds])

    const handleConfirmRemove = () => {
        if (!memberToRemove) {
            return
        }

        onDeactivateMember(memberToRemove.id)

        toast.success(getToastMessage('deleteSuccess', language), { className: TOAST_COLORS.success })
        setMemberToRemove(null)
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
                            <TableHead className="w-16">{t.teacher.students.tableView.columnNo}</TableHead>
                            <TableHead>{t.teacher.students.tableView.columnName}</TableHead>
                            <TableHead>{t.teacher.students.tableView.columnEmail}</TableHead>
                            <TableHead>{t.teacher.students.tableView.columnStatus}</TableHead>
                            <TableHead>{t.teacher.students.tableView.columnDateJoined}</TableHead>
                            <TableHead className="text-right">{t.teacher.students.tableView.columnActions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.map((member, index) => {
                            const status = getMemberStatus(member)

                            return (
                                <TableRow key={member.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{getStudentName(member)}</TableCell>
                                    <TableCell>{member.student?.email || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`gap-1.5 ${status.className}`}>
                                            {status.icon}
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{member.joinedAt ? dateTimeFormat(member.joinedAt) : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                    {t.common.pagination.total} {totalItems}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPrevPage || isPaging}
                        onClick={onPrevPage}
                    >
                        {t.common.pagination.previous}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage || isPaging}
                        onClick={onNextPage}
                    >
                        {t.common.pagination.next}
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div>
                        <PageSizeSelect
                            value={pageSize}
                            onChange={onPageSizeChange}
                            options={[10, 20, 25, 50]}
                            disabled={isPaging}
                        />
                    </div>
                </div>
            </div>

            <AlertDialog open={Boolean(memberToRemove)} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xoa hoc sinh khoi danh sach hien thi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hanh dong nay chi ap dung o frontend. Ban co the tai lai trang de lay du lieu goc.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Huy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRemove}>Xoa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    )
}

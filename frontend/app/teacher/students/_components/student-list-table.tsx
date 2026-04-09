import { useMemo, useState } from 'react'
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
    const { t } = useLanguage();
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
            // Error toast is handled by page container.
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
                            const status = getMemberStatus(member)

                            return (
                                <TableRow key={member.id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell className="text-center font-medium">{getStudentName(member)}</TableCell>
                                    <TableCell className="text-center">{member.student?.email || '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`gap-1.5 ${status.className}`}>
                                            {status.icon}
                                            {status.label}
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

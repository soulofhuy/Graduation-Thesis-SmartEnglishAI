import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, UserX, CheckCircle2, XCircle, Clock3 } from 'lucide-react'
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
    onPageSizeChange: (nextPageSize: number) => void
    onPrevPage: () => void
    onNextPage: () => void
}

function getStudentName(member: ClassMember) {
    const firstName = member.student?.profile?.firstName ?? ''
    const lastName = member.student?.profile?.lastName ?? ''
    const fullName = `${lastName} ${firstName}`.trim()
    return fullName || member.student?.email || 'Chua cap nhat ten'
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
    onPageSizeChange,
    onPrevPage,
    onNextPage,
}: StudentListTableProps) {
    const [memberToRemove, setMemberToRemove] = useState<ClassMember | null>(null)
    const [removedMemberIds, setRemovedMemberIds] = useState<Record<string, boolean>>({})

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

        setRemovedMemberIds((prev) => ({
            ...prev,
            [memberToRemove.id]: true,
        }))

        toast.success('Da xoa hoc sinh khoi danh sach hien thi')
        setMemberToRemove(null)
    }

    if (isLoading) {
        return <div className="py-10 text-center text-muted-foreground">Dang tai danh sach hoc sinh...</div>
    }

    if (!hasSelectedClass) {
        return <div className="py-10 text-center text-muted-foreground">Hay chon lop de tai danh sach hoc sinh.</div>
    }

    if (filteredMembers.length === 0) {
        return (
            <div className="py-10 text-center text-muted-foreground">
                Khong co hoc sinh phu hop voi bo loc hien tai trong lop {selectedClassName}.
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">STT</TableHead>
                            <TableHead>Hoc sinh</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Trang thai</TableHead>
                            <TableHead>Ngay tham gia</TableHead>
                            <TableHead className="text-right">Thao tac</TableHead>
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
                                                variant="destructive"
                                                onClick={() => setMemberToRemove(member)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                <p className="text-sm text-muted-foreground">Tong {totalItems} hoc sinh</p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPrevPage || isPaging}
                        onClick={onPrevPage}
                    >
                        Trang truoc
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage || isPaging}
                        onClick={onNextPage}
                    >
                        Trang sau
                    </Button>
                </div>

                <div className="flex items-center gap-4">

                    <div className="w-[180px]">
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

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
import { dateTimeFormat } from '@/lib/format'
import type { ClassMember } from '@/lib/types'

type DeactivatedStudentsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    members: ClassMember[]
    onReactivateMember: (memberId: string) => void
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
    onReactivateMember,
}: DeactivatedStudentsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Danh sach hoc sinh da deactive</DialogTitle>
                    <DialogDescription>
                        Activate lai hoc sinh de hien thi tro lai trong bang chinh.
                    </DialogDescription>
                </DialogHeader>

                {members.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Chua co hoc sinh nao bi deactive.
                    </div>
                ) : (
                    <div className="max-h-[50vh] overflow-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">STT</TableHead>
                                    <TableHead>Ho ten</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Ngay vao lop</TableHead>
                                    <TableHead className="text-right">Hanh dong</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member, index) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{getStudentName(member)}</TableCell>
                                        <TableCell>{member.student?.email || '-'}</TableCell>
                                        <TableCell>
                                            {member.joinedAt ? dateTimeFormat(member.joinedAt) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onReactivateMember(member.id)}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                Activate
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
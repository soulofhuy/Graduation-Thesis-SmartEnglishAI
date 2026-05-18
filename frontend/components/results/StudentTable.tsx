'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { StudentSummary } from '@/services/admin/results'

type Props = {
    students: StudentSummary[]
    onView: (studentId: string) => void
}

export default function StudentTable({ students, onView }: Props) {
    return (
        <div className="p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số lần</TableHead>
                        <TableHead>Điểm cao nhất</TableHead>
                        <TableHead>Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((s, idx) => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.email ?? '-'}</TableCell>
                            <TableCell>{s.attemptsCount ?? 0}</TableCell>
                            <TableCell>{s.bestScore ?? '-'}{typeof s.bestScore === 'number' ? '%' : ''}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => onView(s.id)}>View</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

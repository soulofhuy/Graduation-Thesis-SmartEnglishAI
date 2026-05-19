'use client'

import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { StudentSummary } from '@/services/admin/results'

type Props = {
    students: StudentSummary[]
    onView: (studentId: string) => void
}

export default function StudentTable({ students, onView }: Props) {
    const { t, language } = useLanguage()
    return (
        <div className="p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{t.admin.resultManagement.resultTable.fieldName}</TableHead>
                        <TableHead>{t.admin.resultManagement.resultTable.fieldEmail}</TableHead>
                        <TableHead>{t.admin.resultManagement.resultTable.fieldNumberOfSubmissions}</TableHead>
                        <TableHead>{t.admin.resultManagement.resultTable.fieldHighestResult}</TableHead>
                        <TableHead>{t.admin.resultManagement.resultTable.fieldActions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((s, idx) => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.email ?? '-'}</TableCell>
                            <TableCell>{s.attemptsCount ?? 0}</TableCell>
                            <TableCell>
                                {typeof s.bestCorrectCount === 'number' && typeof s.totalQuestions === 'number'
                                    ? `${s.bestCorrectCount} / ${s.totalQuestions}`
                                    : s.bestCorrectCount != null
                                        ? String(s.bestCorrectCount)
                                        : '-'}
                            </TableCell>
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

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
    const { t } = useLanguage()
    return (
        <div className="p-4">
            <Table>
                <TableHeader>
                    <TableRow >
                        <TableHead className="text-center">#</TableHead>
                        <TableHead className="text-center">{t.admin.resultManagement.resultTable.fieldName}</TableHead>
                        <TableHead className="text-center">{t.admin.resultManagement.resultTable.fieldEmail}</TableHead>
                        <TableHead className="text-center">{t.admin.resultManagement.resultTable.fieldNumberOfSubmissions}</TableHead>
                        <TableHead className="text-center">{t.admin.resultManagement.resultTable.fieldHighestResult}</TableHead>
                        <TableHead className="text-center">{t.admin.resultManagement.resultTable.fieldActions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((s, idx) => (
                        <TableRow key={s.id}>
                            <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                            <TableCell className="text-center">{s.name}</TableCell>
                            <TableCell className="text-center">{s.email ?? '-'}</TableCell>
                            <TableCell className="text-center">{s.attemptsCount ?? 0}</TableCell>
                            <TableCell className="text-center">
                                {typeof s.bestCorrectCount === 'number' && typeof s.totalQuestions === 'number'
                                    ? `${s.bestCorrectCount} / ${s.totalQuestions}`
                                    : s.bestCorrectCount != null
                                        ? String(s.bestCorrectCount)
                                        : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <Button size="sm" onClick={() => onView(s.id)}>
                                        {t.admin.resultManagement.actions.view}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

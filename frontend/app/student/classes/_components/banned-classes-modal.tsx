'use client'

import type { Class } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/modal-wrapper'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/components/language-provider'
import { dateTimeFormat } from '@/lib/format'

interface BannedClassesModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    classes: Class[]
    isLoading: boolean
}

const getTeacherLabel = (classItem: Class) => {
    const profile = classItem.teacher?.profile
    const teacherName = [profile?.lastName, profile?.firstName].filter(Boolean).join(' ')

    return teacherName || classItem.teacher?.email || '---'
}

export function BannedClassesModal({
    isOpen,
    onOpenChange,
    classes,
    isLoading,
}: BannedClassesModalProps) {
    const { t } = useLanguage()

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t.student.classes.viewBannedClasses.title}
            description={t.student.classes.viewBannedClasses.description}
            contentClassName="w-[98vw] sm:max-w-4xl"
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
                        <TableHead className="text-center">{t.student.classes.viewBannedClasses.columnClassName}</TableHead>
                        <TableHead className="text-center">{t.student.classes.viewBannedClasses.columnTeacherName}</TableHead>
                        <TableHead className="text-center">{t.student.classes.viewBannedClasses.columnClassCode}</TableHead>
                        <TableHead className="text-center">{t.student.classes.viewBannedClasses.columnBannedDate}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground">
                                {t.common.loading}
                            </TableCell>
                        </TableRow>
                    ) : classes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground">
                                {t.student.classes.viewBannedClasses.noData}
                            </TableCell>
                        </TableRow>
                    ) : (
                        classes.map(classItem => (
                            <TableRow key={classItem.id}>
                                <TableCell className="font-medium text-center">
                                    {classItem.name}
                                </TableCell>
                                <TableCell className="text-center">{getTeacherLabel(classItem)}</TableCell>
                                <TableCell className="font-mono text-sm font-semibold text-center">
                                    {classItem.classCode}
                                </TableCell>
                                <TableCell className="text-center">
                                    {dateTimeFormat(classItem.classMembers?.find(member => member.isBanned)?.bannedAt || '')}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ModalWrapper>
    )
}

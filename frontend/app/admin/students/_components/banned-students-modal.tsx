'use client'

import { useCallback, useEffect, useState } from 'react'
import { RotateCcw, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Input } from '@/components/ui/input'
import { PageSizeSelect } from '@/components/page-size-select'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/components/language-provider'
import { dateFormat } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getAllBannedStudentsByClassId, toggleBanStudentInClass } from '@/services/teacher/students'
import { ClassMember } from '@/lib/types'
import { getStudentBannedStatusColor } from '@/lib/color-mappers/student-banned-status-mapper'
import { getStudentBannedStatusLabel } from '@/lib/language-mappers/student-banned-status-mapper'

interface BannedStudentsModalProps {
    isOpen: boolean
    onClose: () => void
    classId: string
    className: string
    accessToken: string
}

export function BannedStudentsModal({
    isOpen,
    onClose,
    classId,
    className,
    accessToken,
}: BannedStudentsModalProps) {
    const { t, language } = useLanguage()
    const [students, setStudents] = useState<ClassMember[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isPaging, setIsPaging] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [updatingStudentIds, setUpdatingStudentIds] = useState<Record<string, boolean>>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [sortField, setSortField] = useState<'name' | 'email' | 'phone' | 'status' | 'date'>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const fetchStudents = useCallback(async () => {
        if (!accessToken || !classId) return

        setIsLoading(true)
        setIsPaging(true)
        try {
            const resp = await getAllBannedStudentsByClassId(accessToken, classId, currentPage, pageSize)

            setTotalItems((resp as any)?.pagination?.totalItems ?? 0)
            setHasNextPage(Boolean((resp as any)?.pagination?.hasNextPage))
            setHasPrevPage(Boolean((resp as any)?.pagination?.hasPrevPage))

            setStudents((resp as any)?.classMembers ?? [])
        } catch (error) {
            toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error })
            setStudents([])
            setTotalItems(0)
            setHasNextPage(false)
            setHasPrevPage(false)
        } finally {
            setIsLoading(false)
            setIsPaging(false)
        }
    }, [accessToken, classId, currentPage, language, pageSize])

    useEffect(() => {
        if (isOpen && classId) {
            void fetchStudents()
        }
    }, [isOpen, classId, fetchStudents])

    const handleNextPage = () => {
        if (!hasNextPage || isPaging) return
        setCurrentPage((page) => page + 1)
    }

    const handlePrevPage = () => {
        if (!hasPrevPage || isPaging) return
        setCurrentPage((page) => Math.max(1, page - 1))
    }

    const handlePageSizeChange = (nextValue: number) => {
        if (nextValue === pageSize) return
        setCurrentPage(1)
        setPageSize(nextValue)
    }

    const handleToggleBanStudent = async (student: ClassMember) => {
        if (!student.student?.id || !classId || !accessToken) return

        setUpdatingStudentIds((prev) => ({ ...prev, [student.id]: true }))

        try {
            await toggleBanStudentInClass(accessToken, classId, student.student.id)
            toast.success(getToastMessage('removeStudentSuccess', language), { className: TOAST_COLORS.success })
            await fetchStudents()
        } catch (error) {
            toast.error(getToastMessage('removeStudentFailed', language), { className: TOAST_COLORS.error })
        } finally {
            setUpdatingStudentIds((prev) => {
                const next = { ...prev }
                delete next[student.id]
                return next
            })
        }
    }

    const handleSort = (field: 'name' | 'email' | 'phone' | 'status' | 'date') => {
        if (sortField === field) {
            setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open) onClose() }}
            title={t.admin.studentManagement.bannedStudentList.title}
            description={t.admin.studentManagement.bannedStudentList.description + className}
            contentClassName="w-[98vw] sm:max-w-4xl"
        >
            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            value={searchInput}
                            onChange={(event) => {
                                setSearchInput(event.target.value)
                                setSearchQuery(event.target.value)
                            }}
                            className="pl-9"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldFullName}
                                            {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer hover:bg-muted" onClick={() => handleSort('email')}>
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldEmail}
                                            {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer hover:bg-muted" onClick={() => handleSort('phone')}>
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldPhoneNumber}
                                            {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer hover:bg-muted" onClick={() => handleSort('status')}>
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldBannedStatus}
                                            {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer hover:bg-muted" onClick={() => handleSort('date')}>
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldBannedDate}
                                            {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldActions}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium text-center">
                                                {student.student?.profile?.firstName} {student.student?.profile?.lastName}
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {student.student?.email}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.student?.profile?.phoneNumber || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`rounded px-2 py-1 text-xs font-medium ${getStudentBannedStatusColor(student.isBanned)}`}>
                                                    {getStudentBannedStatusLabel(student.isBanned, language)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {dateFormat(student.bannedAt || '')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => void handleToggleBanStudent(student)}
                                                    disabled={Boolean(updatingStudentIds[student.id])}
                                                >
                                                    {updatingStudentIds[student.id] ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RotateCcw className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                {t.common.pagination.total} {totalItems}
                            </p>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={!hasPrevPage || isPaging} onClick={handlePrevPage}>
                                    {t.common.pagination.previous}
                                </Button>

                                <Button variant="outline" size="sm" disabled={!hasNextPage || isPaging} onClick={handleNextPage}>
                                    {t.common.pagination.next}
                                </Button>
                            </div>

                            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} options={[10, 20, 25, 50]} disabled={isPaging} />
                        </div>
                    </>
                )}
            </div>
        </ModalWrapper>
    )
}
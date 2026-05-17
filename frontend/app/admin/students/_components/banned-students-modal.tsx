'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RotateCcw, Search, Loader2, LockOpen, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Input } from '@/components/ui/input'
import { PageSizeSelect } from '@/components/page-size-select'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

type StudentSortValue = 'name-asc' | 'name-desc' | 'email-asc' | 'email-desc' | 'phone-asc' | 'phone-desc' | 'status-asc' | 'status-desc' | 'date-asc' | 'date-desc'

const STUDENT_SORT_OPTIONS: Array<{ value: StudentSortValue; label: string }> = [
    { value: 'name-asc', label: 'Tên (A-Z)' },
    { value: 'name-desc', label: 'Tên (Z-A)' },
    { value: 'email-asc', label: 'Email (A-Z)' },
    { value: 'email-desc', label: 'Email (Z-A)' },
    { value: 'phone-asc', label: 'Số điện thoại (A-Z)' },
    { value: 'phone-desc', label: 'Số điện thoại (Z-A)' },
    { value: 'status-asc', label: 'Trạng thái khóa (Từ thấp đến cao)' },
    { value: 'status-desc', label: 'Trạng thái khóa (Từ cao đến thấp)' },
    { value: 'date-asc', label: 'Ngày khóa (Cũ nhất)' },
    { value: 'date-desc', label: 'Ngày khóa (Mới nhất)' },
]

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
    const [searchInput, setSearchInput] = useState('')
    const [sortValue, setSortValue] = useState<StudentSortValue>('name-asc')

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

    const displayedStudents = useMemo(() => {
        const normalizedQuery = searchInput.trim().toLowerCase()

        const filteredStudents = students.filter((student) => {
            if (!normalizedQuery) return true

            const fullName = `${student.student?.profile?.firstName ?? ''} ${student.student?.profile?.lastName ?? ''}`.trim().toLowerCase()
            const email = (student.student?.email ?? '').toLowerCase()
            const phone = (student.student?.profile?.phoneNumber ?? '').toLowerCase()

            return fullName.includes(normalizedQuery) || email.includes(normalizedQuery) || phone.includes(normalizedQuery)
        })

        const activeSort = STUDENT_SORT_OPTIONS.find((option) => option.value === sortValue) ?? STUDENT_SORT_OPTIONS[0]
        const directionMultiplier = activeSort.value.endsWith('desc') ? -1 : 1

        return [...filteredStudents].sort((leftStudent, rightStudent) => {
            const leftName = `${leftStudent.student?.profile?.firstName ?? ''} ${leftStudent.student?.profile?.lastName ?? ''}`.trim()
            const rightName = `${rightStudent.student?.profile?.firstName ?? ''} ${rightStudent.student?.profile?.lastName ?? ''}`.trim()
            const leftEmail = leftStudent.student?.email ?? ''
            const rightEmail = rightStudent.student?.email ?? ''
            const leftPhone = leftStudent.student?.profile?.phoneNumber ?? ''
            const rightPhone = rightStudent.student?.profile?.phoneNumber ?? ''
            const leftBannedAt = new Date(leftStudent.bannedAt || 0).getTime()
            const rightBannedAt = new Date(rightStudent.bannedAt || 0).getTime()

            let comparison = 0

            switch (activeSort.value) {
                case 'name-asc':
                case 'name-desc':
                    comparison = leftName.localeCompare(rightName, 'vi', { sensitivity: 'base' })
                    break
                case 'email-asc':
                case 'email-desc':
                    comparison = leftEmail.localeCompare(rightEmail, 'vi', { sensitivity: 'base' })
                    break
                case 'phone-asc':
                case 'phone-desc':
                    comparison = leftPhone.localeCompare(rightPhone, 'vi', { sensitivity: 'base' })
                    break
                case 'status-asc':
                case 'status-desc':
                    comparison = Number(leftStudent.isBanned) - Number(rightStudent.isBanned)
                    break
                case 'date-asc':
                case 'date-desc':
                    comparison = leftBannedAt - rightBannedAt
                    break
                default:
                    comparison = 0
            }

            return comparison * directionMultiplier
        })
    }, [searchInput, sortValue, students])

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open) onClose() }}
            title={t.admin.studentManagement.bannedStudentList.title}
            description={t.admin.studentManagement.bannedStudentList.description + className}
            contentClassName="w-[98vw] sm:max-w-4xl"
        >
            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            value={searchInput}
                            onChange={(event) => {
                                setSearchInput(event.target.value)
                            }}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sắp xếp theo:</span>
                        <Select value={sortValue} onValueChange={(value) => setSortValue(value as StudentSortValue)}>
                            <SelectTrigger className="w-full sm:w-64">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                {STUDENT_SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldFullName}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldEmail}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldPhoneNumber}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldBannedStatus}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldBannedDate}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.admin.studentManagement.bannedStudentList.tableView.fieldActions}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayedStudents.map((student) => (
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
                                                    variant={student.isBanned ? 'outline' : 'destructive'}
                                                    size="icon"
                                                    onClick={() => void handleToggleBanStudent(student)}
                                                    disabled={Boolean(updatingStudentIds[student.id])}
                                                >
                                                    {updatingStudentIds[student.id] ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : student.isBanned ? (
                                                        <LockOpen className="h-4 w-4" />
                                                    ) : (
                                                        <Lock className="h-4 w-4" />
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
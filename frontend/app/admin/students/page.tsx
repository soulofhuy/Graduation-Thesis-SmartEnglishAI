'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageSizeSelect } from '@/components/page-size-select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Loader2, Edit3, Power, Pencil, Ban, CheckCircle } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
    getAllClasses,
    toggleClassStatus,
    type Class,
    type GetAllClassesResponse,
} from '@/services/admin/class-management'
import { dateFormat } from '@/lib/format'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getActiveStatusLabel } from '@/lib/language-mappers/active-deactive-mapper'
import { getActiveStatusColor } from '@/lib/color-mappers/active-deactive-mapper'

export default function AdminClassesPage() {
    const { t, language } = useLanguage()
    const [isMounted, setIsMounted] = useState(false)
    const [classes, setClasses] = useState<Class[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPaging, setIsPaging] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [sortField, setSortField] = useState<'name' | 'students' | 'assignments' | 'pending'>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [response, setResponse] = useState<GetAllClassesResponse | null>(null)

    const { accessToken, isHydrated } = useAuth()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const fetchClasses = useCallback(
        async (page: number, limit: number, showSkeleton = false) => {
            if (!accessToken) {
                setClasses([])
                setResponse(null)
                setTotalItems(0)
                setHasNextPage(false)
                setHasPrevPage(false)
                setIsLoading(false)
                setIsPaging(false)
                return
            }

            if (showSkeleton) {
                setIsLoading(true)
            } else {
                setIsPaging(true)
            }

            try {
                const data = await getAllClasses(accessToken, page, limit)

                setResponse(data)
                setClasses(data.data ?? [])
                setCurrentPage(data.pagination?.currentPage ?? page)
                setTotalItems(data.pagination?.totalItems ?? 0)
                setHasNextPage(Boolean(data.pagination?.hasNextPage))
                setHasPrevPage(Boolean(data.pagination?.hasPreviousPage))
            } catch (error) {
                toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error })
                setClasses([])
            } finally {
                setIsLoading(false)
                setIsPaging(false)
            }
        },
        [accessToken, toast],
    )

    useEffect(() => {
        if (!isMounted || !isHydrated) return
        void fetchClasses(currentPage, pageSize, true)
    }, [isMounted, currentPage, fetchClasses, isHydrated, pageSize])

    const visibleClasses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        const filtered = classes.filter((classItem) => {
            if (!query) return true

            const name = classItem.name?.toLowerCase() ?? ''
            const classCode = classItem.classCode?.toLowerCase() ?? ''
            const teacherFirst = classItem.teacher?.profile?.firstName?.toLowerCase() ?? ''
            const teacherLast = classItem.teacher?.profile?.lastName?.toLowerCase() ?? ''

            return (
                name.includes(query) ||
                classCode.includes(query) ||
                teacherFirst.includes(query) ||
                teacherLast.includes(query)
            )
        })

        const directionFactor = sortDirection === 'asc' ? 1 : -1

        return [...filtered].sort((left, right) => {
            let comparison = 0

            if (sortField === 'students') {
                const leftCount = (left.approvedStudentCount ?? (left as any).approvedStudentsCount ?? 0)
                const rightCount = (right.approvedStudentCount ?? (right as any).approvedStudentsCount ?? 0)
                comparison = leftCount - rightCount
            } else if (sortField === 'assignments') {
                comparison = (left.assignmentCount ?? 0) - (right.assignmentCount ?? 0)
            } else if (sortField === 'pending') {
                const leftPending = ((left as any).pendingRequestCount ?? 0)
                const rightPending = ((right as any).pendingRequestCount ?? 0)
                comparison = leftPending - rightPending
            } else {
                comparison = (left.name ?? '').localeCompare(right.name ?? '', language === 'vi' ? 'vi' : 'en', {
                    sensitivity: 'base',
                })
            }

            if (comparison === 0) {
                comparison = (left.name ?? '').localeCompare(right.name ?? '', language === 'vi' ? 'vi' : 'en', {
                    sensitivity: 'base',
                })
            }

            return comparison * directionFactor
        })
    }, [classes, language, searchQuery, sortDirection, sortField])

    const getTeacherName = (classItem: Class) => {
        const firstName = classItem.teacher?.profile?.firstName || ''
        const lastName = classItem.teacher?.profile?.lastName || ''

        return `${firstName} ${lastName}`.trim() || classItem.teacher?.email || 'N/A'
    }

    const handleNextPage = () => {
        if (!hasNextPage || isPaging) return
        setCurrentPage((prev) => prev + 1)
    }

    const handlePrevPage = () => {
        if (!hasPrevPage || isPaging) return
        setCurrentPage((prev) => Math.max(1, prev - 1))
    }

    const handlePageSizeChange = (nextValue: number) => {
        if (nextValue === pageSize) return
        setCurrentPage(1)
        setPageSize(nextValue)
    }

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Quản lý danh sách học sinh
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        ....
                    </p>
                </div>
            </div>

            {/* Classes Table */}
            <Card>
                <CardHeader className="mb-3">
                    <CardTitle>{t.admin.classManagement.tableView.title}</CardTitle>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : visibleClasses.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            {searchQuery
                                ? 'Không tìm thấy lớp học phù hợp'
                                : 'Không có lớp học nào'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldClassName}</TableHead>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldClassCode}</TableHead>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldTeacherName}</TableHead>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldStudentCount}</TableHead>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldStatus}</TableHead>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldDatedCreated}</TableHead>
                                        <TableHead className="text-center">{t.admin.classManagement.tableView.fieldActions}</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {visibleClasses.map((classItem: Class) => (
                                        <TableRow key={classItem.id}>
                                            <TableCell className="font-medium text-center">
                                                {classItem.name}
                                            </TableCell>

                                            <TableCell className="text-sm text-muted-foreground text-center">
                                                {classItem.classCode}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                {getTeacherName(classItem)}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                {classItem.studentCount}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <span className={`rounded px-2 py-1 text-xs font-medium ${getActiveStatusColor(classItem.isActive)}`}>
                                                    {getActiveStatusLabel(classItem.isActive, language)}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-sm text-muted-foreground text-center">
                                                {dateFormat(classItem.createdAt)}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    {/* <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenUpdateModal(classItem)}
                                                        disabled={processingClassId === classItem.id || isLoading}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant={classItem.isActive ? 'destructive' : 'secondary'}
                                                        size="sm"
                                                        onClick={() => void handleToggleClassStatus(classItem)}
                                                        disabled={processingClassId === classItem.id || isLoading}
                                                    >
                                                        {classItem.isActive ? (
                                                            <Ban className="w-4 h-4" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </Button> */}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            {t.common.pagination.total} {totalItems}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!hasPrevPage || isPaging}
                                onClick={handlePrevPage}
                            >
                                {t.common.pagination.previous}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!hasNextPage || isPaging}
                                onClick={handleNextPage}
                            >
                                {t.common.pagination.next}
                            </Button>
                        </div>

                        <PageSizeSelect
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            options={[10, 20, 25, 50]}
                            disabled={isPaging}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
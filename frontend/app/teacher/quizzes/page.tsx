'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Sparkles, Edit, CheckSquare2Icon, XSquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { PageSizeSelect } from '@/components/page-size-select'
import { useAuth } from '@/components/auth-provider'
import { dateFormat } from '@/lib/format'
import type { Assignment } from '@/lib/types'
import {
    getAssignmentsCreatedByMe,
    toggleAssignmentActiveStatus
} from '@/services/teacher/assignments'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

interface TableAssignment {
    id: string
    title: string
    description?: string
    questionCount: number
    createdDate: string
    dueDate: string
    isPublic?: boolean
    isSingleAttempt?: boolean
    canViewResult?: boolean
    isActive?: boolean
}

const mapAssignmentToTableAssignment = (assignment: Assignment): TableAssignment => {
    const tasks = assignment.tasks ?? []
    const questionCount = tasks.reduce((total, task) => {
        return total + (task.questions?.length ?? 0)
    }, 0)

    return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description ?? '',
        questionCount,
        createdDate: assignment.createdAt ? dateFormat(assignment.createdAt) : '-',
        dueDate: assignment.dueDate ? dateFormat(assignment.dueDate) : '-',
        isPublic: assignment.isPublic,
        isSingleAttempt: assignment.isSingleAttempt,
        canViewResult: assignment.canViewResult,
        isActive: assignment.isActive,
    }
}

export default function TeacherQuizzesPage() {
    const { t, language } = useLanguage()
    const { accessToken, isHydrated } = useAuth()

    const [assignments, setAssignments] = useState<TableAssignment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPaging, setIsPaging] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)
    const [togglingAssignmentId, setTogglingAssignmentId] = useState<string | null>(null)

    const fetchQuizzes = useCallback(
        async (page: number, limit: number, showSkeleton = false) => {
            if (!accessToken) {
                setAssignments([])
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
                const response = await getAssignmentsCreatedByMe(accessToken, page, limit)
                setAssignments((response.data ?? []).map(mapAssignmentToTableAssignment))
                setCurrentPage(response.pagination.page)
                setTotalItems(response.pagination.totalItems)
                setHasNextPage(Boolean(response.pagination.hasNextPage))
                setHasPrevPage(Boolean(response.pagination.hasPrevPage))
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : getToastMessage('loginFailed', language)
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setIsLoading(false)
                setIsPaging(false)
            }
        },
        [accessToken]
    )

    useEffect(() => {
        if (!isHydrated) {
            return
        }

        void fetchQuizzes(currentPage, pageSize, true)
    }, [currentPage, fetchQuizzes, isHydrated, pageSize])

    const handleNextPage = () => {
        if (!hasNextPage || isPaging) {
            return
        }
        setCurrentPage((prev) => prev + 1)
    }

    const handlePrevPage = () => {
        if (!hasPrevPage || isPaging) {
            return
        }
        setCurrentPage((prev) => Math.max(1, prev - 1))
    }

    const handlePageSizeChange = (nextValue: number) => {
        if (nextValue === pageSize) {
            return
        }
        setCurrentPage(1)
        setPageSize(nextValue)
    }

    const handleToggleAssignmentStatus = async (assignmentId: string) => {
        if (!accessToken || togglingAssignmentId) {
            return
        }

        setTogglingAssignmentId(assignmentId)
        try {
            const response = await toggleAssignmentActiveStatus(accessToken, assignmentId)
            setAssignments((prev) =>
                prev.map((assignment) =>
                    assignment.id === assignmentId
                        ? { ...assignment, isActive: response.assignment.isActive }
                        : assignment
                )
            )
            toast.success(response.message || 'Cap nhat trang thai bai tap thanh cong')
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Khong the cap nhat trang thai bai tap'
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setTogglingAssignmentId(null)
        }
    }

    const renderPagination = () => (
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
    )

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">{t.teacher.assignments.overview.title}</h1>
                    <p className="text-muted-foreground">
                        {t.teacher.assignments.overview.description}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t.teacher.assignments.overview.createAssignmentByAIButton}
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/teacher/quizzes/create">
                            <Plus className="w-4 h-4" />
                            {t.teacher.assignments.overview.createAssignmentManuallyButton}
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
                <CardHeader>
                    <CardTitle className="bg-gradient-text">{t.teacher.assignments.overview.tableView.title}</CardTitle>
                    <CardDescription>{t.teacher.assignments.overview.tableView.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 text-center text-muted-foreground">{t.common.loading}</div>
                    ) : assignments.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">{t.common.noData}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnTitle}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnDescription}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnNumberOfQuestions}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnCreatedDate}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnDueDate}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnIsPublic}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnIsActive}</TableHead>
                                        <TableHead className="text-center">{t.teacher.assignments.overview.tableView.columnActions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium text-center">{assignment.title}</TableCell>
                                            <TableCell className="text-center">{assignment.description || '-'}</TableCell>
                                            <TableCell className="text-center">{assignment.questionCount}</TableCell>
                                            <TableCell className="text-center">{assignment.createdDate}</TableCell>
                                            <TableCell className="text-center">{assignment.dueDate}</TableCell>
                                            <TableCell className="flex justify-center items-center">{assignment.isPublic ? <CheckSquare2Icon className="text-green-500" /> : <XSquareIcon className="text-red-500" />}</TableCell>
                                            <TableCell className="text-center">{assignment.isActive ? t.common.active : t.common.inactive}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/teacher/quizzes/edit/${assignment.id}`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleAssignmentStatus(assignment.id)}
                                                    disabled={Boolean(togglingAssignmentId)}
                                                    title={assignment.isActive ? 'Vo hieu hoa bai tap' : 'Kich hoat bai tap'}
                                                >
                                                    {assignment.isActive ? (
                                                        <XSquareIcon className="w-4 h-4 text-destructive" />
                                                    ) : (
                                                        <CheckSquare2Icon className="w-4 h-4 text-green-600" />
                                                    )}
                                                </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {renderPagination()}
                </CardContent>
            </Card>
        </div>
    )
}

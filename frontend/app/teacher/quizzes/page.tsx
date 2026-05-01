'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Sparkles, Edit, CheckSquare2Icon, XSquareIcon, Check, X, Search } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
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
    title?: string
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
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<'title' | 'questionCount' | 'createdDate' | 'dueDate'>('title')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

    const handleSearchSubmit = () => {
        setSearchQuery(searchInput.trim())
    }

    const clearSearch = () => {
        setSearchInput('')
        setSearchQuery('')
    }

    const filteredAndSortedAssignments = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const filtered = assignments.filter((assignment) => {
            if (!query) {
                return true
            }

            const title = assignment.title?.toLowerCase() ?? ''
            return title.includes(query)
        })

        const directionFactor = sortDirection === 'asc' ? 1 : -1

        return [...filtered].sort((left, right) => {
            let comparison = 0

            if (sortField === 'questionCount') {
                comparison = left.questionCount - right.questionCount
            } else if (sortField === 'createdDate') {
                comparison = new Date(left.createdDate).getTime() - new Date(right.createdDate).getTime()
            } else if (sortField === 'dueDate') {
                comparison = new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
            } else {
                comparison = (left.title ?? '').localeCompare(right.title ?? '', language === 'vi' ? 'vi' : 'en', {
                    sensitivity: 'base'
                })
            }

            if (comparison === 0) {
                comparison = (left.title ?? '').localeCompare(right.title ?? '', language === 'vi' ? 'vi' : 'en', {
                    sensitivity: 'base'
                })
            }

            return comparison * directionFactor
        })
    }, [assignments, language, searchQuery, sortDirection, sortField])

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

            <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
                <CardContent>
                    <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] md:justify-items-center">
                        <div className="w-full max-w-md mx-auto">
                            <div className="flex justify-center mb-3">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold dark:border-white">
                                    Tìm kiếm
                                </label>
                            </div>

                            <form
                                className="flex flex-col items-center gap-3 md:max-w-md"
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    handleSearchSubmit()
                                }}
                            >
                                <div className="relative w-full max-w-sm">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder="Tìm kiếm theo tiêu đề bài tập"
                                        className="h-11 w-full rounded-full pl-10 pr-4"
                                    />
                                </div>

                                <div className="flex justify-center gap-2">
                                    <Button type="submit" className="rounded-full px-5">
                                        Tìm kiếm
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full px-5"
                                        onClick={clearSearch}
                                    >
                                        Đặt lại
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="w-full max-w-3xl mx-auto">
                            <div className="flex justify-center mb-3">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold dark:border-white">
                                    Sắp xếp theo
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant={sortField === 'title' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('title')}
                                    >
                                        Tiêu đề
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={sortField === 'questionCount' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('questionCount')}
                                    >
                                        Số câu hỏi
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={sortField === 'createdDate' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('createdDate')}
                                    >
                                        Ngày tạo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={sortField === 'dueDate' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('dueDate')}
                                    >
                                        Ngày hạn
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-center mt-3 mb-3">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold dark:border-white">
                                    Thứ tự
                                </label>
                            </div>

                            <div className="space-y-2 text-center">
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant={sortDirection === 'asc' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortDirection('asc')}
                                    >
                                        Tăng dần
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={sortDirection === 'desc' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortDirection('desc')}
                                    >
                                        Giảm dần
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
                <CardHeader>
                    <CardTitle className="bg-gradient-text">{t.teacher.assignments.overview.tableView.title}</CardTitle>
                    <CardDescription>{t.teacher.assignments.overview.tableView.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 text-center text-muted-foreground">{t.common.loading}</div>
                    ) : filteredAndSortedAssignments.length === 0 ? (
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
                                    {filteredAndSortedAssignments.map((assignment: TableAssignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium text-center">{assignment.title}</TableCell>
                                            <TableCell className="text-center">{assignment.description || '-'}</TableCell>
                                            <TableCell className="text-center">{assignment.questionCount}</TableCell>
                                            <TableCell className="text-center">{assignment.createdDate}</TableCell>
                                            <TableCell className="text-center">{assignment.dueDate}</TableCell>
                                            <TableCell className="flex justify-center items-center">{assignment.isPublic ? <Check className="h-8 w-8 text-green-500" /> : <X className="h-8 w-8 text-red-500" />}</TableCell>
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
                                                            <X className="w-8 h-8 text-destructive" />
                                                        ) : (
                                                            <Check className="w-8 h-8 text-green-600" />
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

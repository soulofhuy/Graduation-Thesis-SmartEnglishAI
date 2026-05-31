'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Check, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { getAssignmentsAssignedToMyClasses } from '@/services/student/assignments'
import { TablePagination } from '@/components/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { StudentAssignedAssignment } from '@/services/student/assignments'
import { dateTimeFormat } from '@/lib/format'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { useMemo } from 'react'

const SORT_FIELDS = ['title', 'className', 'questionCount', 'dueDate'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

type SortField = (typeof SORT_FIELDS)[number]
type SortDirection = (typeof SORT_DIRECTIONS)[number]

export default function StudentQuizPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [assignments, setAssignments] = useState<StudentAssignedAssignment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    const fetchAssignments = async () => {
      setIsLoadingAssignments(true)
      try {
        const response = await getAssignmentsAssignedToMyClasses(accessToken, currentPage, pageSize)
        setAssignments(response.data)
        setTotalItems(response.pagination.totalItems)
        setTotalPages(response.pagination.totalPages)
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoadingAssignments(false)
      }
    }

    void fetchAssignments()
  }, [accessToken, isHydrated, currentPage, pageSize])

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = assignments.filter((assignment) => {
      if (!query) {
        return true
      }

      const title = assignment.title?.toLowerCase() ?? ''
      const className = assignment.class?.name?.toLowerCase() ?? ''

      return title.includes(query) || className.includes(query)
    })

    const directionFactor = sortDirection === 'asc' ? 1 : -1

    return [...filtered].sort((left, right) => {
      let comparison = 0

      if (sortField === 'questionCount') {
        comparison = (left._count?.tasks ?? 0) - (right._count?.tasks ?? 0)
      } else if (sortField === 'className') {
        comparison = (left.class?.name ?? '').localeCompare(right.class?.name ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base'
        })
      } else if (sortField === 'dueDate') {
        const leftDate = new Date(left.dueDate ?? 0).getTime()
        const rightDate = new Date(right.dueDate ?? 0).getTime()
        comparison = leftDate - rightDate
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

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(1, prevPage - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }

  const getAttemptStatusBadge = (assignment: StudentAssignedAssignment) => {
    const attemptSummary = assignment.attemptSummary

    if (!attemptSummary) {
      return <Badge variant="secondary">{t.student.assignments.overview.tableView.statusAssigned}</Badge>
    }

    if (attemptSummary.status === 'SUBMITTED') {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {t.student.assignments.overview.tableView.statusSubmitted}
        </Badge>
      )
    }

    if (attemptSummary.status === 'IN_PROGRESS') {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          {t.student.assignments.overview.tableView.statusInProgress}
        </Badge>
      )
    }

    return null
  }

  const getAttemptResult = (assignment: StudentAssignedAssignment) => {
    const attemptSummary = assignment.attemptSummary

    if (
      attemptSummary?.status === 'SUBMITTED' &&
      attemptSummary.correctCount !== undefined &&
      attemptSummary.totalCount !== undefined
    ) {
      return t.student.assignments.overview.tableView.scoreFormat
        .replace('{{correctCount}}', String(attemptSummary.correctCount))
        .replace('{{totalCount}}', String(attemptSummary.totalCount))
    }

    return '-'
  }

  const getActionLabel = (assignment: StudentAssignedAssignment) => {
    if (assignment.attemptSummary?.status === 'IN_PROGRESS') {
      return t.student.assignments.overview.tableView.columnContinueAssignmentButton
    }

    if (
      assignment.attemptSummary?.status === 'SUBMITTED' &&
      assignment.isSingleAttempt
    ) {
      return t.student.assignments.overview.tableView.columnSubmittedAssignmentButton
    }

    return t.student.assignments.overview.tableView.columnDoAssignmentButton
  }

  const handleActionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    assignment: StudentAssignedAssignment
  ) => {
    const isSubmittedSingleAttempt =
      assignment.attemptSummary?.status === 'SUBMITTED' && assignment.isSingleAttempt

    if (!isSubmittedSingleAttempt) {
      return
    }

    event.preventDefault()
    toast.error(t.student.assignments.overview.tableView.singleAttemptWarning)
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t.student.assignments.overview.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.student.assignments.overview.description}
        </p>
      </div>

      <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardContent>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] md:justify-items-center">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.assignments.overview.searchOrSortOrFilter.search.title}
                </label>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSearchSubmit()
                }}
                className="flex flex-col items-center gap-3 md:max-w-md"
              >
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={t.student.assignments.overview.searchOrSortOrFilter.search.searchFieldPlaceholder}
                    className="h-11 w-full rounded-full pl-10 pr-4"
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <Button type="submit" className="rounded-full px-5">
                    {t.student.assignments.overview.searchOrSortOrFilter.search.searchButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-5"
                    onClick={clearSearch}
                  >
                    {t.student.assignments.overview.searchOrSortOrFilter.search.resetButton}
                  </Button>
                </div>
              </form>
            </div>

            <div className="w-full max-w-3xl mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.assignments.overview.searchOrSortOrFilter.sort.sortItems.title}
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {SORT_FIELDS.map((field) => (
                    <Button
                      key={field}
                      type="button"
                      variant={sortField === field ? 'default' : 'outline'}
                      className="rounded-full px-3 py-1"
                      onClick={() => setSortField(field)}
                    >
                      {field === 'title' && t.student.assignments.overview.searchOrSortOrFilter.sort.sortItems.fieldAssignmentTitle}
                      {field === 'className' && t.student.assignments.overview.searchOrSortOrFilter.sort.sortItems.fieldClassName}
                      {field === 'questionCount' && t.student.assignments.overview.searchOrSortOrFilter.sort.sortItems.fieldQuestionCount}
                      {field === 'dueDate' && t.student.assignments.overview.searchOrSortOrFilter.sort.sortItems.fieldDueDate}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-3 mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.assignments.overview.searchOrSortOrFilter.sort.order.title}
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
                    {t.student.assignments.overview.searchOrSortOrFilter.sort.order.asc}
                  </Button>
                  <Button
                    type="button"
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortDirection('desc')}
                  >
                    {t.student.assignments.overview.searchOrSortOrFilter.sort.order.desc}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t.student.assignments.overview.tableView.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAssignments ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.common.loading}</p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[320px] text-center">{t.student.assignments.overview.tableView.columnAssignmentTitle}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnClass}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnNumberOfQuestions}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnIsSingleAttempt}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnDueDate}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnStatus}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnResult}</TableHead>
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => {
                    const isSubmittedSingleAttempt =
                      assignment.attemptSummary?.status === 'SUBMITTED' && assignment.isSingleAttempt
                    const actionLabel = getActionLabel(assignment)

                    return (
                      <TableRow key={assignment.id} className="text-center">
                        <TableCell className="font-medium whitespace-normal">
                          {assignment.title}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {assignment.class?.name}
                        </TableCell>
                        <TableCell>{assignment._count?.tasks ?? 0} câu</TableCell>
                        <TableCell className="flex items-center justify-center">
                          {!assignment.isSingleAttempt ? (
                            <Check className="h-8 w-8 text-green-500" />
                          ) : (
                            <X className="h-8 w-8 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {dateTimeFormat(assignment.dueDate ?? '')}
                        </TableCell>
                        <TableCell>{getAttemptStatusBadge(assignment)}</TableCell>
                        <TableCell>{getAttemptResult(assignment)}</TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/student/quiz/${encodeURIComponent(assignment.id)}/take`}
                            aria-disabled={!assignment.id || isSubmittedSingleAttempt}
                            onClick={(event) => handleActionClick(event, assignment)}
                          >
                            <Button
                              size="sm"
                              className={`gap-2 ${isSubmittedSingleAttempt ? 'bg-green-500 hover:bg-green-600' : ''}`}
                              disabled={!assignment.id || isSubmittedSingleAttempt}
                            >
                              {isSubmittedSingleAttempt ? <Check className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                              {actionLabel}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <TablePagination
                totalItems={totalItems}
                hasPrevPage={currentPage > 1}
                hasNextPage={currentPage < totalPages}
                isPaging={isLoadingAssignments}
                pageSize={pageSize}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                onPageSizeChange={handlePageSizeChange}
                totalLabel={t.common.pagination.total}
                previousLabel={t.common.pagination.previous}
                nextLabel={t.common.pagination.next}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy bài tập nào
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

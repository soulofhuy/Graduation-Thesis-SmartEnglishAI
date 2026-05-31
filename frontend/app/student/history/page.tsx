'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Eye, Check, X, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { TablePagination } from '@/components/pagination'
import { dateTimeFormat } from '@/lib/format'
import {
  getAssignmentsHistoryOfStudent,
  type StudentAssignedAssignment,
} from '@/services/student/assignments'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/components/language-provider'
import { getDurationMinutes } from '@/lib/view-details-assignment-helpers/get-duration-minutes'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

const SORT_FIELDS = ['title', 'className', 'submittedAt', 'duration'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

type SortField = (typeof SORT_FIELDS)[number]
type SortDirection = (typeof SORT_DIRECTIONS)[number]

export default function StudentHistoryPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('submittedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [history, setHistory] = useState<StudentAssignedAssignment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await getAssignmentsHistoryOfStudent(
          accessToken,
          currentPage,
          pageSize
        )

        setHistory(response.data)
        setTotalItems(response.pagination.totalItems)
        setTotalPages(response.pagination.totalPages)
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoadingHistory(false)
      }
    }

    void fetchHistory()
  }, [accessToken, isHydrated, currentPage, pageSize])

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const getDurationInMinutes = (item: StudentAssignedAssignment) => {
    const startedAt = item.attemptSummary?.startedAt
    const submittedAt = item.attemptSummary?.submittedAt

    if (!startedAt || !submittedAt) {
      return 0
    }

    const start = new Date(startedAt).getTime()
    const end = new Date(submittedAt).getTime()

    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      return 0
    }

    return Math.round((end - start) / 60000)
  }

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = history.filter((item) => {
      if (!query) {
        return true
      }

      const title = item.title?.toLowerCase() ?? ''
      const className = item.class?.name?.toLowerCase() ?? ''

      return title.includes(query) || className.includes(query)
    })

    const directionFactor = sortDirection === 'asc' ? 1 : -1

    return [...filtered].sort((left, right) => {
      let comparison = 0

      if (sortField === 'className') {
        comparison = (left.class?.name ?? '').localeCompare(right.class?.name ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base'
        })
      } else if (sortField === 'submittedAt') {
        const leftTime = new Date(left.attemptSummary?.submittedAt ?? 0).getTime()
        const rightTime = new Date(right.attemptSummary?.submittedAt ?? 0).getTime()
        comparison = leftTime - rightTime
      } else if (sortField === 'duration') {
        comparison = getDurationInMinutes(left) - getDurationInMinutes(right)
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
  }, [history, language, searchQuery, sortDirection, sortField])

  const getScoreDisplay = (item: StudentAssignedAssignment) => {
    const attempt = item.attemptSummary

    if (
      attempt?.status === 'SUBMITTED' &&
      attempt.correctCount !== undefined &&
      attempt.totalCount !== undefined
    ) {
      return `${attempt.correctCount}/${attempt.totalCount}`
    }

    if (attempt?.score !== undefined) {
      return `${attempt.score}`
    }

    return '-'
  }

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

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.student.assignments.viewHistory.title}</h1>
        <p className="text-muted-foreground mt-1">
          {t.student.assignments.viewHistory.description}
        </p>
      </div>

      <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardContent>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] md:justify-items-center">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.assignments.viewHistory.searchOrSortOrFilter.search.title}
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
                    placeholder={t.student.assignments.viewHistory.searchPlaceholder}
                    className="h-11 w-full rounded-full pl-10 pr-4"
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <Button type="submit" className="rounded-full px-5">
                    {t.student.assignments.viewHistory.searchOrSortOrFilter.search.searchButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-5"
                    onClick={clearSearch}
                  >
                    {t.student.assignments.viewHistory.searchOrSortOrFilter.search.resetButton}
                  </Button>
                </div>
              </form>
            </div>

            <div className="w-full max-w-3xl mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.assignments.viewHistory.searchOrSortOrFilter.sort.sortItems.title}
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
                      {field === 'title' && t.student.assignments.viewHistory.searchOrSortOrFilter.sort.sortItems.fieldAssignmentTitle}
                      {field === 'className' && t.student.assignments.viewHistory.searchOrSortOrFilter.sort.sortItems.fieldClassName}
                      {field === 'submittedAt' && t.student.assignments.viewHistory.searchOrSortOrFilter.sort.sortItems.fieldSubmittedDate}
                      {field === 'duration' && t.student.assignments.viewHistory.searchOrSortOrFilter.sort.sortItems.fieldTotalTime}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-3 mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.assignments.viewHistory.searchOrSortOrFilter.sort.order.title}
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
                    {t.student.assignments.viewHistory.searchOrSortOrFilter.sort.order.asc}
                  </Button>
                  <Button
                    type="button"
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortDirection('desc')}
                  >
                    {t.student.assignments.viewHistory.searchOrSortOrFilter.sort.order.desc}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t.student.assignments.viewHistory.tableView.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.common.loading}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnAssignmentTitle}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnClass}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnIsSingleAttempt}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnResult}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnSubmittedAt}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnTotalTime}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnStatus}</TableHead>
                      <TableHead className="text-center">{t.student.assignments.viewHistory.tableView.columnActions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-center">
                            {item.title}
                          </TableCell>
                          <TableCell className="text-center">{item.class?.name ?? '-'}</TableCell>
                          <TableCell className="flex items-center justify-center">
                            {!item.isSingleAttempt ? (
                              <Check className="h-8 w-8 text-green-500" />
                            ) : (
                              <X className="h-8 w-8 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-primary">
                              {getScoreDisplay(item)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {dateTimeFormat(item.attemptSummary?.submittedAt ?? '')}
                          </TableCell>
                          <TableCell className="text-center">
                            {getDurationMinutes({
                              startedAt: item.attemptSummary?.startedAt,
                              submittedAt: item.attemptSummary?.submittedAt,
                              language
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              {t.common.submissionStatus.submitted}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Link href={`/student/history/${encodeURIComponent(item.id)}`}>
                              <Button variant="secondary" size="sm" className="gap-2" disabled={!item.id}>
                                <Eye className="w-4 h-4" />
                                {t.student.assignments.viewHistory.tableView.actionDescriptionViewDetails}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground">
                            Không tìm thấy bài tập nào
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <TablePagination
                totalItems={totalItems}
                hasPrevPage={currentPage > 1}
                hasNextPage={currentPage < totalPages}
                isPaging={isLoadingHistory}
                pageSize={pageSize}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                onPageSizeChange={handlePageSizeChange}
                totalLabel={t.common.pagination.total}
                previousLabel={t.common.pagination.previous}
                nextLabel={t.common.pagination.next}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

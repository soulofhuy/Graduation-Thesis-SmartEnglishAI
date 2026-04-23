'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Eye, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { PageSizeSelect } from '@/components/page-size-select'
import { dateTimeFormat } from '@/lib/format'
import {
  getAssignmentsHistoryOfStudent,
  type StudentAssignedAssignment,
} from '@/services/student/assignments'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/components/language-provider'

export default function StudentHistoryPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
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
        const message =
          error instanceof Error ? error.message : 'Khong the tai lich su bai tap'
        toast.error(message)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    void fetchHistory()
  }, [accessToken, isHydrated, currentPage, pageSize])

  const filteredHistory = history.filter((item) =>
    (item.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const getDurationMinutes = (item: StudentAssignedAssignment) => {
    const startedAt = item.attemptSummary?.startedAt
    const submittedAt = item.attemptSummary?.submittedAt

    if (!startedAt || !submittedAt) {
      return '-'
    }

    const startedAtMs = new Date(startedAt).getTime()
    const submittedAtMs = new Date(submittedAt).getTime()

    if (Number.isNaN(startedAtMs) || Number.isNaN(submittedAtMs)) {
      return '-'
    }

    const durationMinutes = Math.max(0, Math.round((submittedAtMs - startedAtMs) / 60000))
    return `${durationMinutes} phút`
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={t.student.assignments.viewHistory.searchPlaceholder}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* History Table */}
      <Card>
        <CardContent>
          {isLoadingHistory ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
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
                          <TableCell className="text-center">{getDurationMinutes(item)}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Đã nộp
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="gap-2" disabled>
                              <Eye className="w-4 h-4" />
                              Xem chi tiết
                            </Button>
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

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {t.common.pagination.total} {totalItems}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || isLoadingHistory}
                    onClick={handlePrevPage}
                  >
                    {t.common.pagination.previous}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || isLoadingHistory}
                    onClick={handleNextPage}
                  >
                    {t.common.pagination.next}
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <PageSizeSelect
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    options={[10, 20, 25, 50]}
                    disabled={isLoadingHistory}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

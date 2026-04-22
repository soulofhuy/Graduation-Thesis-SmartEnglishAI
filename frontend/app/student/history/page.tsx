'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Eye } from 'lucide-react'
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

export default function StudentHistoryPage() {
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
        <h1 className="text-3xl font-bold text-foreground">Lịch sử</h1>
        <p className="text-muted-foreground mt-1">
          Xem lại lịch sử các bài tập đã làm
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bài tập đã làm</CardTitle>
          <CardDescription>
            Danh sách tất cả các bài tập bạn đã hoàn thành
          </CardDescription>
        </CardHeader>
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
                      <TableHead>Tên bài tập</TableHead>
                      <TableHead>Lớp</TableHead>
                      <TableHead>Có thể làm nhiều lần</TableHead>
                      <TableHead>Điểm</TableHead>
                      <TableHead>Ngày làm</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.title}
                          </TableCell>
                          <TableCell>{item.class?.name ?? '-'}</TableCell>
                          <TableCell>
                            {item.isSingleAttempt ? 'Không' : 'Có'}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-primary">
                              {getScoreDisplay(item)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {dateTimeFormat(item.attemptSummary?.submittedAt ?? '')}
                          </TableCell>
                          <TableCell>{getDurationMinutes(item)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Đã nộp
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
                  Tổng: {totalItems}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || isLoadingHistory}
                    onClick={handlePrevPage}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || isLoadingHistory}
                    onClick={handleNextPage}
                  >
                    Sau
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

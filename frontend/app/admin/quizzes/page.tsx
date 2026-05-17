'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, BookOpen, Users, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageSizeSelect } from '@/components/page-size-select'
import { dateFormat } from '@/lib/format'
import type { Assignment } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getAllAssignments, type AdminAssignmentRow } from '@/services/admin/assignments'

interface TableAssignment {
  id: string
  title: string
  creatorName: string
  creatorEmail: string
  className: string
  classCode: string
  taskCount: number
  attemptCount: number
  isActive: boolean
  createdDate: string
  dueDate: string
}

const mapAssignmentToTableAssignment = (assignment: AdminAssignmentRow): TableAssignment => {
  const firstName = assignment.teacher?.firstName?.trim() ?? ''
  const lastName = assignment.teacher?.lastName?.trim() ?? ''
  const creatorName = [firstName, lastName].filter(Boolean).join(' ').trim() || assignment.teacher?.email || 'Không rõ'

  return {
    id: assignment.id,
    title: assignment.title ?? '',
    creatorName,
    creatorEmail: assignment.teacher?.email ?? '',
    className: assignment.classInfo?.name?.trim() ?? assignment.class?.name?.trim() ?? 'Chưa có tên lớp',
    classCode: assignment.classInfo?.classCode ?? assignment.class?.classCode ?? '-',
    taskCount: assignment.taskCount ?? (assignment.tasks?.length ?? 0),
    attemptCount: assignment.attemptCount ?? 0,
    isActive: Boolean(assignment.isActive),
    createdDate: assignment.createdAt ? dateFormat(assignment.createdAt) : '-',
    dueDate: assignment.dueDate ? dateFormat(assignment.dueDate) : '-'
  }
}

export default function AdminQuizzesPage() {
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
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAssignments = useCallback(
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
        const response = await getAllAssignments(accessToken, page, limit)
        setAssignments((response.data ?? []).map(mapAssignmentToTableAssignment))
        setCurrentPage(response.pagination.page)
        setTotalItems(response.pagination.totalItems)
        setHasNextPage(Boolean(response.pagination.hasNextPage))
        setHasPrevPage(Boolean(response.pagination.hasPrevPage))
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoading(false)
        setIsPaging(false)
      }
    },
    [accessToken, language]
  )

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    void fetchAssignments(currentPage, pageSize, true)
  }, [currentPage, fetchAssignments, isHydrated, pageSize])

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

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return assignments
    }

    return assignments.filter((assignment) => {
      return [
        assignment.title,
        assignment.creatorName,
        assignment.creatorEmail,
        assignment.className,
        assignment.classCode
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [assignments, searchQuery])

  const activeCount = assignments.filter((assignment) => assignment.isActive).length
  const inactiveCount = assignments.length - activeCount

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
          <h1 className="text-3xl font-bold text-foreground">Quản lí bài tập</h1>
          <p className="text-muted-foreground">
            Danh sách toàn bộ bài tập của tất cả giáo viên trong hệ thống.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-dashed bg-background/80">
            <CardContent className="flex items-center gap-3 p-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Tổng bài tập</p>
                <p className="text-lg font-semibold">{totalItems}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed bg-background/80">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Đang hoạt động</p>
                <p className="text-lg font-semibold">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed bg-background/80">
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-5 w-5 text-rose-600" />
              <div>
                <p className="text-xs text-muted-foreground">Tạm ngưng</p>
                <p className="text-lg font-semibold">{inactiveCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Danh sách bài tập</CardTitle>
            <CardDescription>
              Quản lý tập trung toàn bộ bài tập, tác giả, lớp học và trạng thái.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearchSubmit()
                  }
                }}
                placeholder="Tìm kiếm theo tiêu đề, giáo viên, lớp học..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSearchSubmit}>
                Tìm kiếm
              </Button>
              <Button variant="ghost" onClick={clearSearch}>
                Xóa lọc
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Số task</TableHead>
                  <TableHead>Lượt làm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="max-w-xs font-medium truncate">
                      {assignment.title}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{assignment.creatorName}</p>
                        <p className="text-xs text-muted-foreground">{assignment.creatorEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{assignment.className}</p>
                        <p className="text-xs text-muted-foreground">{assignment.classCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>{assignment.taskCount}</TableCell>
                    <TableCell>{assignment.attemptCount}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${assignment.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                      >
                        {assignment.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </TableCell>
                    <TableCell>{assignment.createdDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>
                        <Eye className="mr-2 h-4 w-4" />
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {renderPagination()}
        </CardContent>
      </Card>
    </div>
  )
}

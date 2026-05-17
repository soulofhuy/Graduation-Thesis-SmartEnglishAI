'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, BookOpen, Users, CheckCircle2, XCircle } from 'lucide-react'
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
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getAllAssignments, type AdminAssignmentRow } from '@/services/admin/assignments'
import { Badge } from '@/components/ui/badge'

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
  const visibleCount = filteredAssignments.length

  // const renderPagination = () => (
  //   <div className="mt-5 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
  //     <div className="space-y-1 text-sm text-muted-foreground">
  //       <p>
  //         Đang hiển thị {visibleCount} / {assignments.length} bài tập trên trang hiện tại
  //       </p>
  //       <p>Tổng số bài tập trong hệ thống: {totalItems}</p>
  //     </div>
  //     <div className="flex flex-wrap items-center gap-2">
  //       <Button
  //         variant="outline"
  //         size="sm"
  //         disabled={!hasPrevPage || isPaging}
  //         onClick={handlePrevPage}
  //       >
  //         {t.common.pagination.previous}
  //       </Button>
  //       <Button
  //         variant="outline"
  //         size="sm"
  //         disabled={!hasNextPage || isPaging}
  //         onClick={handleNextPage}
  //       >
  //         {t.common.pagination.next}
  //       </Button>
  //       <PageSizeSelect
  //         value={pageSize}
  //         onChange={handlePageSizeChange}
  //         options={[10, 20, 25, 50]}
  //         disabled={isPaging}
  //       />
  //     </div>
  //   </div>
  // )

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Quản lý bài tập</h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Danh sách toàn bộ bài tập trong hệ thống, xem nhanh giáo viên, lớp học, số task và trạng thái.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng bài tập</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-full bg-rose-500/10 p-3 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tạm ngưng</p>
              <p className="text-2xl font-bold">{inactiveCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-full bg-sky-500/10 p-3 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hiển thị</p>
              <p className="text-2xl font-bold">{visibleCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="mb-3">
          <CardTitle>Danh sách bài tập</CardTitle>
          <CardDescription>
            Giao diện quản lý tập trung, dễ scan, dễ lọc và không bị nhồi thông tin vào một cột.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center min-w-[220px]">Tiêu đề</TableHead>
                  <TableHead className="text-center min-w-[220px]">Giáo viên</TableHead>
                  <TableHead className="text-center min-w-[220px]">Lớp học</TableHead>
                  <TableHead className="text-center">Task</TableHead>
                  <TableHead className="text-center">Lượt làm</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center min-w-[140px]">Ngày tạo</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Không tìm thấy bài tập phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className="text-center">
                      <TableCell className="font-medium max-w-[260px]">
                        <div className="space-y-1">
                          <p className="truncate font-medium">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {assignment.id}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {assignment.creatorName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.creatorEmail || 'Chưa có email'}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {assignment.className}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.classCode}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {assignment.taskCount}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {assignment.attemptCount}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            assignment.isActive
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {assignment.isActive
                            ? 'Đang hoạt động'
                            : 'Tạm ngưng'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {assignment.createdDate}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* {renderPagination()} */}
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

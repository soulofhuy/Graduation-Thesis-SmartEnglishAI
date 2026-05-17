'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { dateFormat } from '@/lib/format'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getAllAssignments, type AdminAssignmentRow } from '@/services/admin/assignments'
import { Badge } from '@/components/ui/badge'
import { TablePagination } from '@/components/pagination'
import { getAssignmentActiveStatusLabel } from '@/lib/language-mappers/assignment-active-status-mapper'
import { getAssignmentActiveStatusColor } from '@/lib/color-mappers/assignment-active-status-mapper'

interface TableAssignment {
  id: string
  description?: string
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
    description: assignment.description ?? '',
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

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.admin.assignmentManagement.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.admin.assignmentManagement.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="mb-3">
          <CardTitle>{t.admin.assignmentManagement.tableView.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center min-w-[250px]">{t.admin.assignmentManagement.tableView.fieldTitle}</TableHead>
                  <TableHead className="text-center min-w-[220px]">{t.admin.assignmentManagement.tableView.fieldTeacherName}</TableHead>
                  <TableHead className="text-center min-w-[220px]">{t.admin.assignmentManagement.tableView.fieldClassName}</TableHead>
                  <TableHead className="text-center">{t.admin.assignmentManagement.tableView.fieldAssignmentStatus}</TableHead>
                  <TableHead className="text-center min-w-[140px]">{t.admin.assignmentManagement.tableView.fieldCreatedDate}</TableHead>
                  <TableHead className="text-center">{t.admin.assignmentManagement.tableView.fieldActions}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      {t.common.loading}
                    </TableCell>
                  </TableRow>
                ) : filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {t.common.noData}
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
                            {assignment.description}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {assignment.creatorName}
                      </TableCell>

                      <TableCell>
                        {assignment.className}
                      </TableCell>

                      <TableCell>
                        <span className={`rounded px-2 py-1 text-xs font-medium ${getAssignmentActiveStatusColor(assignment.isActive)}`}>
                          {getAssignmentActiveStatusLabel(assignment.isActive, language)}
                        </span>
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

          <TablePagination
            totalItems={totalItems}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            isPaging={isPaging}
            pageSize={pageSize}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onPageSizeChange={handlePageSizeChange}
            totalLabel={t.common.pagination.total}
            previousLabel={t.common.pagination.previous}
            nextLabel={t.common.pagination.next}
          />
        </CardContent>
      </Card>
    </div>
  )
}

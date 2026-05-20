'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PencilLine, Search, Trash2 } from 'lucide-react'
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
import { deleteAssignment, getAllAssignments, type AdminAssignmentRow } from '@/services/admin/assignments'
import ConfirmDialog from '@/components/confirm-dialog'
import ResultsFilters from './_component/ResultsFilters'
import StudentTable from './_component/StudentTable'
import StudentDetailDrawer from './_component/StudentDetailDrawer'
import { getStudentsByAssignmentClass, getStudentResults, type StudentSummary } from '@/services/admin/results'
import { useRouter } from 'next/navigation'
import { TablePagination } from '@/components/pagination'
import { getAssignmentActiveStatusLabel } from '@/lib/language-mappers/assignment-active-status-mapper'
import { getAssignmentActiveStatusColor } from '@/lib/color-mappers/assignment-active-status-mapper'
import { Input } from '@/components/ui/input'

interface TableAssignment {
  id: string
  description?: string
  title: string
  creatorName: string
  creatorEmail: string
  className: string
  classId: string
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
    classId: assignment.classInfo?.id ?? assignment.class?.id ?? '',
    classCode: assignment.classInfo?.classCode ?? assignment.class?.classCode ?? '-',
    taskCount: assignment.taskCount ?? (assignment.tasks?.length ?? 0),
    attemptCount: assignment.attemptCount ?? 0,
    isActive: Boolean(assignment.isActive),
    createdDate: assignment.createdAt ? dateFormat(assignment.createdAt) : '-',
    dueDate: assignment.dueDate ? dateFormat(assignment.dueDate) : '-'
  }
}

export default function AdminResultPage() {
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
  const [sortField, setSortField] = useState<'title' | 'teacherName' | 'className' | 'status' | 'createdDate'>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [assignmentToDelete, setAssignmentToDelete] = useState<TableAssignment | null>(null)

  // Students list state for selected assignment/class
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsPage, setStudentsPage] = useState(1)
  const [studentsPageSize, setStudentsPageSize] = useState(10)
  const [studentsTotal, setStudentsTotal] = useState(0)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [studentHistory, setStudentHistory] = useState<any[]>([])
  const [isLoadingStudentHistory, setIsLoadingStudentHistory] = useState(false)

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

  const loadStudents = async (assignmentId: string | null, classId: string | null, search = '') => {
    if (!accessToken || !assignmentId || !classId) {
      setStudents([])
      setStudentsTotal(0)
      return
    }

    setStudentsLoading(true)
    try {
      const resp = await getStudentsByAssignmentClass(accessToken, assignmentId, classId, studentsPage, studentsPageSize, search)
      setStudents(resp.data ?? [])
      setStudentsTotal(resp.pagination?.totalItems ?? 0)
      setSelectedAssignmentId(assignmentId)
      setSelectedClassId(classId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load students'
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleApplyFilters = (assignmentId: string | null, classId: string | null, search: string) => {
    void loadStudents(assignmentId, classId, search)
  }

  const router = useRouter()

  const handleViewStudent = (studentId: string) => {
    if (!selectedAssignmentId) return
    router.push(`/admin/results/${selectedAssignmentId}?studentId=${studentId}`)
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.admin.assignmentManagement.title}</h1>
          <p className="text-muted-foreground mt-1">{t.admin.assignmentManagement.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.resultManagement.filters.title}</CardTitle>
              <CardDescription>{t.admin.resultManagement.filters.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsFilters
                assignments={assignments}
                onApply={handleApplyFilters}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.resultManagement.resultTable.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentTable students={students} onView={handleViewStudent} />
            </CardContent>
          </Card>
        </div>
      </div>

      <StudentDetailDrawer
        open={detailOpen}
        onOpenChange={(open: boolean) => setDetailOpen(open)}
        assignmentTitle={assignments.find((a) => a.id === selectedAssignmentId)?.title}
        student={selectedStudent}
        loading={isLoadingStudentHistory}
        history={studentHistory}
      />
    </div>
  )
}

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
import { PageSizeSelect } from '@/components/page-size-select'
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

export default function StudentQuizPage() {
  const { t } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
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
        const message = error instanceof Error ? error.message : 'Khong the tai danh sach bai tap'
        toast.error(message)
      } finally {
        setIsLoadingAssignments(false)
      }
    }

    void fetchAssignments()
  }, [accessToken, isHydrated, currentPage, pageSize])

  const filteredAssignments = assignments.filter((assignment) =>
    (assignment.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t.student.assignments.overview.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.student.assignments.overview.description}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
                    <TableHead className="text-center">{t.student.assignments.overview.tableView.columnActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
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
                      <TableCell>
                        <Badge variant="secondary">Được giao</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/student/quiz/${assignment.id}/take`}>
                          <Button size="sm" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            {t.student.assignments.overview.tableView.columnDoAssignmentButton}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {t.common.pagination.total} {totalItems}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || isLoadingAssignments}
                    onClick={handlePrevPage}
                  >
                    {t.common.pagination.previous}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || isLoadingAssignments}
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
                    disabled={isLoadingAssignments}
                  />
                </div>
              </div>
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

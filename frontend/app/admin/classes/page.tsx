'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Loader2, Edit3, Power, Pencil, Ban, CheckCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
  getAllClasses,
  toggleClassStatus,
  type Class,
  type GetAllClassesResponse,
} from '@/services/admin/class-management'
import { dateFormat } from '@/lib/format'
import { UpdateClassModal } from './_components/update-class-modal'
import { CreateClassModal } from './_components/create-class-modal'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { TablePagination } from '@/components/pagination'
import { getActiveStatusLabel } from '@/lib/language-mappers/active-deactive-mapper'
import { getActiveStatusColor } from '@/lib/color-mappers/active-deactive-mapper'

export default function AdminClassesPage() {
  const { t, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaging, setIsPaging] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortField, setSortField] = useState<'name' | 'students' | 'assignments' | 'pending'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [response, setResponse] = useState<GetAllClassesResponse | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [processingClassId, setProcessingClassId] = useState<string | null>(null)

  const { accessToken, isHydrated } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchClasses = useCallback(
    async (page: number, limit: number, showSkeleton = false) => {
      if (!accessToken) {
        setClasses([])
        setResponse(null)
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
        const data = await getAllClasses(accessToken, page, limit)

        setResponse(data)
        setClasses(data.data ?? [])
        setCurrentPage(data.pagination?.currentPage ?? page)
        setTotalItems(data.pagination?.totalItems ?? 0)
        setHasNextPage(Boolean(data.pagination?.hasNextPage))
        setHasPrevPage(Boolean(data.pagination?.hasPreviousPage))
      } catch (error) {
        toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error })
        setClasses([])
      } finally {
        setIsLoading(false)
        setIsPaging(false)
      }
    },
    [accessToken, toast],
  )

  useEffect(() => {
    if (!isMounted || !isHydrated) return
    void fetchClasses(currentPage, pageSize, true)
  }, [isMounted, currentPage, fetchClasses, isHydrated, pageSize])

  const visibleClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = classes.filter((classItem) => {
      if (!query) return true

      const name = classItem.name?.toLowerCase() ?? ''
      const classCode = classItem.classCode?.toLowerCase() ?? ''
      const teacherFirst = classItem.teacher?.profile?.firstName?.toLowerCase() ?? ''
      const teacherLast = classItem.teacher?.profile?.lastName?.toLowerCase() ?? ''

      return (
        name.includes(query) ||
        classCode.includes(query) ||
        teacherFirst.includes(query) ||
        teacherLast.includes(query)
      )
    })

    const directionFactor = sortDirection === 'asc' ? 1 : -1

    return [...filtered].sort((left, right) => {
      let comparison = 0

      if (sortField === 'students') {
        const leftCount = (left.approvedStudentCount ?? (left as any).approvedStudentsCount ?? 0)
        const rightCount = (right.approvedStudentCount ?? (right as any).approvedStudentsCount ?? 0)
        comparison = leftCount - rightCount
      } else if (sortField === 'assignments') {
        comparison = (left.assignmentCount ?? 0) - (right.assignmentCount ?? 0)
      } else if (sortField === 'pending') {
        const leftPending = ((left as any).pendingRequestCount ?? 0)
        const rightPending = ((right as any).pendingRequestCount ?? 0)
        comparison = leftPending - rightPending
      } else {
        comparison = (left.name ?? '').localeCompare(right.name ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base',
        })
      }

      if (comparison === 0) {
        comparison = (left.name ?? '').localeCompare(right.name ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base',
        })
      }

      return comparison * directionFactor
    })
  }, [classes, language, searchQuery, sortDirection, sortField])

  const getTeacherName = (classItem: Class) => {
    const firstName = classItem.teacher?.profile?.firstName || ''
    const lastName = classItem.teacher?.profile?.lastName || ''

    return `${firstName} ${lastName}`.trim() || classItem.teacher?.email || 'N/A'
  }

  const handleOpenUpdateModal = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsUpdateModalOpen(true)
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleNextPage = () => {
    if (!hasNextPage || isPaging) return
    setCurrentPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    if (!hasPrevPage || isPaging) return
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handlePageSizeChange = (nextValue: number) => {
    if (nextValue === pageSize) return
    setCurrentPage(1)
    setPageSize(nextValue)
  }

  const handleUpdateModalOpenChange = (open: boolean) => {
    setIsUpdateModalOpen(open)

    if (!open) {
      setSelectedClass(null)
    }
  }

  const handleCreateModalOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open)
  }

  const handleClassUpdated = (updatedClass: Class) => {
    setClasses((prevClasses) =>
      prevClasses.map((classItem) =>
        classItem.id === updatedClass.id ? updatedClass : classItem,
      ),
    )

    setResponse((prevResponse) =>
      prevResponse
        ? {
          ...prevResponse,
          data: prevResponse.data.map((classItem) =>
            classItem.id === updatedClass.id ? updatedClass : classItem,
          ),
        }
        : prevResponse,
    )
  }

  const handleClassCreated = (_createdClass: Class) => {
    if (currentPage !== 1) {
      setCurrentPage(1)
      return
    }

    void fetchClasses(1, pageSize, true)
  }

  const handleToggleClassStatus = async (classItem: Class) => {
    if (!accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    try {
      setProcessingClassId(classItem.id)
      const result = await toggleClassStatus(accessToken, classItem.id)
      setClasses((prevClasses) => prevClasses.map((item) => item.id === result.class.id ? { ...item, isActive: result.class.isActive } : item))
      setResponse((prevResponse) =>
        prevResponse
          ? {
            ...prevResponse,
            data: prevResponse.data.map((item) =>
              item.id === result.class.id ? { ...item, isActive: result.class.isActive } : item,
            ),
          }
          : prevResponse,
      )
      toast.success(getToastMessage('updateSuccess', language), { className: TOAST_COLORS.success })
    } catch (error) {
      toast.error(getToastMessage('updateFailed', language), { className: TOAST_COLORS.error })
    } finally {
      setProcessingClassId(null)
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.admin.classManagement.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.admin.classManagement.description}
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4" />
          {t.admin.classManagement.buttons.addNewClass}
        </Button>
      </div>

      <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardContent>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] md:justify-items-center">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.teacher.classes.searchOrSortOrFilter.search.title}
                </label>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  setSearchQuery(searchInput.trim())
                }}
                className="flex flex-col items-center gap-3 md:max-w-md"
              >
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={t.teacher.classes.searchOrSortOrFilter.search.searchFieldPlaceholder}
                    className="h-11 w-full rounded-full pl-10 pr-4"
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <Button type="submit" className="rounded-full px-5">
                    {t.teacher.classes.searchOrSortOrFilter.search.searchButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-5"
                    onClick={() => {
                      setSearchInput('')
                      setSearchQuery('')
                    }}
                  >
                    {t.teacher.classes.searchOrSortOrFilter.search.resetButton}
                  </Button>
                </div>
              </form>
            </div>

            <div className="w-full max-w-3xl mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.teacher.classes.searchOrSortOrFilter.sort.sortItems.title}
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    variant={sortField === 'name' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortField('name')}
                  >
                    {t.teacher.classes.searchOrSortOrFilter.sort.sortItems.fieldClassName}
                  </Button>

                  <Button
                    type="button"
                    variant={sortField === 'students' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortField('students')}
                  >
                    {t.teacher.classes.searchOrSortOrFilter.sort.sortItems.fieldStudentCount}
                  </Button>

                  <Button
                    type="button"
                    variant={sortField === 'assignments' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortField('assignments')}
                  >
                    {t.teacher.classes.searchOrSortOrFilter.sort.sortItems.fieldAssignmentCount}
                  </Button>

                  <Button
                    type="button"
                    variant={sortField === 'pending' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortField('pending')}
                  >
                    {t.teacher.classes.searchOrSortOrFilter.sort.sortItems.fieldPendingRequestCount}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center mt-3 mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.teacher.classes.searchOrSortOrFilter.sort.order.title}
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
                    {t.teacher.classes.searchOrSortOrFilter.sort.order.asc}
                  </Button>
                  <Button
                    type="button"
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortDirection('desc')}
                  >
                    {t.teacher.classes.searchOrSortOrFilter.sort.order.desc}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader className="mb-3">
          <CardTitle>{t.admin.classManagement.tableView.title}</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : visibleClasses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery
                ? 'Không tìm thấy lớp học phù hợp'
                : 'Không có lớp học nào'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldClassName}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldClassCode}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldTeacherName}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldStudentCount}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldNumberOfAssignments}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldStatus}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldDatedCreated}</TableHead>
                    <TableHead className="text-center">{t.admin.classManagement.tableView.fieldActions}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visibleClasses.map((classItem: Class) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium text-center">
                        {classItem.name}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground text-center">
                        {classItem.classCode}
                      </TableCell>

                      <TableCell className="text-center">
                        {getTeacherName(classItem)}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="text-sm">
                          <div>
                            ✓ {classItem.approvedStudentCount}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Tổng: {classItem.studentCount}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {classItem.assignmentCount}
                      </TableCell>

                      <TableCell className="text-center">
                        <span className={`rounded px-2 py-1 text-xs font-medium ${getActiveStatusColor(classItem.isActive)}`}>
                          {getActiveStatusLabel(classItem.isActive, language)}
                        </span>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground text-center">
                        {dateFormat(classItem.createdAt)}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(classItem)}
                            disabled={processingClassId === classItem.id || isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant={classItem.isActive ? 'destructive' : 'secondary'}
                            size="sm"
                            onClick={() => void handleToggleClassStatus(classItem)}
                            disabled={processingClassId === classItem.id || isLoading}
                          >
                            {classItem.isActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
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

      <UpdateClassModal
        isOpen={isUpdateModalOpen}
        onOpenChange={handleUpdateModalOpenChange}
        classItem={selectedClass}
        accessToken={accessToken}
        onSuccess={handleClassUpdated}
      />

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onOpenChange={handleCreateModalOpenChange}
        accessToken={accessToken}
        onSuccess={handleClassCreated}
      />
    </div>
  )
}
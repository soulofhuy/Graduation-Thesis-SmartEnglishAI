'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Eye, ClockAlert, UserX, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
  getAllApprovedClassesByStudent,
  getBannedClassByStudent,
  getAllRequestsToJoinClassByStudent,
  getStudentsByClassId,
  requestToJoinClass,
} from '@/services/student/classes'
import type { Class as BackendClass, ClassMember } from '@/lib/types'
import { getToastMessage } from '@/lib/toast/message'
import { useLanguage } from '@/components/language-provider'
import { JoinClassModal } from './_components/join-class-modal'
import { JoinRequestsModal, type JoinRequestItem } from './_components/join-requests-modal'
import { ClassMembersModal } from './_components/class-members-modal'
import { BannedClassesModal } from './_components/banned-classes-modal'
import { TOAST_COLORS } from '@/lib/toast/color'
import { Input } from '@/components/ui/input'
import { TablePagination } from '@/components/pagination'

const SORT_FIELDS = ['name', 'students', 'teacher', 'classCode'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

type SortField = (typeof SORT_FIELDS)[number]
type SortDirection = (typeof SORT_DIRECTIONS)[number]

type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function StudentClassesPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [classes, setClasses] = useState<BackendClass[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [isPaging, setIsPaging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false)
  const [isBannedClassesModalOpen, setIsBannedClassesModalOpen] = useState(false)
  const [isClassMembersModalOpen, setIsClassMembersModalOpen] = useState(false)
  const [classCode, setClassCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingClassMembers, setIsLoadingClassMembers] = useState(false)
  const [isLoadingBannedClasses, setIsLoadingBannedClasses] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([])
  const [bannedClasses, setBannedClasses] = useState<BackendClass[]>([])
  const [selectedClass, setSelectedClass] = useState<BackendClass | null>(null)
  const [selectedClassMembers, setSelectedClassMembers] = useState<ClassMember[]>([])

  const getTeacherLabel = (classItem: BackendClass): string => {
    const profile = classItem.teacher?.profile
    const teacherName = [profile?.lastName, profile?.firstName]
      .filter(Boolean)
      .join(' ')

    return teacherName || classItem.teacher?.email || 'N/A'
  }

  const getStudentCount = (classItem: BackendClass) => {
    return classItem.classMembers?.length ?? 0
  }

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const visibleClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = classes.filter((classItem) => {
      if (!query) {
        return true
      }

      const name = classItem.name?.toLowerCase() ?? ''
      const classCode = classItem.classCode?.toLowerCase() ?? ''
      const teacherName = getTeacherLabel(classItem).toLowerCase()

      return name.includes(query) || classCode.includes(query) || teacherName.includes(query)
    })

    const directionFactor = sortDirection === 'asc' ? 1 : -1

    return [...filtered].sort((left, right) => {
      let comparison = 0

      if (sortField === 'students') {
        comparison = getStudentCount(left) - getStudentCount(right)
      } else if (sortField === 'teacher') {
        comparison = getTeacherLabel(left).localeCompare(getTeacherLabel(right), language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base'
        })
      } else if (sortField === 'classCode') {
        comparison = (left.classCode ?? '').localeCompare(right.classCode ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base'
        })
      } else {
        comparison = (left.name ?? '').localeCompare(right.name ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base'
        })
      }

      if (comparison === 0) {
        comparison = (left.name ?? '').localeCompare(right.name ?? '', language === 'vi' ? 'vi' : 'en', {
          sensitivity: 'base'
        })
      }

      return comparison * directionFactor
    })
  }, [classes, language, searchQuery, sortDirection, sortField])

  const fetchApprovedClasses = useCallback(async (token: string, page: number, limit: number, showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoadingClasses(true)
    } else {
      setIsPaging(true)
    }

    try {
      const result = await getAllApprovedClassesByStudent(token, page, limit)
      setClasses(result.approvedClasses as BackendClass[])

      const pagination = result.pagination as Pagination | undefined
      setCurrentPage(pagination?.page ?? page)
      setTotalItems(pagination?.totalItems ?? result.approvedClasses.length)
      setHasNextPage(Boolean(pagination?.hasNextPage))
      setHasPrevPage(Boolean(pagination?.hasPrevPage))
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsLoadingClasses(false)
      setIsPaging(false)
    }
  }, [language])

  const fetchPendingRequests = async (token: string) => {
    setIsLoadingRequests(true)
    try {
      const result = await getAllRequestsToJoinClassByStudent(token)
      const mappedRequests: JoinRequestItem[] = result.pendingRequests.map(
        request => ({
          id: request.id,
          classCode: request.class?.classCode ?? request.classId,
          status: request.isApproved
            ? 'approved'
            : request.isRejected
              ? 'rejected'
              : 'pending',
          requestedAt: request.joinedAt ?? new Date().toISOString(),
        })
      )

      setJoinRequests(mappedRequests)
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const fetchBannedClasses = async (token: string) => {
    setIsLoadingBannedClasses(true)
    try {
      const result = await getBannedClassByStudent(token)
      setBannedClasses(result.bannedClasses as BackendClass[])
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsLoadingBannedClasses(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    void Promise.all([
      fetchApprovedClasses(accessToken, currentPage, pageSize, true),
      fetchPendingRequests(accessToken),
      fetchBannedClasses(accessToken)
    ])
  }, [accessToken, currentPage, fetchApprovedClasses, isHydrated, pageSize])

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

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast.error(getToastMessage('classCodeRequired', language), { className: TOAST_COLORS.error })
      return
    }

    if (!isHydrated || !accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    setIsJoining(true)
    try {
      const normalizedClassCode = classCode.trim()
      const result = await requestToJoinClass(accessToken, normalizedClassCode)
      const classMember = result.class

      const requestStatus: JoinRequestItem['status'] = classMember.isApproved
        ? 'approved'
        : classMember.isRejected
          ? 'rejected'
          : 'pending'

      setJoinRequests(currentRequests => [
        {
          id: classMember.id,
          classCode: normalizedClassCode,
          status: requestStatus,
          requestedAt: classMember.joinedAt ?? new Date().toISOString(),
        },
        ...currentRequests,
      ])

      await Promise.all([
        fetchPendingRequests(accessToken),
        fetchApprovedClasses(accessToken, currentPage, pageSize)
      ])

      toast.success(result.message)
      setIsJoinModalOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsJoining(false)
      setClassCode('')
    }
  }

  const handleViewClassMembers = async (classItem: BackendClass) => {
    if (!isHydrated || !accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    setSelectedClass(classItem)
    setSelectedClassMembers([])
    setIsClassMembersModalOpen(true)
    setIsLoadingClassMembers(true)

    try {
      const result = await getStudentsByClassId(accessToken, classItem.id)
      setSelectedClassMembers(result.classDetail.classMembers ?? [])
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsLoadingClassMembers(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.student.classes.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.student.classes.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsJoinRequestsModalOpen(true)}
          >
            <ClockAlert className="w-4 h-4" />
            {t.student.classes.buttonViewRequests.buttonName}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsBannedClassesModalOpen(true)}
          >
            <UserX className="w-4 h-4" />
            {t.student.classes.viewBannedClasses.buttonName}
          </Button>
          <Button
            className="gap-2"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t.student.classes.buttonJoinClass.buttonName}
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardContent>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] md:justify-items-center">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.classes.searchOrSortOrFilter.search.title}
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
                    placeholder={t.student.classes.searchOrSortOrFilter.search.searchFieldPlaceholder}
                    className="h-11 w-full rounded-full pl-10 pr-4"
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <Button type="submit" className="rounded-full px-5">
                    {t.student.classes.searchOrSortOrFilter.search.searchButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-5"
                    onClick={clearSearch}
                  >
                    {t.student.classes.searchOrSortOrFilter.search.resetButton}
                  </Button>
                </div>
              </form>
            </div>

            <div className="w-full max-w-3xl mx-auto">
              <div className="flex justify-center mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.classes.searchOrSortOrFilter.sort.sortItems.title}
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
                      {field === 'name' && t.student.classes.searchOrSortOrFilter.sort.sortItems.fieldClassName}
                      {field === 'students' && t.student.classes.searchOrSortOrFilter.sort.sortItems.fieldStudentCount}
                      {field === 'teacher' && t.student.classes.searchOrSortOrFilter.sort.sortItems.fieldTeacherName}
                      {field === 'classCode' && t.student.classes.searchOrSortOrFilter.sort.sortItems.fieldClassCode}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-3 mb-3">
                <label className="inline-block border-2 border-black dark:border-white rounded-md px-3 py-1 text-sm font-bold">
                  {t.student.classes.searchOrSortOrFilter.sort.order.title}
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
                    {t.student.classes.searchOrSortOrFilter.sort.order.asc}
                  </Button>
                  <Button
                    type="button"
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="rounded-full px-3 py-1"
                    onClick={() => setSortDirection('desc')}
                  >
                    {t.student.classes.searchOrSortOrFilter.sort.order.desc}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="mb-3">
          <CardTitle>{t.student.classes.tableViewport.title}</CardTitle>
          <CardDescription>{t.student.classes.tableViewport.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{t.student.classes.tableViewport.columnClassName}</TableHead>
                    <TableHead className="text-center">{t.student.classes.tableViewport.columnTeacherName}</TableHead>
                    <TableHead className="text-center">{t.student.classes.tableViewport.columnStudentNumber}</TableHead>
                    <TableHead className="text-center">{t.student.classes.tableViewport.columnClassStatus}</TableHead>
                    <TableHead className="text-center">{t.student.classes.tableViewport.columnClassCode}</TableHead>
                    <TableHead className="text-center">{t.student.classes.tableViewport.columnActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingClasses ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t.common.loading}
                      </TableCell>
                    </TableRow>
                  ) : visibleClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t.common.noData}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleClasses.map(classItem => (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-medium text-center">{classItem.name}</TableCell>
                        <TableCell className="text-center">{getTeacherLabel(classItem)}</TableCell>
                        <TableCell className="text-center">{getStudentCount(classItem)}</TableCell>
                        <TableCell className="text-center">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            Đang học
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold text-center">
                          {classItem.classCode ?? '---'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewClassMembers(classItem)}
                            >
                              <Eye className="w-4 h-4" />
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
          </div>
        </CardContent>
      </Card>

      <JoinClassModal
        isOpen={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        classCode={classCode}
        onClassCodeChange={setClassCode}
        isJoining={isJoining}
        onJoin={handleJoinClass}
      />

      <JoinRequestsModal
        isOpen={isJoinRequestsModalOpen}
        onOpenChange={setIsJoinRequestsModalOpen}
        requests={joinRequests}
        isLoading={isLoadingRequests}
      />

      <ClassMembersModal
        isOpen={isClassMembersModalOpen}
        onOpenChange={setIsClassMembersModalOpen}
        className={selectedClass?.name}
        classCode={selectedClass?.classCode}
        classMembers={selectedClassMembers}
        isLoading={isLoadingClassMembers}
      />

      <BannedClassesModal
        isOpen={isBannedClassesModalOpen}
        onOpenChange={setIsBannedClassesModalOpen}
        classes={bannedClasses}
        isLoading={isLoadingBannedClasses}
      />
    </div>
  )
}

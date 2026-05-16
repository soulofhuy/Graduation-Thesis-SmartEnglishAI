'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageSizeSelect } from '@/components/page-size-select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Loader2, Edit3, Power } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import {
  getAllClasses,
  toggleClassStatus,
  type Class,
  type GetAllClassesResponse,
} from '@/services/admin/class-management'
import { dateFormat } from '@/lib/format'
import { UpdateClassModal } from './_components/update-class-modal'

export default function AdminClassesPage() {
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
  const [response, setResponse] = useState<GetAllClassesResponse | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [processingClassId, setProcessingClassId] = useState<string | null>(null)

  const { toast } = useToast()
  const { accessToken, isHydrated } = useAuth()

  // Hydration guard
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
        console.error('[AdminClassesPage] Error fetching classes:', error)
        toast({
          title: 'Lỗi',
          description:
            error instanceof Error
              ? error.message
              : 'Không thể tải danh sách lớp học',
          variant: 'destructive',
        })

        setClasses([])
      } finally {
        setIsLoading(false)
        setIsPaging(false)
      }
    },
    [accessToken, toast],
  )

  // Fetch classes
  useEffect(() => {
    if (!isMounted || !isHydrated) return
    void fetchClasses(currentPage, pageSize, true)
  }, [isMounted, currentPage, fetchClasses, isHydrated, pageSize])

  const filteredClasses = classes.filter((classItem) =>
    classItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.classCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.teacher?.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.teacher?.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTeacherName = (classItem: Class) => {
    const firstName = classItem.teacher?.profile?.firstName || ''
    const lastName = classItem.teacher?.profile?.lastName || ''

    return `${firstName} ${lastName}`.trim() || classItem.teacher?.email || 'N/A'
  }

  const getStatusBadge = (classItem: Class) => {
    if (!classItem.isActive) {
      return (
        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
          Không hoạt động
        </span>
      )
    }

    return (
      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        Hoạt động
      </span>
    )
  }

  const handleOpenUpdateModal = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsUpdateModalOpen(true)
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

  const handleToggleClassStatus = async (classItem: Class) => {
    if (!accessToken) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy token đăng nhập',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessingClassId(classItem.id)
      const result = await toggleClassStatus(accessToken, classItem.id)

      // Only update the `isActive` flag in local state to avoid
      // overwriting other fields (teacher, counts, etc.) that the
      // backend response may omit.
      setClasses((prevClasses) =>
        prevClasses.map((item) =>
          item.id === result.class.id ? { ...item, isActive: result.class.isActive } : item,
        ),
      )

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

      toast({
        title: 'Thành công',
        description: result.message,
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description:
          error instanceof Error
            ? error.message
            : 'Không thể thay đổi trạng thái lớp học',
        variant: 'destructive',
      })
    } finally {
      setProcessingClassId(null)
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lí lớp học
          </h1>

          <p className="mt-1 text-muted-foreground">
            Quản lý tất cả lớp học trong hệ thống
          </p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm lớp học
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

        <Input
          placeholder="Tìm kiếm lớp học, mã lớp hoặc giáo viên..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lớp học</CardTitle>

          <CardDescription>
            Danh sách tất cả lớp học trong hệ thống

            {response?.pagination && (
              <span className="ml-2">
                ({response.pagination.totalItems} lớp)
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClasses.length === 0 ? (
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
                    <TableHead>Tên lớp</TableHead>
                    <TableHead>Mã lớp</TableHead>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Bài tập</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">
                        {classItem.name}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {classItem.classCode}
                      </TableCell>

                      <TableCell>
                        {getTeacherName(classItem)}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div>
                            ✓ {classItem.approvedStudentCount}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Tổng: {classItem.studentCount}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {classItem.assignmentCount}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(classItem)}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {dateFormat(classItem.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(classItem)}
                            disabled={processingClassId === classItem.id || isLoading}
                          >
                            <Edit3 className="h-4 w-4" />
                            Cập nhật
                          </Button>

                          <Button
                            variant={classItem.isActive ? 'destructive' : 'secondary'}
                            size="sm"
                            onClick={() => void handleToggleClassStatus(classItem)}
                            disabled={processingClassId === classItem.id || isLoading}
                          >
                            <Power className="h-4 w-4" />
                            {classItem.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Tổng {totalItems} lớp
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage || isPaging}
                onClick={handlePrevPage}
              >
                Trước
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage || isPaging}
                onClick={handleNextPage}
              >
                Tiếp
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

      <UpdateClassModal
        isOpen={isUpdateModalOpen}
        onOpenChange={handleUpdateModalOpenChange}
        classItem={selectedClass}
        accessToken={accessToken}
        onSuccess={handleClassUpdated}
      />
    </div>
  )
}
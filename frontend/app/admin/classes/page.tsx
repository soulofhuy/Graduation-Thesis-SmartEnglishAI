'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Loader2 } from 'lucide-react'
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
import { getAllClasses, Class, GetAllClassesResponse } from '@/services/admin/class-management'
import { dateFormat } from '@/lib/format'

export default function AdminClassesPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [response, setResponse] = useState<GetAllClassesResponse | null>(null)

  const { toast } = useToast()
  const { accessToken, isHydrated } = useAuth()

  // Hydration guard
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch classes
  useEffect(() => {
    if (!isMounted || !isHydrated || !accessToken) return

    console.log('[AdminClassesPage] Fetching classes for page:', currentPage)
    const fetchClasses = async () => {
      try {
        setIsLoading(true)

        const data = await getAllClasses(accessToken, currentPage, 10)

        console.log('[AdminClassesPage] Fetched classes:', data)

        setResponse(data)
        setClasses(data.data)
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
      }
    }

    fetchClasses()
  }, [isMounted, currentPage, toast, accessToken, isHydrated])

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
                        <Button variant="ghost" size="sm">
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {response?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {response.pagination.currentPage} / {response.pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!response.pagination.hasPreviousPage || isLoading}
            >
              Trước
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!response.pagination.hasNextPage || isLoading}
            >
              Tiếp
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
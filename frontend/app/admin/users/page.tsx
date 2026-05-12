'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Users, GraduationCap, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageSizeSelect } from '@/components/page-size-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/components/auth-provider'
import { dateFormat } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getAllUsers, type AdminUser } from '@/services/admin/user-management'

type TableUser = {
  id: string
  name: string
  email: string
  role: 'TEACHER' | 'STUDENT'
  status: 'active' | 'inactive'
  createdDate: string
}

const getFullName = (user: AdminUser) => {
  const firstName = user.profile?.firstName?.trim() ?? ''
  const lastName = user.profile?.lastName?.trim() ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || user.email
}

const mapUserToTableUser = (user: AdminUser): TableUser => ({
  id: user.id,
  name: getFullName(user),
  email: user.email,
  role: user.role,
  status: user.isActive ? 'active' : 'inactive',
  createdDate: user.createdAt ? dateFormat(user.createdAt) : '-'
})

export default function AdminUsersPage() {
  const { accessToken, isHydrated } = useAuth()

  const [users, setUsers] = useState<TableUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaging, setIsPaging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = useCallback(
    async (page: number, limit: number, showSkeleton = false) => {
      if (!accessToken) {
        setUsers([])
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
        const response = await getAllUsers(accessToken, page, limit)
        setUsers((response.data ?? []).map(mapUserToTableUser))
        setCurrentPage(response.pagination.page)
        setTotalItems(response.pagination.totalItems)
        setHasNextPage(Boolean(response.pagination.hasNextPage))
        setHasPrevPage(Boolean(response.pagination.hasPrevPage))
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', 'vi')
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoading(false)
        setIsPaging(false)
      }
    },
    [accessToken]
  )

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    void fetchUsers(currentPage, pageSize, true)
  }, [currentPage, fetchUsers, isHydrated, pageSize])

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

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, users])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return 'bg-primary/10 text-primary'
      case 'STUDENT':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return 'Giáo viên'
      case 'STUDENT':
        return 'Học sinh'
      default:
        return role
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lí người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý giáo viên và học sinh trong hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </div>

      <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Dữ liệu được lấy trực tiếp từ API, hỗ trợ phân trang theo page/limit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                Không tìm thấy người dùng nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-medium ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.createdDate}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Tổng số: {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrevPage || isPaging}
                  onClick={handlePrevPage}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage || isPaging}
                  onClick={handleNextPage}
                >
                  Trang sau
                </Button>
              </div>
              <PageSizeSelect
                value={pageSize}
                onChange={handlePageSizeChange}
                options={[10, 20, 25, 50]}
                disabled={isPaging}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

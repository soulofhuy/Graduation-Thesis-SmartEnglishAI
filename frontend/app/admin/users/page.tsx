'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, KeyRound, Ban, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageSizeSelect } from '@/components/page-size-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/components/auth-provider'
import { dateFormat } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getAllUsers, type AdminUser, toggleUserActive } from '@/services/admin/user-management'
import { UpdatePasswordModal } from './_components/update-password-modal'
import { UpdateProfileModal } from './_components/update-profile-modal'
import { getRoleLabel } from '@/lib/language-mappers/user-role-mapper'
import { getRoleColor } from '@/lib/color-mappers/user-role-mapper'
import { getActiveStatusLabel } from '@/lib/language-mappers/active-deactive-mapper'
import { useLanguage } from '@/components/language-provider'
import { getActiveStatusColor } from '@/lib/color-mappers/active-deactive-mapper'

type TableUser = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
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
  isActive: user.isActive,
  createdDate: user.createdAt ? dateFormat(user.createdAt) : '-'
})

export default function AdminUsersPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()

  const [apiUsers, setApiUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaging, setIsPaging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const fetchUsers = useCallback(
    async (page: number, limit: number, showSkeleton = false) => {
      if (!accessToken) {
        setApiUsers([])
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
        setApiUsers(response.data ?? [])
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

  const openPasswordModal = (userId: string) => {
    setSelectedUser(apiUsers.find((item) => item.id === userId) ?? null)
    setIsPasswordModalOpen(true)
  }

  const openProfileModal = (userId: string) => {
    setSelectedUser(apiUsers.find((item) => item.id === userId) ?? null)
    setIsProfileModalOpen(true)
  }

  const handleToggleActive = async (userId: string) => {
    if (!accessToken) return

    try {
      await toggleUserActive(accessToken, userId)
      toast.success(getToastMessage('updateSuccess', language), { className: TOAST_COLORS.success })
      void fetchUsers(currentPage, pageSize, false)
    } catch (err) {
      const message = err instanceof Error ? err.message : getToastMessage('updateFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    }
  }

  const tableUsers = useMemo(
    () => apiUsers.map(mapUserToTableUser),
    [apiUsers]
  )

  console.log('Mapped table users:', tableUsers) // Debug log to check the mapped users

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return tableUsers
    }

    return tableUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, tableUsers])

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <UpdatePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        token={accessToken}
        user={selectedUser}
        onUpdated={() => {
          void fetchUsers(currentPage, pageSize, false)
        }}
      />

      <UpdateProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        token={accessToken}
        user={selectedUser}
        onUpdated={() => {
          void fetchUsers(currentPage, pageSize, false)
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.admin.userManagement.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.admin.userManagement.description}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t.admin.userManagement.buttons.addNewUser}
        </Button>
      </div>

      <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardHeader className="mb-3">
          <CardTitle>{t.admin.userManagement.tableView.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                {t.common.loading}...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                {t.common.noData}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">{t.admin.userManagement.tableView.columnName}</TableHead>
                      <TableHead className="text-center">{t.admin.userManagement.tableView.columnEmail}</TableHead>
                      <TableHead className="text-center">{t.admin.userManagement.tableView.columnRole}</TableHead>
                      <TableHead className="text-center">{t.admin.userManagement.tableView.columnStatus}</TableHead>
                      <TableHead className="text-center">{t.admin.userManagement.tableView.columnCreatedDate}</TableHead>
                      <TableHead className="text-center">{t.admin.userManagement.tableView.columnActions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-center">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                          >
                            {getRoleLabel(user.role, language)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${getActiveStatusColor(user.isActive)}`}>
                            {getActiveStatusLabel(user.isActive, language)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {user.createdDate}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openProfileModal(user.id)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openPasswordModal(user.id)}
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>

                            <Button
                              variant={user.isActive ? 'destructive' : 'secondary'}
                              size="icon"
                              onClick={() => handleToggleActive(user.id)}
                            >
                              {user.isActive ? (
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

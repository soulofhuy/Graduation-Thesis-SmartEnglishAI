'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ModalWrapper } from '@/components/modal-wrapper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, BookOpen, LayoutGrid, List, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
  getAllApprovedClassesByStudent,
  getAllRequestsToJoinClassByStudent,
  requestToJoinClass,
} from '@/services/student/classes'
import type { Class as BackendClass } from '@/lib/types'
import { getToastMessage } from '@/lib/toast/message'
import { useLanguage } from '@/components/language-provider'
import { JoinRequestsModal, type JoinRequestItem } from './join-requests-modal'

export default function StudentClassesPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [classes, setClasses] = useState<BackendClass[]>([])

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false)
  const [classCode, setClassCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([])

  const getTeacherLabel = (classItem: BackendClass) => {
    const profile = classItem.teacher?.profile
    const teacherName = [profile?.lastName, profile?.firstName]
      .filter(Boolean)
      .join(' ')

    return teacherName || classItem.teacher?.email || 'Chưa cập nhật giáo viên'
  }

  const getStudentCount = (classItem: BackendClass) => {
    return classItem.classMembers?.length ?? 0
  }

  const fetchApprovedClasses = async (token: string) => {
    setIsLoadingClasses(true)
    try {
      const result = await getAllApprovedClassesByStudent(token)
      setClasses(result.approvedClasses as BackendClass[])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : getToastMessage('loadFailed', language)
      toast.error(message)
    } finally {
      setIsLoadingClasses(false)
    }
  }

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
      const message =
        error instanceof Error
          ? error.message
          : getToastMessage('loadFailed', language)
      toast.error(message)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    void Promise.all([
      fetchApprovedClasses(accessToken),
      fetchPendingRequests(accessToken)
    ])
  }, [accessToken, isHydrated])

  const getRequestStatusLabel = (status: JoinRequestItem['status']) => {
    if (status === 'approved') return 'Đã duyệt'
    if (status === 'rejected') return 'Từ chối'
    return 'Chờ duyệt'
  }

  const getRequestStatusClassName = (status: JoinRequestItem['status']) => {
    if (status === 'approved') {
      return 'bg-emerald-100 text-emerald-800'
    }
    if (status === 'rejected') {
      return 'bg-rose-100 text-rose-800'
    }
    return 'bg-amber-100 text-amber-800'
  }

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast.error('Vui lòng nhập mã lớp học')
      return
    }

    if (!isHydrated) {
      toast.error('Đang tải phiên đăng nhập, vui lòng thử lại')
      return
    }

    if (!accessToken) {
      toast.error('Bạn cần đăng nhập để tham gia lớp học')
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
        fetchApprovedClasses(accessToken)
      ])

      toast.success(result.message)
    } finally {
      setIsJoining(false)
      setClassCode('')
      setIsJoinModalOpen(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Lớp học của tôi
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các lớp học đã tham gia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border bg-background p-1">
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="gap-1"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              className="gap-1"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
              Table
            </Button>
          </div>
          <Button
            className="gap-2"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Tham gia lớp
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsJoinRequestsModalOpen(true)}
          >
            <Eye className="w-4 h-4" />
            Yêu cầu tham gia lớp học
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="relative min-h-[210px] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border bg-background/90 p-1 backdrop-blur-sm">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>

              <CardHeader className="pr-24">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    {classItem.name ?? `Lớp ${classItem.classCode ?? ''}`}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      Tên giáo viên
                    </div>
                    <p className="text-base font-semibold text-foreground leading-tight">
                      {getTeacherLabel(classItem)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Số lượng học sinh
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {getStudentCount(classItem)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      Trạng thái lớp
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      Đang học
                    </span>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      Mã lớp
                    </div>
                    <p className="text-base font-semibold text-foreground leading-tight">
                      {classItem.classCode ?? '---'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách lớp dạng bảng</CardTitle>
            <CardDescription>
              Chuyển nhanh giữa hai kiểu hiển thị Grid và Table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mã lớp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingClasses ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Đang tải danh sách lớp đã tham gia...
                    </TableCell>
                  </TableRow>
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Chưa có lớp học nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map(classItem => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.name ?? `Lớp ${classItem.classCode ?? ''}`}</TableCell>
                      <TableCell>{getTeacherLabel(classItem)}</TableCell>
                      <TableCell>{getStudentCount(classItem)}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          Đang học
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">
                        {classItem.classCode ?? '---'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BookOpen className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Join Class Modal */}
      <ModalWrapper
        isOpen={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        title="Tham gia lớp học"
        description="Nhập mã lớp học do giáo viên cung cấp"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleJoinClass}
              disabled={isJoining || !classCode.trim()}
            >
              {isJoining ? 'Đang tham gia...' : 'Tham gia'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Mã lớp học
            </label>
            <Input
              placeholder="Ví dụ: ABC123"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              disabled={isJoining}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Hãy hỏi giáo viên của bạn để lấy mã lớp học
            </p>
          </div>
        </div>
      </ModalWrapper>

      <JoinRequestsModal
        isOpen={isJoinRequestsModalOpen}
        onOpenChange={setIsJoinRequestsModalOpen}
        requests={joinRequests}
        isLoading={isLoadingRequests}
      />
    </div>
  )
}

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
import { Plus, Users, BookOpen, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
  getAllPendingRequestsToJoinClassByStudent,
  requestToJoinClass,
} from '@/services/student/classes'

interface ClassItem {
  id: string
  name: string
  teacher: string
  studentCount: number
  latestAnnouncement: string
  status?: 'active' | 'pending'
}

interface JoinRequestItem {
  id: string
  classCode: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
}

export default function StudentClassesPage() {
  const { accessToken, isHydrated } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: '1',
      name: 'Lớp 9A1',
      teacher: 'Thầy Nguyễn Văn A',
      studentCount: 30,
      latestAnnouncement: 'Nhắc nhở: Bài tập Unit 3 sẽ hết hạn vào T5',
      status: 'active',
    },
    {
      id: '2',
      name: 'Lớp 9A2',
      teacher: 'Cô Trần Thị B',
      studentCount: 28,
      latestAnnouncement: 'Lập lịch kiểm tra giữa kì cho tuần tới',
      status: 'active',
    },
  ])

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [classCode, setClassCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([])

  const fetchPendingRequests = async (token: string) => {
    setIsLoadingRequests(true)
    try {
      const result = await getAllPendingRequestsToJoinClassByStudent(token)
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
          : 'Không thể tải danh sách yêu cầu tham gia lớp.'
      toast.error(message)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    void fetchPendingRequests(accessToken)
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

      await fetchPendingRequests(accessToken)

      if (classMember.isApproved) {
        setClasses(currentClasses => [
          ...currentClasses,
          {
            id: classMember.classId,
            name: `Lớp ${normalizedClassCode}`,
            teacher: 'Đã được duyệt',
            studentCount: 0,
            latestAnnouncement: 'Bạn đã tham gia lớp học thành công.',
            status: 'active',
          },
        ])
      }

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
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      {classItem.name}
                    </CardTitle>
                    <CardDescription>
                      Giáo viên: {classItem.teacher}
                    </CardDescription>
                  </div>
                  {classItem.status === 'pending' ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Chờ duyệt
                    </span>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      Học sinh
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {classItem.studentCount}
                    </p>
                  </div>
                </div>

                {/* Latest Announcement */}
                <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    THÔNG BÁO MỚI NHẤT
                  </p>
                  <p className="text-sm text-foreground">
                    {classItem.latestAnnouncement}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Bài tập
                  </Button>
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
                  <TableHead>Thông báo mới nhất</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Chưa có lớp học nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map(classItem => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.name}</TableCell>
                      <TableCell>{classItem.teacher}</TableCell>
                      <TableCell>{classItem.studentCount}</TableCell>
                      <TableCell>
                        {classItem.status === 'pending' ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            Đang học
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {classItem.latestAnnouncement}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Yêu cầu tham gia lớp học</CardTitle>
          <CardDescription>
            Theo dõi danh sách yêu cầu đã gửi và trạng thái phê duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lớp</TableHead>
                <TableHead>Thời gian gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRequests ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Đang tải danh sách yêu cầu...
                  </TableCell>
                </TableRow>
              ) : joinRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Bạn chưa gửi yêu cầu tham gia lớp nào.
                  </TableCell>
                </TableRow>
              ) : (
                joinRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell className="font-semibold">{request.classCode}</TableCell>
                    <TableCell>{new Date(request.requestedAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRequestStatusClassName(request.status)}`}
                      >
                        {getRequestStatusLabel(request.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  )
}

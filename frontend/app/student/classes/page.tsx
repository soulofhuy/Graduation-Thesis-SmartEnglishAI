'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Plus, Users, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

interface ClassItem {
  id: string
  name: string
  teacher: string
  studentCount: number
  latestAnnouncement: string
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: '1',
      name: 'Lớp 9A1',
      teacher: 'Thầy Nguyễn Văn A',
      studentCount: 30,
      latestAnnouncement: 'Nhắc nhở: Bài tập Unit 3 sẽ hết hạn vào T5',
    },
    {
      id: '2',
      name: 'Lớp 9A2',
      teacher: 'Cô Trần Thị B',
      studentCount: 28,
      latestAnnouncement: 'Lập lịch kiểm tra giữa kì cho tuần tới',
    },
  ])

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      toast.error('Vui lòng nhập mã lớp học')
      return
    }

    setIsJoining(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Demo: Create a new class if code matches pattern
      if (joinCode.toUpperCase().match(/^[A-Z]{3}\d{3}$/)) {
        const newClass: ClassItem = {
          id: String(classes.length + 1),
          name: `Lớp ${Math.floor(Math.random() * 10)}A${Math.floor(Math.random() * 4) + 1}`,
          teacher: 'Thầy/Cô X',
          studentCount: Math.floor(Math.random() * 20) + 20,
          latestAnnouncement: 'Chào mừng bạn đến với lớp học!',
        }
        setClasses([...classes, newClass])
        toast.success('Tham gia lớp học thành công!')
      } else {
        toast.error('Mã lớp học không hợp lệ')
      }
    } finally {
      setIsJoining(false)
      setJoinCode('')
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
        <Button
          className="gap-2"
          onClick={() => setIsJoinModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Tham gia lớp
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">
                {classItem.name}
              </CardTitle>
              <CardDescription>
                Giáo viên: {classItem.teacher}
              </CardDescription>
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
              disabled={isJoining || !joinCode.trim()}
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
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
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

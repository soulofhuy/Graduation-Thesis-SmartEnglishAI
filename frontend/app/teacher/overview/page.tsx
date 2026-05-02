'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getTeacherOverview, type TeacherOverview } from '@/services/teacher/overview'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useLanguage } from '@/components/language-provider'
import { toast } from 'sonner'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

export default function TeacherOverviewPage() {
  const { accessToken, isHydrated } = useAuth()
  const { t, language } = useLanguage()
  const [overview, setOverview] = useState<TeacherOverview | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken || !isHydrated) return;

      try {
        const data = await getTeacherOverview(accessToken);
        setOverview(data);
      } catch (error) {
        toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error });
      }
    };

    void fetchOverview();
  }, [accessToken, isHydrated]);

  const stats = useMemo(() => {
    const statistic = overview?.statistics;

    return [
      {
        title: 'Tổng số lớp học',
        value: statistic?.totalClasses || 0,
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: 'Tổng số học sinh',
        value: statistic?.totalStudents || 0,
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: 'Tổng số học sinh đang chờ duyệt',
        value: statistic?.totalPendingStudents || 0,
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: 'Tổng số bài tập đã tạo',
        value: statistic?.totalAssignments || 0,
        icon: <Users className="w-5 h-5" />,
      }
    ]
  }, [language, overview?.statistics]);

  const recentAssignments = useMemo(() => {
    const rcasmts = overview?.recentAssignments || [];

    return rcasmts.map((item) => ({
      id: item.id,
      name: item.title,
      class: item.className,
      dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString(language) : 'Không có',
      submissions: `${item.submittedCount} học sinh đã nộp`,
    }))
  }, [language, overview?.recentAssignments])

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-text">
          Tổng quan
        </h1>
        <p className="text-lg text-muted-foreground">
          Chào mừng trở lại, thầy Nguyễn Văn A
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      {/* <div className="flex flex-col sm:flex-row gap-4">
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài tập
        </Button>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Tạo câu hỏi bằng AI
        </Button>
      </div> */}

      <Card>
        <CardHeader>
          <CardTitle>Bài tập gần đây</CardTitle>
          <CardDescription>
            Danh sách các bài tập được giao gần đây nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Hạn nộp</TableHead>
                  <TableHead>Nộp bài</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.name}
                    </TableCell>
                    <TableCell>{assignment.class}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>{assignment.submissions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

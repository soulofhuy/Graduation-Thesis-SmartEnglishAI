'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { Clock, FileText, School, Users } from 'lucide-react'
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
import { dateFormat } from '@/lib/format'

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
        title: t.teacher.overview.statistic.fieldTotalClasses,
        value: statistic?.totalClasses || 0,
        icon: <School className="w-5 h-5 text-blue-500" />,
      },
      {
        title: t.teacher.overview.statistic.fieldTotalStudents,
        value: statistic?.totalStudents || 0,
        icon: <Users className="w-5 h-5 text-green-500" />,
      },
      {
        title: t.teacher.overview.statistic.fieldTotalPendingRequests,
        value: statistic?.totalPendingStudents || 0,
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
      },
      {
        title: t.teacher.overview.statistic.fieldTotalAssignments,
        value: statistic?.totalAssignments || 0,
        icon: <FileText className="w-5 h-5 text-purple-500" />,
      }
    ]
  }, [language, overview?.statistics]);

  const recentAssignments = useMemo(() => {
    const rcasmts = overview?.recentAssignments || [];

    return rcasmts.map((item) => ({
      id: item.id,
      name: item.title,
      class: item.className,
      createdAt: dateFormat(item.createdAt.toString()),
      dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString(language) : '-',
      submitedStudent: `${item.submittedStudentsCount} / ${item.totalStudentsInClass} ${t.teacher.overview.tableView.submittedStudentsCountDescription}`,
      submissions: `${item.submittedCount} ${t.teacher.overview.tableView.submissionCountDescription}`,
    }))
  }, [language, overview?.recentAssignments])

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.teacher.overview.title}</h1>
          <p className="text-muted-foreground mt-1">{t.teacher.overview.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader className="mb-3">
          <CardTitle>{t.teacher.overview.tableView.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">{t.teacher.overview.tableView.columnTitle}</TableHead>
                  <TableHead className="text-center">{t.teacher.overview.tableView.columnClass}</TableHead>
                  <TableHead className="text-center">{t.teacher.overview.tableView.columnCreatedDate}</TableHead>
                  <TableHead className="text-center">{t.teacher.overview.tableView.columnDueDate}</TableHead>
                  <TableHead className="text-center">{t.teacher.overview.tableView.columnSubmissionCount}</TableHead>
                  <TableHead className="text-center">{t.teacher.overview.tableView.columnSubmittedStudents}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id} className="text-center">
                    <TableCell>{assignment.name}</TableCell>
                    <TableCell>{assignment.class}</TableCell>
                    <TableCell>{assignment.createdAt}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>{assignment.submissions}</TableCell>
                    <TableCell>{assignment.submitedStudent}</TableCell>
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

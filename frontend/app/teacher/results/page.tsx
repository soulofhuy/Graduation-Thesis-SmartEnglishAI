'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, FileText, CheckCircle, Clock, Eye } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getClassesByTeacherId } from '@/services/teacher/classes'
import { getAssignmentsByClassId } from '@/services/teacher/assignments'
import { getClassProgressOnAssignments } from '@/services/teacher/assignment-student-results'
import type { Assignment, Class } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'
import { toast } from 'sonner'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { dateTimeFormat } from '@/lib/format'

interface StudentResultTable {
  id: string
  name: string
  email: string
  latestCorrectAnswers: number
  totalQuestions: number
  status: 'submitted' | 'pending'
  latestSubmittedDate?: string
  bestCorrectAnswers: number
  submittedAttempts: number
}

interface AssignmentResultStatistic {
  submittedCount: number
  notSubmittedCount: number
  highestCorrectCount: number
  highestCorrectStudentName: string
}

export default function TeacherResultsPage() {
  const { t, language } = useLanguage()
  const { user, accessToken } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [statistic, setStatistic] = useState<AssignmentResultStatistic | null>(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [resultsError, setResultsError] = useState<string | null>(null)
  const [results, setResults] = useState<StudentResultTable[]>([])

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.id || !accessToken) {
        setIsLoadingClasses(false)
        return
      }

      try {
        setIsLoadingClasses(true)
        const { classes: fetchedClasses } = await getClassesByTeacherId(accessToken, user.id)
        setClasses(fetchedClasses)
        if (fetchedClasses.length > 0) {
          setSelectedClass(fetchedClasses[0].id)
        }
      } catch (error) {
        toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error })
      } finally {
        setIsLoadingClasses(false)
      }
    }

    loadClasses()
  }, [user?.id, accessToken])

  useEffect(() => {
    const loadAssignments = async () => {
      if (!selectedClass || !accessToken) {
        setAssignments([])
        setSelectedAssignment('')
        return
      }

      try {
        setIsLoadingAssignments(true)
        setSelectedAssignment('')
        const fetchedAssignments = await getAssignmentsByClassId(accessToken, selectedClass)
        setAssignments(fetchedAssignments)
        if (fetchedAssignments.length > 0) {
          setSelectedAssignment(fetchedAssignments[0].id)
        }
      } catch (error) {
        setAssignments([])
        toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error })
      } finally {
        setIsLoadingAssignments(false)
      }
    }

    loadAssignments()
  }, [selectedClass, accessToken])

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedClass || !selectedAssignment || !accessToken) {
        setResults([])
        return
      }

      try {
        setIsLoadingResults(true)
        setResultsError(null)
        const progressData = await getClassProgressOnAssignments(
          accessToken,
          selectedClass,
          selectedAssignment
        )

        setStatistic(progressData.assignmentStatistic)
        const transformedResults: StudentResultTable[] = progressData.students
          .map((student: any) => {
            const studentName = `${student.profile.firstName || ''} ${student.profile.lastName || ''}`.trim()

            return {
              id: student.studentId,
              name: studentName,
              email: student.email,
              latestCorrectAnswers: student.assignment.latestCorrectCount ?? 0,
              totalQuestions: student.assignment.totalQuestions ?? 0,
              status: student.assignment.latestStatus === 'SUBMITTED' ? 'submitted' : 'pending' as const,
              latestSubmittedDate: student.assignment.latestSubmittedDate ? dateTimeFormat(student.assignment.latestSubmittedDate) : undefined,
              bestCorrectAnswers: student.assignment.bestCorrectCount ?? 0,
              submittedAttempts: student.assignment.submittedAttemptCount,
            }
          })
        setResults(transformedResults)
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        setResultsError(message)
        setResults([])
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoadingResults(false)
      }
    }

    loadResults()
  }, [selectedClass, selectedAssignment, accessToken])

  const stats = [
    {
      title: t.teacher.results.statistic.totalSubmiitedCount,
      value: statistic ? statistic.submittedCount : '-',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: t.teacher.results.statistic.totalNotSubmittedCount,
      value: statistic ? statistic.notSubmittedCount : '-',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: t.teacher.results.statistic.highestCorrectCount,
      value: statistic ? statistic.highestCorrectCount : '-',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: t.teacher.results.statistic.highestCorrectStudentName,
      value: statistic ? statistic.highestCorrectStudentName : '-',
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t.teacher.results.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.teacher.results.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                {t.teacher.results.filters.class.title}
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingClasses}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingClasses ? 'Đang tải...' : 'Chọn lớp'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="__no_classes" disabled>
                      Không có lớp nào
                    </SelectItem>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name || `Lớp ${cls.classCode}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                {t.teacher.results.filters.assignment.title}
              </label>
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment} disabled={!selectedClass || isLoadingAssignments}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingAssignments ? 'Đang tải...' : 'Chọn bài tập'} />
                </SelectTrigger>
                <SelectContent>
                  {assignments.length === 0 ? (
                    <SelectItem value="__no_assignments" disabled>
                      Không có bài tập
                    </SelectItem>
                  ) : (
                    assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title || 'Bài tập không tên'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="mb-3">{t.teacher.results.tableView.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingResults ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải kết quả...
            </div>
          ) : resultsError ? (
            <div className="text-center py-8 text-red-500">
              {resultsError}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnName}</TableHead>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnEmail}</TableHead>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnLatestResult}</TableHead>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnHighestResult}</TableHead>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnSubmittedCount}</TableHead>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnSubmittedDate}</TableHead>
                    <TableHead className="text-center">{t.teacher.results.tableView.columnActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result: StudentResultTable) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium text-center">
                        {result.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold">
                          {result.latestCorrectAnswers}/{result.totalQuestions}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-green-600">
                          {result.bestCorrectAnswers}/{result.totalQuestions}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.submittedAttempts || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.latestSubmittedDate || 'Chưa nộp'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm">
                          <Eye className="w-5 h-5" />
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
    </div>
  )
}

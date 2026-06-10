'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle, Eye, XCircle, Trophy, Medal } from 'lucide-react'
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
import { ResultsChatPanel } from './_components/results-chat-panel'

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
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Load the teacher's classes first so the assignment filter can be chained from the selected class.
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

  // Switching class resets the assignment list and primes the first assignment in that class.
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

  // The current class + assignment pair drives the stats, table, and AI chat context.
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
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: t.teacher.results.statistic.totalNotSubmittedCount,
      value: statistic ? statistic.notSubmittedCount : '-',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    {
      title: t.teacher.results.statistic.highestCorrectCount,
      value: statistic ? statistic.highestCorrectCount : '-',
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    },
    {
      title: t.teacher.results.statistic.highestCorrectStudentName,
      value: statistic ? statistic.highestCorrectStudentName : '-',
      icon: <Medal className="w-5 h-5 text-green-500" />,
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Page header and the AI entry point for result analysis. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.teacher.results.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.teacher.results.description}
          </p>
        </div>
        {/* <Button
          className="self-start"
          onClick={() => setIsChatOpen((prev) => !prev)}
        >
          {t.teacher.results.chatWithAI.shortTitle}
        </Button> */}
      </div>

      {/* Summary cards reflect the currently selected assignment. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Two-step filter flow: class first, then assignment. */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-center mb-4">
                <label className="inline-block rounded-md border-2 border-black rounded-md px-3 py-1 text-sm font-bold">
                  {t.teacher.results.filters.class.title}
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {isLoadingClasses ? (
                  <div className="text-sm text-muted-foreground">Đang tải...</div>
                ) : classes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Không có lớp nào</div>
                ) : (
                  classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      className={`px-3 py-1 rounded-full border transition-colors ${selectedClass === cls.id ? 'bg-primary text-white border-primary' : 'bg-white text-foreground'}`}
                      aria-pressed={selectedClass === cls.id}
                    >
                      {cls.name}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <label className="inline-block rounded-md border-2 border-black rounded-md px-3 py-1 text-sm font-bold">
                  {t.teacher.results.filters.assignment.title}
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {(!selectedClass || isLoadingAssignments) ? (
                  <div className="text-sm text-muted-foreground">Chọn lớp trước</div>
                ) : assignments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Không có bài tập</div>
                ) : (
                  assignments.map((assignment) => (
                    <button
                      key={assignment.id}
                      onClick={() => setSelectedAssignment(assignment.id)}
                      className={`px-3 py-1 rounded-full border transition-colors ${selectedAssignment === assignment.id ? 'bg-primary text-white border-primary' : 'bg-white text-foreground'}`}
                      aria-pressed={selectedAssignment === assignment.id}
                    >
                      {assignment.title || 'Bài tập không tên'}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results table plus the drill-down action for each student attempt history. */}
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
                        <Button asChild variant="outline" size="sm" disabled={!selectedAssignment}>
                          <Link href={`/teacher/results/${selectedAssignment}?studentId=${result.id}`}>
                            <Eye className="w-5 h-5" />
                          </Link>
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

      {/* Chat stays in a dialog so the teacher can analyze results without leaving this page. */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-5xl p-0 h-[80vh] flex flex-col">
          <ResultsChatPanel
            className="border-0 shadow-none flex-grow"
            classId={selectedClass}
            assignmentId={selectedAssignment}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

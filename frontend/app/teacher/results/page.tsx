'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Users, FileText, CheckCircle, Clock, Send, Sparkles } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/components/auth-provider'
import { getClassesByTeacherId } from '@/services/teacher/classes'
import { getAssignmentsByClassId } from '@/services/teacher/assignments'
import type { Assignment, Class } from '@/lib/types'

interface StudentResult {
  id: string
  name: string
  score: number
  status: 'submitted' | 'pending'
  submittedDate?: string
}

export default function TeacherResultsPage() {
  const { user, accessToken } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [classesError, setClassesError] = useState<string | null>(null)
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null)

  // Load classes for the teacher
  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.id || !accessToken) {
        setIsLoadingClasses(false)
        return
      }

      try {
        setIsLoadingClasses(true)
        setClassesError(null)
        const { classes: fetchedClasses } = await getClassesByTeacherId(
          accessToken,
          user.id
        )
        setClasses(fetchedClasses)
        // Set the first class as default if available
        if (fetchedClasses.length > 0) {
          setSelectedClass(fetchedClasses[0].id)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load classes'
        setClassesError(message)
        console.error('Error loading classes:', error)
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
        setAssignmentsError(null)
        setSelectedAssignment('')
        const fetchedAssignments = await getAssignmentsByClassId(
          accessToken,
          selectedClass
        )
        setAssignments(fetchedAssignments)
        if (fetchedAssignments.length > 0) {
          setSelectedAssignment(fetchedAssignments[0].id)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load assignments'
        setAssignmentsError(message)
        setAssignments([])
        console.error('Error loading assignments:', error)
      } finally {
        setIsLoadingAssignments(false)
      }
    }

    loadAssignments()
  }, [selectedClass, accessToken])

  const results: StudentResult[] = [
    {
      id: '1',
      name: 'Trần Minh Anh',
      score: 9.5,
      status: 'submitted',
      submittedDate: '2024-03-15',
    },
    {
      id: '2',
      name: 'Nguyễn Văn Bình',
      score: 7.8,
      status: 'submitted',
      submittedDate: '2024-03-14',
    },
    {
      id: '3',
      name: 'Phạm Thị Chung',
      score: 8.5,
      status: 'submitted',
      submittedDate: '2024-03-13',
    },
    {
      id: '4',
      name: 'Lê Đức Dũng',
      score: 0,
      status: 'pending',
    },
    {
      id: '5',
      name: 'Hồ Thanh Ế',
      score: 6.5,
      status: 'submitted',
      submittedDate: '2024-03-10',
    },
  ]

  const stats = [
    {
      title: 'Tổng bài nộp',
      value: results.filter((r) => r.status === 'submitted').length,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: 'Chưa nộp',
      value: results.filter((r) => r.status === 'pending').length,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: 'Điểm trung bình',
      value: (
        results.reduce((sum, r) => sum + r.score, 0) / results.length
      ).toFixed(1),
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Tỉ lệ đạt',
      value: (
        (results.filter((r) => r.score >= 5).length / results.length * 100).toFixed(0) + '%'
      ),
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ]

  const handleAIAnalysis = async () => {
    if (!aiQuestion.trim()) {
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAiAnalysis(
        `Phân tích về câu hỏi "${aiQuestion}":\n\n- Tổng số học sinh trả lời: ${results.length}\n- Số câu trả lời đúng: ${Math.floor(Math.random() * results.length)}\n- Độ khó: ${['Dễ', 'Trung bình', 'Khó'][Math.floor(Math.random() * 3)]}\n- Đề xuất: Cần ôn tập thêm về nội dung này với học sinh.`
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Kết quả học tập
        </h1>
        <p className="text-muted-foreground mt-1">
          Phân tích và quản lý kết quả bài tập của học sinh
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
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Chọn lớp học
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingClasses}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingClasses ? 'Đang tải...' : 'Chọn lớp'} />
                </SelectTrigger>
                <SelectContent>
                  {classesError ? (
                    <SelectItem value="__classes_error" disabled>
                      {classesError}
                    </SelectItem>
                  ) : classes.length === 0 ? (
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
                Chọn bài tập
              </label>
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment} disabled={!selectedClass || isLoadingAssignments}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingAssignments ? 'Đang tải...' : 'Chọn bài tập'} />
                </SelectTrigger>
                <SelectContent>
                  {assignmentsError ? (
                    <SelectItem value="__assignments_error" disabled>
                      {assignmentsError}
                    </SelectItem>
                  ) : assignments.length === 0 ? (
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
          <CardTitle>Kết quả chi tiết</CardTitle>
          <CardDescription>
            Bảng điểm chi tiết của học sinh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên học sinh</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      {result.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-lg font-bold text-primary">
                        {result.score}/10
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${result.status === 'submitted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {result.status === 'submitted'
                          ? 'Đã nộp'
                          : 'Chưa nộp'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {result.submittedDate || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Phân tích kết quả
          </CardTitle>
          <CardDescription>
            Tương tác với AI để phân tích kết quả bài tập
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Hỏi về kết quả
            </label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Ví dụ: Câu nào học sinh trả lời sai nhiều nhất?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="min-h-20"
              />
            </div>
            <Button
              className="mt-3 gap-2"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !aiQuestion.trim()}
            >
              <Send className="w-4 h-4" />
              {isAnalyzing ? 'Đang phân tích...' : 'Phân tích'}
            </Button>
          </div>

          {aiAnalysis && (
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm text-foreground">
              {aiAnalysis}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

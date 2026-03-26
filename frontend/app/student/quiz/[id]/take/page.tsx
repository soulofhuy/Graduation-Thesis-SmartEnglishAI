'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, Flag, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Question {
  id: string
  text: string
  options: { id: string; text: string }[]
}

interface QuizData {
  id: string
  title: string
  totalQuestions: number
  duration: number
  questions: Question[]
}

export default function QuizTakePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showAnswerGrid, setShowAnswerGrid] = useState(false)

  // Mock quiz data
  const quizData: QuizData = {
    id: params.id,
    title: 'Bài tập ngữ pháp Unit 1',
    totalQuestions: 20,
    duration: 30,
    questions: Array.from({ length: 20 }, (_, i) => ({
      id: `q${i + 1}`,
      text: `Câu hỏi ${i + 1}: Chọn đáp án đúng nhất cho câu sau...`,
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
        { id: 'd', text: 'Option D' },
      ],
    })),
  }

  const currentQuestion = quizData.questions[currentQuestionIndex]

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }))
  }

  const handleFlagQuestion = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId)
    } else {
      newFlagged.add(questionId)
    }
    setFlaggedQuestions(newFlagged)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowAnswerGrid(false)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowAnswerGrid(false)
    }
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowAnswerGrid(false)
  }

  const handleSubmitQuiz = () => {
    const answeredCount = Object.keys(selectedAnswers).length
    router.push(`/student/quiz/${params.id}/results?answered=${answeredCount}&total=${quizData.totalQuestions}`)
    toast.success('Nộp bài tập thành công!')
  }

  const progressPercent = ((currentQuestionIndex + 1) / quizData.totalQuestions) * 100
  const answeredCount = Object.keys(selectedAnswers).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {quizData.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Câu {currentQuestionIndex + 1} / {quizData.totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold text-lg">
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Nộp bài
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  Tiến độ: {answeredCount}/{quizData.totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(progressPercent)}%
                </p>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {currentQuestion.text}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAnswers[currentQuestion.id] === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option.id}
                        checked={selectedAnswers[currentQuestion.id] === option.id}
                        onChange={() => handleSelectAnswer(option.id)}
                        className="w-4 h-4"
                      />
                      <span className="ml-4 font-medium text-foreground">
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                  >
                    <Flag
                      className={`w-4 h-4 ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? 'fill-accent text-accent'
                          : ''
                      }`}
                    />
                    {flaggedQuestions.has(currentQuestion.id)
                      ? 'Đã đánh dấu'
                      : 'Đánh dấu'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Câu trước
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quizData.totalQuestions - 1}
                className="gap-2 ml-auto"
              >
                Câu tiếp theo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Question Grid Sidebar */}
        <div className="hidden lg:flex flex-col w-80 border-l border-border bg-muted/30 p-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground mb-4">
              Danh sách câu hỏi
            </h3>
            <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {quizData.questions.map((q, index) => {
                const isAnswered = selectedAnswers[q.id]
                const isFlagged = flaggedQuestions.has(q.id)
                const isCurrent = currentQuestionIndex === index

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(index)}
                    className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                        : isAnswered
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : isFlagged
                        ? 'bg-accent/20 text-accent hover:bg-accent/30'
                        : 'bg-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-foreground">Câu hiện tại</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100" />
              <span className="text-foreground">Đã trả lời</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent/20" />
              <span className="text-foreground">Đánh dấu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã trả lời {answeredCount}/{quizData.totalQuestions} câu hỏi.
              <br />
              Bạn chắc chắn muốn nộp bài tập này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleSubmitQuiz}>
            Nộp bài
          </AlertDialogAction>
          <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Flag, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
  startOrGetInProgressAttempt,
  submitAttempt,
  type StudentAttempt
} from '@/services/student/attempts'
import {
  getAssignmentByIdForStudentToDoTest,
  type StudentAssignmentDetailResponse
} from '@/services/student/assignments'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'

interface Question {
  id: string
  taskContent?: string
  taskContentHtml?: string
  text: string
  textHtml?: string
  passageText?: string
  passageHtml?: string
  options: { id: string; text: string; html?: string }[]
}

const normalizeHtmlToText = (value?: string | null) => {
  if (!value) {
    return ''
  }

  if (typeof window === 'undefined') {
    return value
  }

  const htmlWithBreaks = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')

  const tempNode = document.createElement('div')
  tempNode.innerHTML = htmlWithBreaks

  return (tempNode.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function FormattedContent({
  html,
  text,
  className,
}: {
  html?: string
  text?: string
  className?: string
}) {
  if (html?.trim()) {
    return (
      <div
        className={cn(
          '[&_p]:my-0 [&_strong]:font-semibold [&_b]:font-semibold [&_u]:underline [&_s]:line-through [&_em]:italic [&_i]:italic',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  if (!text?.trim()) {
    return null
  }

  return <p className={cn('whitespace-pre-line', className)}>{text}</p>
}

export default function QuizTakePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const assignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { accessToken, isHydrated } = useAuth()
  const { t } = useLanguage()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [assignment, setAssignment] = useState<StudentAssignmentDetailResponse | null>(null)
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mapAttemptAnswersToSelectedAnswers = (attempt: StudentAttempt) => {
    const nextSelectedAnswers: Record<string, string> = {}

    attempt.answers?.forEach((answer) => {
      nextSelectedAnswers[answer.questionId] = answer.selectedChoiceId
    })

    return nextSelectedAnswers
  }

  const questions = useMemo<Question[]>(() => {
    if (!assignment?.tasks?.length) {
      return []
    }

    const normalizedQuestions: Question[] = []

    assignment.tasks.forEach((task) => {
      const normalizedTaskContent = normalizeHtmlToText(task.taskContent)
      const rawTaskContent = task.taskContent?.trim()
      const shouldShowPassageFallback =
        task.taskType === 'CLOZE_PASSAGE' || task.taskType === 'READING_COMPREHENSION'

      const passageById = new Map<string, { text: string; html?: string }>()
      const passageByQuestionId = new Map<string, { text: string; html?: string }>()

      task.passages?.forEach((passage) => {
        const normalizedPassage = normalizeHtmlToText(passage.passageContent)
        const rawPassage = passage.passageContent?.trim()

        const passageValue = {
          text: normalizedPassage,
          html: rawPassage,
        }

        passageById.set(passage.id, passageValue)

        passage.questions?.forEach((question) => {
          passageByQuestionId.set(question.id, passageValue)
        })
      })

      const questionById = new Map<string, Question>()

      task.questions?.forEach((question) => {
        const mappedPassage =
          passageByQuestionId.get(question.id) ||
          (question.passageId ? passageById.get(question.passageId) : undefined)

        questionById.set(question.id, {
          id: question.id,
          taskContent: normalizedTaskContent,
          taskContentHtml: rawTaskContent,
          text: normalizeHtmlToText(question.questionContent),
          textHtml: question.questionContent?.trim(),
          passageText: mappedPassage?.text ?? (shouldShowPassageFallback ? normalizedTaskContent : undefined),
          passageHtml: mappedPassage?.html ?? (shouldShowPassageFallback ? rawTaskContent : undefined),
          options:
            question.choices?.map((choice) => ({
              id: choice.id,
              text: normalizeHtmlToText(choice.choiceContent),
              html: choice.choiceContent?.trim(),
            })) ?? [],
        })
      })

      task.passages?.forEach((passage) => {
        const normalizedPassage = normalizeHtmlToText(passage.passageContent)

        passage.questions?.forEach((question) => {
          if (questionById.has(question.id)) {
            return
          }

          questionById.set(question.id, {
            id: question.id,
            taskContent: normalizedTaskContent,
            taskContentHtml: rawTaskContent,
            text: normalizeHtmlToText(question.questionContent),
            textHtml: question.questionContent?.trim(),
            passageText: normalizedPassage,
            passageHtml: passage.passageContent?.trim(),
            options:
              question.choices?.map((choice) => ({
                id: choice.id,
                text: normalizeHtmlToText(choice.choiceContent),
                html: choice.choiceContent?.trim(),
              })) ?? [],
          })
        })
      })

      normalizedQuestions.push(...questionById.values())
    })

    return normalizedQuestions
  }, [assignment])

  const totalQuestions = questions.length
  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(selectedAnswers).length
  const answerColumns = ['A', 'B', 'C', 'D'] as const

  useEffect(() => {
    if (!isHydrated || !accessToken || !assignmentId) {
      return
    }

    const fetchQuizData = async () => {
      setIsLoadingAssignment(true)
      try {
        const [assignmentResult, attemptResult] = await Promise.all([
          getAssignmentByIdForStudentToDoTest(accessToken, assignmentId),
          startOrGetInProgressAttempt(accessToken, assignmentId)
        ])

        setAssignment(assignmentResult)
        setSelectedAnswers(mapAttemptAnswersToSelectedAnswers(attemptResult))
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Khong the tai chi tiet bai tap'
        toast.error(message)
      } finally {
        setIsLoadingAssignment(false)
      }
    }

    void fetchQuizData()
  }, [accessToken, isHydrated, assignmentId])

  const handleSelectAnswerByQuestion = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleSelectAnswer = (optionId: string) => {
    if (!currentQuestion) {
      return
    }

    handleSelectAnswerByQuestion(currentQuestion.id, optionId)
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
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmitQuiz = useCallback(async () => {
    if (!assignmentId) {
      toast.error('Khong tim thay ma bai tap')
      return
    }

    if (!accessToken) {
      toast.error('Vui long dang nhap de nop bai tap')
      return
    }

    const answers = Object.entries(selectedAnswers).map(([questionId, selectedChoiceId]) => ({
      questionId,
      selectedChoiceId
    }))

    setIsSubmitting(true)

    try {
      const submittedAttempt = await submitAttempt(accessToken, {
        assignmentId,
        answers
      })

      const answeredCount = submittedAttempt.answers?.length ?? answers.length
      router.push(`/student/quiz/${assignmentId}/results?answered=${answeredCount}&total=${totalQuestions}`)
      toast.success('Nộp bài tập thành công!')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the nop bai tap'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [accessToken, assignmentId, router, selectedAnswers, totalQuestions])

  if (!isHydrated || isLoadingAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Dang tai bai tap...</p>
      </div>
    )
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Vui long dang nhap de lam bai tap</p>
      </div>
    )
  }

  if (!assignment || totalQuestions === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Bai tap khong co cau hoi hoac da bi go bo</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4">
          <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-4">
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground truncate">
                {assignment.title}
              </h1>
              <h2 className="text-sm text-muted-foreground truncate">
                {assignment.description}
              </h2>
            </div>

            {/* Button */}
            <div className="flex justify-end lg:justify-center">
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {t.student.assignments.takeAssignment.submitButton}
              </Button>
            </div>

          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">

            {/* Question Card */}
            <Card className="mb-8">
              <CardContent>
                {currentQuestion.taskContent ? (
                  <div className="mb-6">
                    <FormattedContent
                      html={currentQuestion.taskContentHtml}
                      text={currentQuestion.taskContent}
                      className="text-base font-semibold text-foreground"
                    />
                    <div className="mt-3 border-t border-dashed border-border" />
                  </div>
                ) : null}

                {currentQuestion.passageText ? (
                  <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
                    <FormattedContent
                      html={currentQuestion.passageHtml}
                      text={currentQuestion.passageText}
                      className="text-sm leading-6 text-foreground"
                    />
                  </div>
                ) : null}

                <FormattedContent
                  html={currentQuestion.textHtml}
                  text={currentQuestion.text}
                  className="mb-6 text-base text-foreground"
                />

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAnswers[currentQuestion.id] === option.id
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
                      <div className="ml-4 flex-1 text-foreground">
                        <span className="mr-1 font-bold">{String.fromCharCode(65 + index)}.</span>
                        <FormattedContent
                          html={option.html}
                          text={option.text}
                          className="inline text-base [&_p]:inline"
                        />
                      </div>
                    </label>
                  ))}

                  {currentQuestion.options.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Câu hỏi này chưa có đáp án lựa chọn.
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                  >
                    <Flag
                      className={`w-4 h-4 ${flaggedQuestions.has(currentQuestion.id)
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
                {t.student.assignments.takeAssignment.answerList.previousButton}
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="gap-2 ml-auto"
              >
                {t.student.assignments.takeAssignment.answerList.nextButton}
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
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="grid grid-cols-[42px_repeat(4,minmax(0,1fr))] items-center gap-y-2 text-xs">
                <span />
                {answerColumns.map((label) => (
                  <span
                    key={label}
                    className="text-center font-semibold text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-2 max-h-[calc(100vh-330px)] overflow-y-auto pr-1">
                <div className="space-y-1">
                  {questions.map((q, index) => {
                    const isFlagged = flaggedQuestions.has(q.id)
                    const isCurrent = currentQuestionIndex === index
                    const visibleOptions = q.options.slice(0, answerColumns.length)

                    return (
                      <div
                        key={q.id}
                        className={`grid grid-cols-[42px_repeat(4,minmax(0,1fr))] items-center rounded-md px-1 py-1 ${isFlagged
                          ? 'bg-yellow-100/90'
                          : isCurrent
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/60'
                          }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleJumpToQuestion(index)}
                          className={`text-left text-xs font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'
                            }`}
                        >
                          {index + 1}
                        </button>

                        {answerColumns.map((_, optionIndex) => {
                          const option = visibleOptions[optionIndex]
                          const isSelected = Boolean(option && selectedAnswers[q.id] === option.id)

                          return (
                            <button
                              key={`${q.id}-${optionIndex}`}
                              type="button"
                              disabled={!option}
                              onClick={() => {
                                if (!option) {
                                  return
                                }

                                handleJumpToQuestion(index)
                                handleSelectAnswerByQuestion(q.id, option.id)
                              }}
                              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full border transition-all ${!option
                                ? 'cursor-not-allowed border-border/50 bg-muted/40 opacity-50'
                                : isSelected
                                  ? 'border-primary bg-primary/20'
                                  : 'border-border bg-background hover:border-primary/60'
                                }`}
                            >
                              {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-foreground">{t.student.assignments.takeAssignment.answerList.currentQuestion}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200" />
              <span className="text-foreground">{t.student.assignments.takeAssignment.answerList.markedQuestion}</span>
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
              Bạn đã trả lời {answeredCount}/{totalQuestions} câu hỏi.
              <br />
              Bạn chắc chắn muốn nộp bài tập này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleSubmitQuiz} disabled={isSubmitting}>
            Nộp bài
          </AlertDialogAction>
          <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

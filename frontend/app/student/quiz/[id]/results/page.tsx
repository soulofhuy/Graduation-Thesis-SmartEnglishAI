'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { useAuth } from '@/components/auth-provider'
import { useLanguage } from '@/components/language-provider'
import {
    FormattedContent,
} from '@/lib/view-details-assignment-helpers/format-content'
import { ChoiceOptionsReview } from '@/lib/view-details-assignment-helpers/choice-options-preview'
import { getAnswerDisplayContent } from '@/lib/view-details-assignment-helpers/get-answer-display-content'
import { toast } from 'sonner'
import {
    getAssignmentByIdForStudentToDoTest,
    type StudentAssignmentDetailResponse,
} from '@/services/student/assignments'
import {
    getLatestAttemptForStudent,
    type StudentAttempt,
} from '@/services/student/attempts'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

const toNumber = (value: string | null, fallback: number) => {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
}

const buildSummaryFallback = (answered: number, total: number) => {
    const safeTotal = total > 0 ? total : 1
    const safeAnswered = Math.min(Math.max(answered, 0), safeTotal)
    const correctCount = safeAnswered
    const score = Math.round((correctCount / safeTotal) * 100)

    return {
        score,
        correctCount,
        totalCount: safeTotal,
    }
}

export default function QuizResultsPage() {
    const params = useParams<{ id: string }>()
    const assignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id
    const searchParams = useSearchParams()
    const fallbackAnswered = toNumber(searchParams.get('answered'), 0)
    const fallbackTotal = toNumber(searchParams.get('total'), 0)
    const { accessToken, isHydrated } = useAuth()
    const { t, language } = useLanguage()

    const [assignment, setAssignment] = useState<StudentAssignmentDetailResponse | null>(null)
    const [attempt, setAttempt] = useState<StudentAttempt | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!isHydrated || !accessToken || !assignmentId) {
            return
        }

        const fetchResultData = async () => {
            setIsLoading(true)
            try {
                const [assignmentResult, attemptResult] = await Promise.all([
                    getAssignmentByIdForStudentToDoTest(accessToken, assignmentId),
                    getLatestAttemptForStudent(accessToken, assignmentId),
                ])

                setAssignment(assignmentResult)
                setAttempt(attemptResult)
            } catch (error) {
                const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setIsLoading(false)
            }
        }

        void fetchResultData()
    }, [accessToken, assignmentId, isHydrated])

    const canViewResult = assignment?.canViewResult ?? false
    const resultSummary = attempt?.result ?? buildSummaryFallback(fallbackAnswered, fallbackTotal)
    const questionAnswers = attempt?.result?.questionAnswers ?? []
    const answeredCount = attempt?.answers?.length ?? fallbackAnswered
    const totalCount = attempt?.result?.totalCount ?? fallbackTotal
    const correctCount = attempt?.result?.correctCount ?? resultSummary.correctCount
    const correctRatio = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

    const answerReviewTabs = useMemo(() => {
        const correctAnswers = questionAnswers.filter((item) => item.isCorrect)
        const incorrectAnswers = questionAnswers.filter((item) => !item.isCorrect)

        return { correctAnswers, incorrectAnswers }
    }, [questionAnswers])

    if (!isHydrated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Đang tải kết quả bài làm...</p>
            </div>
        )
    }

    if (!accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Vui lòng đăng nhập để xem kết quả</p>
            </div>
        )
    }

    if (!assignmentId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Không tìm thấy bài kiểm tra</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4 md:p-8 space-y-8">
                <Link href="/student/quiz">
                    <Button variant="outline" className="gap-2 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách bài tập
                    </Button>
                </Link>

                <div className="text-center space-y-6">
                    <div>
                        <p className="text-lg font-bold mb-3">{t.student.assignments.takeAssignment.answerReview.title}</p>
                        <h1
                            className={`inline-flex flex-wrap items-end justify-center gap-x-4 gap-y-2 whitespace-nowrap text-6xl font-bold leading-none ${getScoreColor(correctRatio)}`}
                        >
                            <span className="tabular-nums">{correctCount}</span>
                            <span className="pb-2 text-sm font-semibold tracking-wide">{t.student.assignments.takeAssignment.answerReview.correct}</span>
                            <span className="tabular-nums">/</span>
                            <span className="tabular-nums">{totalCount}</span>
                            <span className="pb-2 text-sm font-semibold tracking-wide">{t.student.assignments.takeAssignment.answerReview.total}</span>
                        </h1>
                    </div>
                </div>

                {!canViewResult ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.student.assignments.takeAssignment.answerReview.notAllowToViewResult.title}</CardTitle>
                            <CardDescription>
                                {t.student.assignments.takeAssignment.answerReview.notAllowToViewResult.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>{t.student.assignments.takeAssignment.answerReview.notAllowToViewResult.details.totalAnsweredQuestions} {answeredCount}</p>
                            <p>{t.student.assignments.takeAssignment.answerReview.notAllowToViewResult.details.totalQuestions} {totalCount}</p>
                            <p>{t.student.assignments.takeAssignment.answerReview.notAllowToViewResult.details.totalCorrectAnswers} {correctCount}/{totalCount}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="mb-3 text-center">
                                <CardTitle>{t.student.assignments.takeAssignment.answerReview.allowToViewResult.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="all" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="all">
                                            {t.student.assignments.takeAssignment.answerReview.allowToViewResult.tabsView.total} ({questionAnswers.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="correct">
                                            {t.student.assignments.takeAssignment.answerReview.allowToViewResult.tabsView.correct} ({answerReviewTabs.correctAnswers.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="incorrect">
                                            {t.student.assignments.takeAssignment.answerReview.allowToViewResult.tabsView.incorrect} ({answerReviewTabs.incorrectAnswers.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="space-y-4 mt-6">
                                        {questionAnswers.map((answer) => (
                                            <div
                                                key={answer.questionId}
                                                className="border border-border rounded-lg p-4"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    {answer.isCorrect ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        {getAnswerDisplayContent(answer).passageContent ? (
                                                            <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
                                                                <FormattedContent
                                                                    html={getAnswerDisplayContent(answer).passageContent}
                                                                    className="text-sm leading-6 text-foreground"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        {getAnswerDisplayContent(answer).questionContent ? (
                                                            <FormattedContent
                                                                html={getAnswerDisplayContent(answer).questionContent}
                                                                className="font-medium text-foreground"
                                                            />
                                                        ) : (
                                                            <p className="font-medium text-foreground">Câu hỏi</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <ChoiceOptionsReview answer={answer} showSelectionStatus />
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="correct" className="space-y-4 mt-6">
                                        {answerReviewTabs.correctAnswers.map((answer) => (
                                            <div
                                                key={answer.questionId}
                                                className="border border-green-200 bg-green-50 rounded-lg p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        {getAnswerDisplayContent(answer).passageContent ? (
                                                            <div className="mb-3 rounded-lg border border-green-200 dark:border-green-900 bg-white/70 dark:bg-slate-800/70 p-3">
                                                                <FormattedContent
                                                                    html={getAnswerDisplayContent(answer).passageContent}
                                                                    className="text-sm leading-6 text-foreground"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        {getAnswerDisplayContent(answer).questionContent ? (
                                                            <FormattedContent
                                                                html={getAnswerDisplayContent(answer).questionContent}
                                                                className="font-medium text-foreground"
                                                            />
                                                        ) : (
                                                            <p className="font-medium text-foreground">Câu hỏi</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <ChoiceOptionsReview answer={answer} showSelectionStatus />
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="incorrect" className="space-y-4 mt-6">
                                        {answerReviewTabs.incorrectAnswers.map((answer) => (
                                            <div
                                                key={answer.questionId}
                                                className="border border-red-200 bg-red-50 rounded-lg p-4"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        {getAnswerDisplayContent(answer).passageContent ? (
                                                            <div className="mb-3 rounded-lg border border-red-200 dark:border-red-900 bg-white/80 dark:bg-slate-800/80 p-3">
                                                                <FormattedContent
                                                                    html={getAnswerDisplayContent(answer).passageContent}
                                                                    className="text-sm leading-6 text-foreground"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        {getAnswerDisplayContent(answer).questionContent ? (
                                                            <FormattedContent
                                                                html={getAnswerDisplayContent(answer).questionContent}
                                                                className="font-medium text-foreground"
                                                            />
                                                        ) : (
                                                            <p className="font-medium text-foreground">Câu hỏi</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <ChoiceOptionsReview answer={answer} showSelectionStatus />
                                            </div>
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="flex gap-3 justify-center">
                    <Link href="/student/quiz">
                        <Button variant="outline">Quay lại danh sách</Button>
                    </Link>
                    <Link href={`/student/quiz/${assignmentId}/take`}>
                        <Button>Làm lại bài tập</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

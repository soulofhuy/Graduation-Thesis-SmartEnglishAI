'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react'
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
import { normalizeHtmlToText } from '@/lib/show-question-helpers/normalize-html-to-text'
import { toast } from 'sonner'
import {
    getAssignmentByIdForStudentToDoTest,
    type StudentAssignmentDetailResponse,
} from '@/services/student/assignments'
import {
    getLatestAttemptForStudent,
    type StudentAttempt,
    type StudentAttemptResultQuestionAnswer,
} from '@/services/student/attempts'
import { cn } from '@/lib/utils'

const toNumber = (value: string | null, fallback: number) => {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const getScoreFeedback = (score: number) => {
    if (score >= 80) return 'Tuyệt vời!'
    if (score >= 60) return 'Tốt!'
    if (score >= 40) return 'Chưa tốt'
    return 'Cần cố gắng hơn'
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

const hasRenderableContent = (value?: string | null) =>
    normalizeHtmlToText(value).length > 0

function FormattedContent({
    html,
    className,
}: {
    html?: string | null
    className?: string
}) {
    if (!hasRenderableContent(html)) {
        return null
    }

    return (
        <div
            className={cn(
                '[&_p]:my-0 [&_strong]:font-semibold [&_b]:font-semibold [&_u]:underline [&_s]:line-through [&_em]:italic [&_i]:italic',
                className,
            )}
            dangerouslySetInnerHTML={{ __html: html as string }}
        />
    )
}

const getAnswerDisplayContent = (answer: StudentAttemptResultQuestionAnswer) => {
    const questionContent = hasRenderableContent(answer.questionContent)
        ? answer.questionContent
        : null
    const taskContent = hasRenderableContent(answer.taskContent)
        ? answer.taskContent
        : null
    const passageContent = hasRenderableContent(answer.passageContent)
        ? answer.passageContent
        : null

    return {
        questionContent: questionContent ?? taskContent,
        passageContent,
    }
}

const answerColumns = ['A', 'B', 'C', 'D'] as const

function ChoiceOptionsReview({
    answer,
}: {
    answer: StudentAttemptResultQuestionAnswer
}) {
    if (!answer.choiceOptions?.length) {
        return null
    }

    return (
        <div className="ml-8 mt-3 grid gap-2">
            {answer.choiceOptions.map((choice, index) => {
                const marker = answerColumns[index] ?? String(index + 1)

                return (
                    <div
                        key={choice.choiceId}
                        className={cn(
                            'rounded border p-3 text-sm',
                            choice.isSelected && choice.isCorrect && 'border-green-300 bg-green-50',
                            choice.isSelected && !choice.isCorrect && 'border-red-300 bg-red-50',
                            !choice.isSelected && choice.isCorrect && 'border-emerald-300 bg-emerald-50',
                            !choice.isSelected && !choice.isCorrect && 'border-border bg-muted/30',
                        )}
                    >
                        <div className="flex items-start gap-2">
                            <span className="font-semibold text-foreground">{marker}.</span>
                            <FormattedContent
                                html={choice.choiceContent}
                                className="text-foreground [&_p]:my-0"
                            />
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                            {choice.isSelected ? 'Bạn đã chọn' : 'Không chọn'}
                            {choice.isCorrect ? ' • Đáp án đúng' : ''}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default function QuizResultsPage() {
    const params = useParams<{ id: string }>()
    const assignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id
    const searchParams = useSearchParams()
    const fallbackAnswered = toNumber(searchParams.get('answered'), 0)
    const fallbackTotal = toNumber(searchParams.get('total'), 0)
    const { accessToken, isHydrated } = useAuth()
    useLanguage()

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
                const message =
                    error instanceof Error ? error.message : 'Không thể tải kết quả bài làm'
                toast.error(message)
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
    const score = attempt?.result?.score ?? resultSummary.score
    const correctCount = attempt?.result?.correctCount ?? resultSummary.correctCount
    const incorrectCount = Math.max(totalCount - correctCount, 0)

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
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách bài tập
                    </Button>
                </Link>

                <Card className="overflow-hidden">
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            <div>
                                <p className="text-muted-foreground mb-2">Kết quả của bạn</p>
                                <h1 className={`text-6xl font-bold ${getScoreColor(score)}`}>
                                    {Math.round(score)}/100
                                </h1>
                            </div>

                            <div>
                                <p className="text-4xl font-bold text-foreground mb-2">
                                    {Math.round(score)}%
                                </p>
                                <p className="text-xl text-muted-foreground">
                                    {getScoreFeedback(score)}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-6">
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground mb-1">Tổng câu</p>
                                    <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4">
                                    <p className="text-sm text-green-700 mb-1">Đúng</p>
                                    <p className="text-2xl font-bold text-green-700">{correctCount}</p>
                                </div>
                                <div className="bg-red-100 rounded-lg p-4">
                                    <p className="text-sm text-red-700 mb-1">Sai</p>
                                    <p className="text-2xl font-bold text-red-700">{incorrectCount}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {!canViewResult ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Kết quả đã được lưu</CardTitle>
                            <CardDescription>
                                Bài kiểm tra này không cho phép xem chi tiết từng câu trả lời.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Số câu đã làm: {answeredCount}</p>
                            <p>Tổng số câu: {totalCount}</p>
                            <p>Điểm đạt được: {Math.round(score)}/100</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Tỉ lệ trả lời đúng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-primary">
                                        {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Thời gian làm bài</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <p className="text-3xl font-bold text-primary">Đã nộp</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Trạng thái</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-xl font-bold ${getScoreColor(score)}`}>
                                        {Math.round(score) >= 50 ? 'Đạt' : 'Không đạt'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Xem lại câu trả lời</CardTitle>
                                <CardDescription>
                                    Kiểm tra lại các câu trả lời của bạn
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="all" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="all">Tất cả ({questionAnswers.length})</TabsTrigger>
                                        <TabsTrigger value="correct">
                                            Đúng ({answerReviewTabs.correctAnswers.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="incorrect">
                                            Sai ({answerReviewTabs.incorrectAnswers.length})
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

                                                {!answer.isCorrect && (
                                                    <div className="space-y-2 ml-8">
                                                        <div className="bg-red-50 rounded p-3">
                                                            <p className="text-sm text-red-700">
                                                                <strong>Câu trả lời của bạn:</strong>{' '}
                                                                <FormattedContent
                                                                    html={answer.selectedChoiceContent}
                                                                    className="inline [&_p]:inline"
                                                                />
                                                            </p>
                                                        </div>
                                                        <div className="bg-green-50 rounded p-3">
                                                            <p className="text-sm text-green-700">
                                                                <strong>Đáp án đúng:</strong>{' '}
                                                                {answer.correctChoiceContent ? (
                                                                    <FormattedContent
                                                                        html={answer.correctChoiceContent}
                                                                        className="inline [&_p]:inline"
                                                                    />
                                                                ) : (
                                                                    'Chưa có đáp án đúng'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {answer.isCorrect && (
                                                    <div className="ml-8 bg-green-50 rounded p-3">
                                                        <p className="text-sm text-green-700">
                                                            <strong>Câu trả lời của bạn:</strong>{' '}
                                                            <FormattedContent
                                                                html={answer.selectedChoiceContent}
                                                                className="inline [&_p]:inline"
                                                            />
                                                        </p>
                                                    </div>
                                                )}

                                                <ChoiceOptionsReview answer={answer} />
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
                                                            <div className="mb-3 rounded-lg border border-green-200 bg-white/70 p-3">
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

                                                <ChoiceOptionsReview answer={answer} />
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
                                                            <div className="mb-3 rounded-lg border border-red-200 bg-white/80 p-3">
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
                                                <div className="space-y-2 ml-8">
                                                    <div className="bg-white rounded p-3 border border-red-200">
                                                        <p className="text-sm text-red-700">
                                                            <strong>Câu trả lời của bạn:</strong>{' '}
                                                            <FormattedContent
                                                                html={answer.selectedChoiceContent}
                                                                className="inline [&_p]:inline"
                                                            />
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded p-3 border border-green-200">
                                                        <p className="text-sm text-green-700">
                                                            <strong>Đáp án đúng:</strong>{' '}
                                                            {answer.correctChoiceContent ? (
                                                                <FormattedContent
                                                                    html={answer.correctChoiceContent}
                                                                    className="inline [&_p]:inline"
                                                                />
                                                            ) : (
                                                                'Chưa có đáp án đúng'
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <ChoiceOptionsReview answer={answer} />
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

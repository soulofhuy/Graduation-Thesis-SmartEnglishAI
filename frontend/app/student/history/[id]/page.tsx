'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock3, Eye, Info, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
    FormattedContent,
} from '@/lib/view-details-assignment-helpers/format-content'
import { getDurationMinutes } from '@/lib/view-details-assignment-helpers/get-duration-minutes'
import { getAnswerDisplayContent } from '@/lib/view-details-assignment-helpers/get-answer-display-content'
import { answerColumns } from '@/lib/view-details-assignment-helpers/choice-constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    getFullAttemptHistoryOfStudentByAssignmentId,
    type StudentAttemptHistoryItem,
    type StudentAttemptHistoryQuestionAnswer,
} from '@/services/student/assignments'
import { dateTimeFormat } from '@/lib/format'
import { useLanguage } from '@/components/language-provider'

function ChoiceOptionsReview({
    answer,
}: {
    answer: StudentAttemptHistoryQuestionAnswer
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
                    </div>
                )
            })}
        </div>
    )
}

export default function StudentHistoryDetailPage() {
    const { accessToken, isHydrated } = useAuth()
    const { t } = useLanguage()
    const params = useParams<{ id: string }>()
    const assignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const [isLoading, setIsLoading] = useState(false)
    const [history, setHistory] = useState<StudentAttemptHistoryItem[]>([])

    useEffect(() => {
        if (!isHydrated || !accessToken || !assignmentId) {
            return
        }

        const fetchHistory = async () => {
            setIsLoading(true)
            try {
                const response = await getFullAttemptHistoryOfStudentByAssignmentId(
                    accessToken,
                    assignmentId
                )
                setHistory(response.data)
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Khong the tai lich su lam bai chi tiet'
                toast.error(message)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchHistory()
    }, [accessToken, assignmentId, isHydrated])

    const assignmentInfo = useMemo(() => history[0]?.assignment, [history])

    if (!isHydrated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Đang tải chi tiết lịch sử bài làm...</p>
            </div>
        )
    }

    if (!accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Vui lòng đăng nhập để xem chi tiết</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <Link href="/student/history">
                <Button variant="outline" className="mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại lịch sử
                </Button>
            </Link>

            <Card>
                <CardHeader className="mb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        {t.student.assignments.viewHistoryDetails.assignmentInfo.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">{t.student.assignments.viewHistoryDetails.assignmentInfo.statistic.assignmentTitle}</p>
                            <p className="mt-3 text-base font-semibold">{assignmentInfo?.title}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">{t.student.assignments.viewHistoryDetails.assignmentInfo.statistic.assignmentTotalAttempts}</p>
                            <p className="mt-3 text-xl font-semibold">{history.length}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">{t.student.assignments.viewHistoryDetails.assignmentInfo.statistic.assignmentDeadline}</p>
                            <p className="mt-3 text-base font-semibold">{dateTimeFormat(assignmentInfo?.dueDate ?? '')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="mb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        {t.student.assignments.viewHistoryDetails.assginmentHistory.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnAttempt}</TableHead>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnStatus}</TableHead>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnStartedAt}</TableHead>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnSubmittedAt}</TableHead>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnTotalTime}</TableHead>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnTotalAssignmentQuestions}</TableHead>
                                <TableHead className="text-center">{t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnResult}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        Chưa có dữ liệu lịch sử làm bài
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((attempt, index) => (
                                    <TableRow key={attempt.id}>
                                        <TableCell className="text-center font-medium">#{history.length - index}</TableCell>
                                        <TableCell className="text-center">
                                            {attempt.status === 'SUBMITTED' ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                    Đã nộp
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                                                    Đang làm
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{dateTimeFormat(attempt.startedAt ?? '')}</TableCell>
                                        <TableCell className="text-center">{dateTimeFormat(attempt.submittedAt ?? '')}</TableCell>
                                        <TableCell className="text-center">
                                            {getDurationMinutes({
                                                startedAt: attempt.startedAt,
                                                submittedAt: attempt.submittedAt,
                                            })}
                                        </TableCell>
                                        <TableCell className="text-center">{attempt._count?.answers ?? 0}</TableCell>
                                        <TableCell className="text-center">
                                            {attempt.result ? (
                                                <span className="font-semibold text-primary">
                                                    {attempt.result.correctCount}/{attempt.result.totalCount} ({attempt.result.score}%)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-muted-foreground">
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Chưa có
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {history
                .filter((attempt) => attempt.status === 'SUBMITTED')
                .map((attempt, index) => {
                    const questionAnswers = attempt.result?.questionAnswers ?? []

                    return (
                        <Card key={`review-${attempt.id}`}>
                            <CardHeader className="mb-3">
                                <CardTitle>{t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.title} #{history.length - index}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border p-3">
                                        <p className="text-sm text-muted-foreground">{t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.result}</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {attempt.result?.correctCount ?? 0}/{attempt.result?.totalCount ?? 0}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-sm text-muted-foreground">{t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.submittedAt}</p>
                                        <p className="text-base font-semibold">
                                            {dateTimeFormat(attempt.submittedAt ?? '')}
                                        </p>
                                    </div>
                                </div>

                                {assignmentInfo?.canViewResult ? (
                                    questionAnswers.length > 0 ? (
                                        <div className="space-y-4">
                                            {questionAnswers.map((answer, answerIndex) => (
                                                <div
                                                    key={`${attempt.id}-${answer.questionId}-${answerIndex}`}
                                                    className="rounded-lg border p-4"
                                                >
                                                    <div className="mb-3 flex items-start gap-3">
                                                        {answer.isCorrect ? (
                                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                                        ) : (
                                                            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                                        )}
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                Câu {answerIndex + 1}
                                                            </p>
                                                            {getAnswerDisplayContent(answer).passageContent ? (
                                                                <div className="rounded-lg border bg-muted/30 p-3">
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
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Không có dữ liệu câu trả lời cho lần làm này.
                                        </p>
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Bạn vẫn xem được lịch sử nộp bài nhưng không xem được chi tiết từng câu.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
        </div>
    )
}

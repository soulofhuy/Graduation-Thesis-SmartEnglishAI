'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock3, Eye, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { dateTimeFormat } from '@/lib/format'
import { ChoiceOptionsReview } from '@/lib/view-details-assignment-helpers/choice-options-preview'
import { FormattedContent } from '@/lib/view-details-assignment-helpers/format-content'
import { getAnswerDisplayContent } from '@/lib/view-details-assignment-helpers/get-answer-display-content'
import { getDurationMinutes } from '@/lib/view-details-assignment-helpers/get-duration-minutes'
import type { StudentAttemptHistoryItem } from '@/services/student/assignments'
import { useLanguage } from './language-provider'

type SummaryCard = {
    label: ReactNode
    value: ReactNode
}

type AttemptHistoryDetailViewProps = {
    backHref: string
    backLabel: ReactNode
    assignmentTitle: ReactNode
    canViewResult: boolean
    summaryCards?: SummaryCard[]
    historyTitle: ReactNode
    history: StudentAttemptHistoryItem[]
    tableLabels: {
        attempt: ReactNode
        status: ReactNode
        startedAt: ReactNode
        submittedAt: ReactNode
        totalTime: ReactNode
        totalQuestions: ReactNode
        result: ReactNode
    }
    statusLabels: {
        submitted: ReactNode
        inProgress: ReactNode
        noResult: ReactNode
    }
    detailLabels: {
        reviewTitlePrefix: ReactNode
        result: ReactNode
        submittedAt: ReactNode
        question: ReactNode
        noQuestionAnswers: ReactNode
        noDetailPermission: ReactNode
    }
    emptyLabels: {
        noHistory: ReactNode
    }
}

export function AttemptHistoryDetailView({
    backHref,
    backLabel,
    assignmentTitle,
    canViewResult,
    summaryCards = [],
    historyTitle,
    history,
    tableLabels,
    statusLabels,
    detailLabels,
    emptyLabels,
}: AttemptHistoryDetailViewProps) {

    const { language, t } = useLanguage()

    return (
        <div className="p-4 md:p-8 space-y-6">
            <Link href={backHref}>
                <Button variant="outline" className="mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                </Button>
            </Link>

            <Card>
                <CardHeader className="mb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        {assignmentTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {summaryCards.map((card, index) => (
                            <div key={`${index}-${String(card.label)}`} className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                <div className="mt-3 text-base font-semibold">{card.value}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="mb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        {historyTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">{tableLabels.attempt}</TableHead>
                                <TableHead className="text-center">{tableLabels.status}</TableHead>
                                <TableHead className="text-center">{tableLabels.startedAt}</TableHead>
                                <TableHead className="text-center">{tableLabels.submittedAt}</TableHead>
                                <TableHead className="text-center">{tableLabels.totalTime}</TableHead>
                                <TableHead className="text-center">{tableLabels.totalQuestions}</TableHead>
                                <TableHead className="text-center">{tableLabels.result}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        {emptyLabels.noHistory}
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
                                                    {statusLabels.submitted}
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                                                    {statusLabels.inProgress}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{dateTimeFormat(attempt.startedAt ?? '')}</TableCell>
                                        <TableCell className="text-center">{dateTimeFormat(attempt.submittedAt ?? '')}</TableCell>
                                        <TableCell className="text-center">
                                            {getDurationMinutes({
                                                startedAt: attempt.startedAt,
                                                submittedAt: attempt.submittedAt,
                                                language
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
                                                    {statusLabels.noResult}
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
                                <CardTitle>
                                    {detailLabels.reviewTitlePrefix} #{history.length - index}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border p-3">
                                        <p className="text-sm text-muted-foreground">{detailLabels.result}</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {attempt.result?.correctCount ?? 0}/{attempt.result?.totalCount ?? 0}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-sm text-muted-foreground">{detailLabels.submittedAt}</p>
                                        <p className="text-base font-semibold">
                                            {dateTimeFormat(attempt.submittedAt ?? '')}
                                        </p>
                                    </div>
                                </div>

                                {canViewResult ? questionAnswers.length > 0 ? (
                                    <div className="space-y-4">
                                        {questionAnswers.map((answer, answerIndex) => {
                                            const answerContent = getAnswerDisplayContent(answer)

                                            return (
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
                                                                {detailLabels.question} {answerIndex + 1}
                                                            </p>
                                                            {answerContent.passageContent ? (
                                                                <div className="rounded-lg border bg-muted/30 p-3">
                                                                    <FormattedContent
                                                                        html={answerContent.passageContent}
                                                                        className="text-sm leading-6 text-foreground"
                                                                    />
                                                                </div>
                                                            ) : null}

                                                            {answerContent.questionContent ? (
                                                                <FormattedContent
                                                                    html={answerContent.questionContent}
                                                                    className="font-medium text-foreground"
                                                                />
                                                            ) : (
                                                                <p className="font-medium text-foreground">{t.common.questionLabel}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <ChoiceOptionsReview answer={answer} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {detailLabels.noQuestionAnswers}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {detailLabels.noDetailPermission}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
        </div>
    )
}
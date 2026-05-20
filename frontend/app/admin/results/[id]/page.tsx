'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { AttemptHistoryDetailView } from '@/components/attempt-history-detail-view'
import { useLanguage } from '@/components/language-provider'
import { dateTimeFormat } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getStudentResults, type AdminStudentAssignmentDetail } from '@/services/admin/results'
import type { StudentAttemptHistoryItem } from '@/services/student/assignments'

export default function AdminResultDetailPage() {
    const params = useParams<{ id: string }>()
    const assignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id
    const searchParams = useSearchParams()
    const studentId = searchParams.get('studentId')
    const { accessToken, isHydrated } = useAuth()
    const { t, language } = useLanguage()

    const [detail, setDetail] = useState<AdminStudentAssignmentDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!isHydrated || !accessToken || !assignmentId || !studentId) {
            return
        }

        const fetchDetail = async () => {
            setIsLoading(true)
            try {
                const response = await getStudentResults(
                    accessToken,
                    assignmentId,
                    studentId
                )

                setDetail(response)
            } catch (error) {
                const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setIsLoading(false)
            }
        }

        void fetchDetail()
    }, [accessToken, assignmentId, isHydrated, language, studentId])

    const history = useMemo(() => {
        if (!detail) return []
        return detail.attempts as unknown as StudentAttemptHistoryItem[]
    }, [detail])

    if (!isHydrated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">{t.common.loading}</p>
            </div>
        )
    }

    if (!accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">{getToastMessage('invalidToken', language)}</p>
            </div>
        )
    }

    if (!assignmentId || !studentId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Thiếu thông tin bài tập hoặc học sinh</p>
            </div>
        )
    }

    const summaryCards = [
        {
            label: t.admin.resultManagement.viewResultDetails.summaryCards.fieldClass,
            value: detail?.class.name ?? '-',
        },
        {
            label: t.admin.resultManagement.viewResultDetails.summaryCards.fieldClassCode,
            value: detail?.class.classCode ?? '-',
        },
        {
            label: t.admin.resultManagement.viewResultDetails.summaryCards.fieldStudentName,
            value: detail?.student.profile ? `${detail.student.profile.firstName ?? ''} ${detail.student.profile.lastName ?? ''}`.trim() || detail?.student.email : detail?.student.email ?? '-',
        },
        {
            label: t.admin.resultManagement.viewResultDetails.summaryCards.fieldEmail,
            value: detail?.student.email ?? '-',
        },
        {
            label: t.admin.resultManagement.viewResultDetails.summaryCards.fieldDueDate,
            value: dateTimeFormat(detail?.assignment.dueDate ?? ''),
        },
        {
            label: t.admin.resultManagement.viewResultDetails.summaryCards.fieldSubmissionCount,
            value: history.length,
        },
    ]

    return (
        <AttemptHistoryDetailView
            backHref="/admin/results"
            backLabel={t.common.back}
            assignmentTitle={detail?.assignment.title ?? 'Assignment'}
            canViewResult={true}
            summaryCards={summaryCards}
            historyTitle={t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.title}
            history={history}
            tableLabels={{
                attempt: '#',
                status: t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.fieldStatus,
                startedAt: t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.fieldStartTime,
                submittedAt: t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.fieldSubmittedTime,
                totalTime: t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.fieldTotalTime,
                totalQuestions: t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.fieldWrongAnswerCount,
                result: t.admin.resultManagement.viewResultDetails.historyOfSubissionsSummary.fieldResult
            }}
            statusLabels={{ submitted: 'Nộp', inProgress: 'Đang làm', noResult: 'Không có điểm' }}
            detailLabels={{ reviewTitlePrefix: t.admin.resultManagement.viewResultDetails.submissionDetails.title, result: t.admin.resultManagement.viewResultDetails.submissionDetails.fieldResult, submittedAt: t.admin.resultManagement.viewResultDetails.submissionDetails.fieldSubmittedAt, question: t.admin.resultManagement.viewResultDetails.submissionDetails.fieldQuestion, noQuestionAnswers: t.admin.resultManagement.viewResultDetails.submissionDetails.noQuestionAnswers, noDetailPermission: t.admin.resultManagement.viewResultDetails.submissionDetails.noDetailPermission }}
            emptyLabels={{ noHistory: 'Chưa có lịch sử' }}
        />
    )
}

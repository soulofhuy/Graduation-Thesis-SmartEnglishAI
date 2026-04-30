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
import {
    getStudentAssignmentProgressDetail,
    type StudentAssignmentDetail,
} from '@/services/teacher/assignment-student-results'
import type { StudentAttemptHistoryItem } from '@/services/student/assignments'

export default function TeacherResultDetailPage() {
    const params = useParams<{ id: string }>()
    const assignmentId = Array.isArray(params?.id) ? params.id[0] : params?.id
    const searchParams = useSearchParams()
    const studentId = searchParams.get('studentId')
    const { accessToken, isHydrated } = useAuth()
    const { t, language } = useLanguage()

    const [detail, setDetail] = useState<StudentAssignmentDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!isHydrated || !accessToken || !assignmentId || !studentId) {
            return
        }

        const fetchDetail = async () => {
            setIsLoading(true)
            try {
                const response = await getStudentAssignmentProgressDetail(
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
        if (!detail) {
            return []
        }

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
            label: t.teacher.results.viewAssignmentResultDetails.statistic.labelClass,
            value: detail?.class.name ?? '-',
        },
        {
            label: t.teacher.results.viewAssignmentResultDetails.statistic.labelClassCode,
            value: detail?.class.classCode ?? '-',
        },
        {
            label: t.teacher.results.viewAssignmentResultDetails.statistic.labelStudent,
            value: detail?.student.profile ? `${detail.student.profile.firstName ?? ''} ${detail.student.profile.lastName ?? ''}`.trim() || detail.student.email : detail?.student.email ?? '-',
        },
        {
            label: t.teacher.results.viewAssignmentResultDetails.statistic.labelEmail,
            value: detail?.student.email ?? '-',
        },
        {
            label: t.teacher.results.viewAssignmentResultDetails.statistic.labelDueDate,
            value: dateTimeFormat(detail?.assignment.dueDate ?? ''),
        },
        {
            label: t.teacher.results.viewAssignmentResultDetails.statistic.labelSubmissionCount,
            value: history.length,
        },
    ]

    return (
        <AttemptHistoryDetailView
            backHref="/teacher/results"
            backLabel="Quay lại kết quả"
            assignmentTitle={t.student.assignments.viewHistoryDetails.assignmentInfo.title}
            canViewResult={true}
            summaryCards={summaryCards}
            historyTitle={t.student.assignments.viewHistoryDetails.assginmentHistory.title}
            history={history}
            tableLabels={{
                attempt: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnAttempt,
                status: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnStatus,
                startedAt: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnStartedAt,
                submittedAt: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnSubmittedAt,
                totalTime: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnTotalTime,
                totalQuestions: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnTotalAssignmentQuestions,
                result: t.student.assignments.viewHistoryDetails.assginmentHistory.tableView.columnResult,
            }}
            statusLabels={{
                submitted: 'Đã nộp',
                inProgress: 'Đang làm',
                noResult: 'Chưa có',
            }}
            detailLabels={{
                reviewTitlePrefix: t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.title,
                result: t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.result,
                submittedAt: t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.submittedAt,
                question: t.student.assignments.viewHistoryDetails.assignmentHistoryDetails.question,
                noQuestionAnswers: 'Không có dữ liệu câu trả lời cho lần làm này.',
                noDetailPermission: 'Bạn không có quyền xem chi tiết này.',
            }}
            emptyLabels={{
                noHistory: 'Chưa có dữ liệu lịch sử làm bài',
            }}
        />
    )
}
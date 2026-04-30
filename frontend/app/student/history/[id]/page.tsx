'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { AttemptHistoryDetailView } from '@/components/attempt-history-detail-view'
import {
    getFullAttemptHistoryOfStudentByAssignmentId,
    type StudentAttemptHistoryItem,
} from '@/services/student/assignments'
import { dateTimeFormat } from '@/lib/format'
import { useLanguage } from '@/components/language-provider'

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

    const summaryCards = [
        {
            label: t.student.assignments.viewHistoryDetails.assignmentInfo.statistic.assignmentTitle,
            value: assignmentInfo?.title ?? '-',
        },
        {
            label: t.student.assignments.viewHistoryDetails.assignmentInfo.statistic.assignmentTotalAttempts,
            value: history.length,
        },
        {
            label: t.student.assignments.viewHistoryDetails.assignmentInfo.statistic.assignmentDeadline,
            value: dateTimeFormat(assignmentInfo?.dueDate ?? ''),
        },
    ]

    return (
        <AttemptHistoryDetailView
            backHref="/student/history"
            backLabel="Quay lại lịch sử"
            assignmentTitle={t.student.assignments.viewHistoryDetails.assignmentInfo.title}
            canViewResult={assignmentInfo?.canViewResult ?? false}
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
                noDetailPermission: 'Bạn vẫn xem được lịch sử nộp bài nhưng không xem được chi tiết từng câu.',
            }}
            emptyLabels={{
                noHistory: 'Chưa có dữ liệu lịch sử làm bài',
            }}
        />
    )
}

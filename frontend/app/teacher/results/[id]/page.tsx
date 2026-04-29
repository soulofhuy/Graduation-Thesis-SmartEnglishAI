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
    const { language } = useLanguage()

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
                <p className="text-muted-foreground">Đang tải chi tiết kết quả...</p>
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

    if (!assignmentId || !studentId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Thiếu thông tin bài tập hoặc học sinh</p>
            </div>
        )
    }

    const assignmentTitle = detail?.assignment.title ?? 'Chi tiết kết quả'
    const summaryCards = [
        {
            label: 'Lớp học',
            value: detail?.class.name ?? '-',
        },
        {
            label: 'Mã lớp',
            value: detail?.class.classCode ?? '-',
        },
        {
            label: 'Học sinh',
            value:
                detail?.student.profile
                    ? `${detail.student.profile.firstName ?? ''} ${detail.student.profile.lastName ?? ''}`.trim() || detail.student.email
                    : detail?.student.email ?? '-',
        },
        {
            label: 'Email',
            value: detail?.student.email ?? '-',
        },
        {
            label: 'Hạn nộp',
            value: dateTimeFormat(detail?.assignment.dueDate ?? ''),
        },
        {
            label: 'Số lần làm',
            value: history.length,
        },
    ]

    return (
        <AttemptHistoryDetailView
            backHref="/teacher/results"
            backLabel="Quay lại kết quả"
            assignmentTitle={assignmentTitle}
            canViewResult={true}
            summaryCards={summaryCards}
            historyTitle="Lịch sử làm bài"
            history={history}
            tableLabels={{
                attempt: 'Lần làm',
                status: 'Trạng thái',
                startedAt: 'Bắt đầu lúc',
                submittedAt: 'Nộp lúc',
                totalTime: 'Tổng thời gian',
                totalQuestions: 'Tổng số câu',
                result: 'Kết quả',
            }}
            statusLabels={{
                submitted: 'Đã nộp',
                inProgress: 'Đang làm',
                noResult: 'Chưa có',
            }}
            detailLabels={{
                reviewTitlePrefix: 'Chi tiết lần làm',
                result: 'Kết quả',
                submittedAt: 'Thời điểm nộp',
                question: 'Câu hỏi',
                noQuestionAnswers: 'Không có dữ liệu câu trả lời cho lần làm này.',
                noDetailPermission: 'Bạn không có quyền xem chi tiết này.',
            }}
            emptyLabels={{
                noHistory: 'Chưa có dữ liệu lịch sử làm bài',
            }}
        />
    )
}
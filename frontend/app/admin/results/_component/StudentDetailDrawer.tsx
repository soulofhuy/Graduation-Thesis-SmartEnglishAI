'use client'

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { AttemptHistoryDetailView } from '@/components/attempt-history-detail-view'
import type { StudentSummary } from '@/services/admin/results'
import type { StudentAttemptHistoryItem } from '@/services/student/assignments'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    assignmentTitle?: string
    student?: StudentSummary | null
    loading: boolean
    history: StudentAttemptHistoryItem[]
}

export default function StudentDetailDrawer({ open, onOpenChange, assignmentTitle, student, loading, history }: Props) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <div className="flex items-center justify-between">
                        <DrawerTitle>{student ? student.name : 'Student'}</DrawerTitle>
                        <DrawerClose className="ml-2">Close</DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="p-4">
                    <AttemptHistoryDetailView
                        backHref="#"
                        backLabel="Back"
                        assignmentTitle={assignmentTitle ?? 'Assignment'}
                        canViewResult={true}
                        summaryCards={[]}
                        historyTitle="Lịch sử làm"
                        history={history}
                        tableLabels={{
                            attempt: '#',
                            status: 'Trạng thái',
                            startedAt: 'Bắt đầu',
                            submittedAt: 'Nộp',
                            totalTime: 'Thời gian',
                            totalQuestions: 'Số câu',
                            result: 'Kết quả'
                        }}
                        statusLabels={{ submitted: 'Nộp', inProgress: 'Đang làm', noResult: 'Không có điểm' }}
                        detailLabels={{ reviewTitlePrefix: 'Bài làm', result: 'Kết quả', submittedAt: 'Nộp lúc', question: 'Câu', noQuestionAnswers: 'Không có dữ liệu', noDetailPermission: 'Không có quyền' }}
                        emptyLabels={{ noHistory: 'Chưa có lịch sử' }}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

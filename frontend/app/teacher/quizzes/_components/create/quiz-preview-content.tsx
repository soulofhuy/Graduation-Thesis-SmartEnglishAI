'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import type { CreateAssignmentInput, TaskType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface QuizPreviewContentProps {
    payload: CreateAssignmentInput | null
}

function FormattedHtml({
    html,
    className
}: {
    html?: string
    className?: string
}) {
    if (!html?.trim()) {
        return null
    }

    return (
        <div
            className={cn(
                '[&_p]:my-0 [&_strong]:font-semibold [&_b]:font-semibold [&_u]:underline [&_s]:line-through [&_em]:italic [&_i]:italic',
                className
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

export function QuizPreviewContent({ payload }: QuizPreviewContentProps) {
    const { t } = useLanguage()

    if (!payload) {
        return null
    }

    const getTaskTypeLabel = (taskType: TaskType) => {
        const labels = t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue
        return labels[taskType] || taskType
    }

    const hasNoData =
        !payload.title?.trim() &&
        !payload.tasks?.length

    if (hasNoData) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có dữ liệu để xem trước. Vui lòng tạo bài kiểm tra!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-3">
                <div>
                    <h2 className="text-2xl font-bold">{payload.title}</h2>
                    {payload.description && (
                        <FormattedHtml
                            html={payload.description}
                            className="text-muted-foreground mt-2"
                        />
                    )}
                </div>

                <div className="flex gap-2 flex-wrap">
                    {payload.dueDate && (
                        <Badge variant="secondary">
                            Hạn chót: {new Date(payload.dueDate).toLocaleDateString('vi-VN')}
                        </Badge>
                    )}
                    {payload.isPublic && (
                        <Badge variant="outline">Công khai</Badge>
                    )}
                    {payload.isSingleAttempt && (
                        <Badge variant="outline">Chỉ một lần làm</Badge>
                    )}
                </div>
            </div>

            <Separator />

            {/* Tasks */}
            <div className="space-y-4">
                {payload.tasks?.map((task, taskIndex) => (
                    <Card key={taskIndex} className="p-4 space-y-4">
                        {/* Task Header */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold">Task {taskIndex + 1}</h3>
                                <Badge>{getTaskTypeLabel(task.taskType as TaskType)}</Badge>
                            </div>
                            <FormattedHtml
                                html={task.taskContent}
                                className="text-base"
                            />
                        </div>

                        {/* Shared Passage */}
                        {task.passages && task.passages.length > 0 && (
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <p className="text-sm font-semibold text-muted-foreground">
                                    Đoạn văn:
                                </p>
                                <FormattedHtml
                                    html={task.passages[0].passageContent}
                                    className="text-base leading-relaxed"
                                />
                            </div>
                        )}

                        {/* Questions */}
                        <div className="space-y-4 pt-2">
                            {task.questions?.map((question, qIndex) => (
                                <div
                                    key={qIndex}
                                    className="border-l-4 border-primary pl-4 py-2 space-y-3"
                                >
                                    {/* Question Content */}
                                    {question.questionContent && (
                                        <div>
                                            <p className="font-medium text-sm text-muted-foreground">
                                                Câu {qIndex + 1}:
                                            </p>
                                            <FormattedHtml
                                                html={question.questionContent}
                                                className="text-base"
                                            />
                                        </div>
                                    )}

                                    {/* Choices */}
                                    {question.choices && question.choices.length > 0 && (
                                        <div className="space-y-2 pl-4">
                                            {question.choices.map((choice, cIndex) => (
                                                <div
                                                    key={cIndex}
                                                    className={`flex items-start gap-3 p-2 rounded-md ${choice.isCorrect
                                                        ? 'bg-green-50 dark:bg-green-950'
                                                        : 'bg-gray-50 dark:bg-gray-900'
                                                        }`}
                                                >
                                                    {choice.isCorrect ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <div
                                                            className={`text-sm flex items-start gap-1 ${choice.isCorrect
                                                                ? 'font-semibold text-green-700 dark:text-green-300'
                                                                : 'text-gray-600 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            <span>{String.fromCharCode(65 + cIndex)})</span>
                                                            <FormattedHtml
                                                                html={choice.choiceContent}
                                                                className="[&_p]:inline"
                                                            />
                                                        </div>
                                                        {choice.isCorrect && (
                                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                ✓ Câu trả lời đúng
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Info */}
            <Separator />
            <div className="text-xs text-muted-foreground text-center">
                <p>
                    Tổng cộng: {payload.tasks?.length || 0} task,{' '}
                    {payload.tasks?.reduce((sum, task) => sum + (task.questions?.length || 0), 0) || 0}{' '}
                    câu hỏi
                </p>
            </div>
        </div>
    )
}

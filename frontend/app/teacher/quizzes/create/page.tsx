'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    createAssignmentBasicInfoSchema,
    createAssignmentPreviewSchema,
    createAssignmentQuestionListSchema,
    createAssignmentPayloadSchema,
    createAssignmentTaskListSchema,
} from '@/lib/validators/assignment'
import { createAssignment } from '@/services/teacher/assignments'
import {
    QuizBasicInfoSection,
    QuizQuestionsSection,
    QuizPreviewModal,
    QuizPreviewContent,
    buildCreateAssignmentPayload,
    createChoice,
    createId,
    createQuestion,
    createTask,
    type AssignmentFormData,
    type QuestionDraft,
    type TaskDraft
} from '../_components/create'
import type { TaskType } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

export default function CreateQuizPage() {
    const { t, language } = useLanguage()
    const { accessToken } = useAuth()
    const router = useRouter()

    const getTaskTitleFromType = (taskType: TaskType) => {
        const labels = t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue

        switch (taskType) {
            case 'PRONUNCIATION':
                return labels.PRONUNCIATION
            case 'WORD_STRESS':
                return labels.WORD_STRESS
            case 'SITUATIONAL_DIALOG':
                return labels.SITUATIONAL_DIALOG
            case 'MULTIPLE_CHOICE':
                return labels.MULTIPLE_CHOICE
            case 'CLOZE_PASSAGE':
                return labels.CLOZE_PASSAGE
            case 'READING_COMPREHENSION':
                return labels.READING_COMPREHENSION
            default:
                return labels.MULTIPLE_CHOICE
        }
    }

    const initialTask = createTask('MULTIPLE_CHOICE', getTaskTitleFromType('MULTIPLE_CHOICE'))
    const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'preview'>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [formData, setFormData] = useState<AssignmentFormData>({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        isPublic: false,
        isSingleAttempt: true,
        canViewResult: true,
    })
    const [tasks, setTasks] = useState<TaskDraft[]>([initialTask])
    const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask.id)
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialTask.questions[0].id)

    const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
    const selectedQuestion =
        selectedTask?.questions.find((question) => question.id === selectedQuestionId) ??
        selectedTask?.questions[0]

    const isPronunciationOrStress =
        selectedTask?.taskType === 'PRONUNCIATION' ||
        selectedTask?.taskType === 'WORD_STRESS'
    const isClozePassage = selectedTask?.taskType === 'CLOZE_PASSAGE'
    const isReadingComprehension = selectedTask?.taskType === 'READING_COMPREHENSION'
    const usesSharedPassage = isClozePassage || isReadingComprehension
    const showQuestionComposer = !isPronunciationOrStress && !isClozePassage

    useEffect(() => {
        if (!tasks.find((task) => task.id === selectedTaskId) && tasks[0]) {
            setSelectedTaskId(tasks[0].id)
        }
    }, [tasks, selectedTaskId])

    useEffect(() => {
        if (!selectedTask) {
            return
        }

        if (!selectedTask.questions.find((question) => question.id === selectedQuestionId)) {
            const fallbackQuestion = selectedTask.questions[0]
            if (fallbackQuestion) {
                setSelectedQuestionId(fallbackQuestion.id)
            }
        }
    }, [selectedTask, selectedQuestionId])

    const updateTask = (taskId: string, updater: (task: TaskDraft) => TaskDraft) => {
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updater(task) : task)))
    }

    const updateSelectedQuestion = (updater: (question: QuestionDraft) => QuestionDraft) => {
        if (!selectedTask || !selectedQuestion) {
            return
        }

        updateTask(selectedTask.id, (oldTask) => ({
            ...oldTask,
            questions: oldTask.questions.map((question) =>
                question.id === selectedQuestion.id ? updater(question) : question
            ),
        }))
    }

    const getSharedPassageContent = (task: TaskDraft) => task.passages[0]?.passageContent ?? ''

    const updateSharedPassageContent = (taskId: string, passageContent: string) => {
        updateTask(taskId, (oldTask) => {
            const firstPassage = oldTask.passages[0]

            if (!firstPassage) {
                return {
                    ...oldTask,
                    passages: [
                        {
                            id: createId(),
                            passageContent,
                        },
                    ],
                }
            }

            return {
                ...oldTask,
                passages: [
                    {
                        ...firstPassage,
                        passageContent,
                    },
                ],
            }
        })
    }

    const payloadPreview = useMemo(() => {
        return buildCreateAssignmentPayload(formData, tasks)
    }, [formData, tasks])

    const canOpenPreview = useMemo(() => {
        return createAssignmentPreviewSchema(language).safeParse({
            title: formData.title,
            tasks: payloadPreview.tasks,
        }).success
    }, [formData.title, payloadPreview.tasks, language])

    const goToQuestionTab = () => {
        const basicValidation = createAssignmentBasicInfoSchema(language).safeParse(formData)
        if (!basicValidation.success) {
            toast.error(basicValidation.error.issues[0]?.message)
            return
        }

        setActiveTab('questions')
    }

    const submitCreateAssignment = async () => {
        if (!accessToken) {
            toast.error('Vui long dang nhap lai')
            return
        }

        const payloadValidation = createAssignmentPayloadSchema(language).safeParse(payloadPreview)
        if (!payloadValidation.success) {
            toast.error(payloadValidation.error.issues[0]?.message)
            return
        }

        setIsSubmitting(true)
        try {
            console.log('Payload for preview:', payloadPreview)
            const result = await createAssignment(accessToken, payloadPreview)
            toast.success(result.message || 'Tao de thi thanh cong')
            router.push('/teacher/quizzes')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Tao de thi that bai'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const topTabs = [
        { key: 'basic', label: t.teacher.assignments.createAssignment.tabAssignmentInfo.title },
        { key: 'questions', label: t.teacher.assignments.createAssignment.title },
        { key: 'preview', label: 'View preview' },
    ] as const

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back()
            return
        }

        router.push('/teacher/quizzes')
    }

    const handleAddTask = () => {
        const newTask = createTask('MULTIPLE_CHOICE', getTaskTitleFromType('MULTIPLE_CHOICE'))
        setTasks((prev) => [...prev, newTask])
        setSelectedTaskId(newTask.id)
        setSelectedQuestionId(newTask.questions[0].id)
    }

    const handleSelectTask = (taskId: string) => {
        setSelectedTaskId(taskId)

        const selected = tasks.find((task) => task.id === taskId)
        setSelectedQuestionId(selected?.questions[0]?.id ?? '')
    }

    // const handleEditTaskTitle = (taskId: string) => {
    //     const task = tasks.find((item) => item.id === taskId)
    //     if (!task) {
    //         return
    //     }

    //     const newTitle = window.prompt('Nhap ten task moi', task.taskTitle)
    //     if (!newTitle?.trim()) {
    //         return
    //     }

    //     updateTask(taskId, (oldTask) => ({
    //         ...oldTask,
    //         taskTitle: newTitle.trim(),
    //     }))
    // }

    const handleDeleteTask = (taskId: string) => {
        const nextTasks = tasks.filter((task) => task.id !== taskId)

        const taskListValidation = createAssignmentTaskListSchema(language).safeParse(nextTasks)
        if (!taskListValidation.success) {
            toast.error(taskListValidation.error.issues[0]?.message)
            return
        }

        setTasks(nextTasks)
    }

    const handleChangeTaskType = (taskId: string, taskType: TaskType) => {
        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            taskType,
            taskTitle: getTaskTitleFromType(taskType),
        }))
    }

    const handleChangeTaskDescription = (taskId: string, value: string) => {
        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            taskDescription: value,
        }))
    }

    const handleAddQuestion = (taskId: string) => {
        const newQuestion = createQuestion()
        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            questions: [...oldTask.questions, newQuestion],
        }))
        setSelectedQuestionId(newQuestion.id)
    }

    const handleSelectQuestion = (questionId: string) => {
        setSelectedQuestionId(questionId)
    }

    const handleDeleteSelectedQuestion = () => {
        if (!selectedTask || !selectedQuestion) {
            return
        }

        const nextQuestions = selectedTask.questions.filter(
            (question) => question.id !== selectedQuestion.id
        )

        const questionListValidation = createAssignmentQuestionListSchema(language).safeParse(nextQuestions)
        if (!questionListValidation.success) {
            toast.error(questionListValidation.error.issues[0]?.message)
            return
        }

        updateTask(selectedTask.id, (oldTask) => ({
            ...oldTask,
            questions: nextQuestions,
        }))
    }

    const handleChangeQuestionContent = (value: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            questionContent: value,
        }))
    }

    const handleAddChoice = () => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: [...question.choices, createChoice()],
        }))
    }

    const handleToggleCorrectChoice = (choiceId: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: question.choices.map((item) => ({
                ...item,
                isCorrect: item.id === choiceId,
            })),
        }))
    }

    const handleDeleteChoice = (choiceId: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: question.choices.filter((item) => item.id !== choiceId),
        }))
    }

    const handleChangeChoiceContent = (choiceId: string, value: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: question.choices.map((item) =>
                item.id === choiceId
                    ? { ...item, choiceContent: value }
                    : item
            ),
        }))
    }

    return (
        <div className="p-4 md:p-8 space-y-4 bg-muted/20 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGoBack}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-semibold">{t.teacher.assignments.createAssignment.title}</h1>
                </div>
            </div>

            <Card className="overflow-hidden py-0">
                <div className="border-b px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex gap-5 overflow-auto">
                                {topTabs.map((tab) => {
                                    const isActive = activeTab === tab.key
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${isActive
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground'
                                                }`}
                                            onClick={() => {
                                                if (tab.key === 'questions') {
                                                    goToQuestionTab()
                                                    return
                                                }

                                                if (tab.key === 'preview') {
                                                    const previewValidation = createAssignmentPreviewSchema(language).safeParse({
                                                        title: formData.title,
                                                        tasks: payloadPreview.tasks,
                                                    })

                                                    if (!previewValidation.success) {
                                                        toast.error(previewValidation.error.issues[0]?.message)
                                                        return
                                                    }

                                                    setActiveTab(tab.key)
                                                    return
                                                }

                                                setActiveTab(tab.key)
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPreviewOpen(true)}
                                    disabled={!canOpenPreview}
                                >
                                    Xem trước
                                </Button>
                                <Button onClick={submitCreateAssignment} disabled={isSubmitting}>
                                    {isSubmitting ? t.common.isSaving : t.common.save}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {activeTab === 'basic' && (
                        <QuizBasicInfoSection
                            formData={formData}
                            setFormData={setFormData}
                            onContinue={goToQuestionTab}
                        />
                    )}

                    {activeTab === 'questions' && selectedTask && selectedQuestion && (
                        <QuizQuestionsSection
                            tasks={tasks}
                            selectedTask={selectedTask}
                            selectedQuestion={selectedQuestion}
                            usesSharedPassage={usesSharedPassage}
                            showQuestionComposer={showQuestionComposer}
                            isReadingComprehension={isReadingComprehension}
                            getSharedPassageContent={getSharedPassageContent}
                            onAddTask={handleAddTask}
                            onSelectTask={handleSelectTask}
                            // onEditTaskTitle={handleEditTaskTitle}
                            onDeleteTask={handleDeleteTask}
                            onChangeTaskType={handleChangeTaskType}
                            onChangeTaskDescription={handleChangeTaskDescription}
                            onAddQuestion={handleAddQuestion}
                            onDeleteQuestion={handleDeleteSelectedQuestion}
                            onSelectQuestion={handleSelectQuestion}
                            onChangeSharedPassage={updateSharedPassageContent}
                            onChangeQuestionContent={handleChangeQuestionContent}
                            onAddChoice={handleAddChoice}
                            onToggleCorrectChoice={handleToggleCorrectChoice}
                            onDeleteChoice={handleDeleteChoice}
                            onChangeChoiceContent={handleChangeChoiceContent}
                        />
                    )}

                    {activeTab === 'preview' && (
                        <QuizPreviewContent payload={payloadPreview} />
                    )}
                </div>
            </Card >

            <QuizPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                payload={payloadPreview}
            />
        </div >
    )
}

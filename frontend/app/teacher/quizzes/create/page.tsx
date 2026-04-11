'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    QuizBasicInfoSection,
    QuizQuestionsSection,
    type AssignmentFormData,
    type ChoiceDraft,
    type QuestionDraft,
    type TaskDraft,
    type TaskType,
} from '../_components'
import { useLanguage } from '@/components/language-provider'

const createId = () => Math.random().toString(36).slice(2, 10)

const createChoice = (): ChoiceDraft => ({
    id: createId(),
    choiceContent: '',
    isCorrect: false,
})

const createQuestion = (): QuestionDraft => ({
    id: createId(),
    questionContent: '',
    topicTag: '',
    questionType: 'single-choice',
    passageIndex: 'none',
    choices: [createChoice(), createChoice()],
})

const createTask = (index: number): TaskDraft => ({
    id: createId(),
    taskTitle: `Phan ${index + 1}`,
    taskDescription: '',
    taskType: 'multiple_choice',
    passages: [],
    questions: [createQuestion()],
})

export default function CreateQuizPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const initialTask = createTask(0)
    const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'advanced' | 'history' | 'stats'>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)
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
        selectedTask?.taskType === 'pronounciation' ||
        selectedTask?.taskType === 'word_stress'
    const isClozePassage = selectedTask?.taskType === 'cloze_passage'
    const isReadingComprehension = selectedTask?.taskType === 'reading_comprehension'
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
        return {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            classId: formData.classId.trim(),
            isPublic: formData.isPublic,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
            isSingleAttempt: formData.isSingleAttempt,
            canViewResult: formData.canViewResult,
            tasks: tasks.map((task) => ({
                taskContent: task.taskDescription.trim() || task.taskTitle.trim(),
                taskType: task.taskType,
                passages: task.passages.length
                    ? (task.taskType === 'cloze_passage' || task.taskType === 'reading_comprehension'
                        ? [
                            {
                                passageContent: task.passages[0]?.passageContent.trim() ?? '',
                            },
                        ]
                        : task.passages.map((passage) => ({ passageContent: passage.passageContent.trim() })))
                    : undefined,
                questions: task.questions.map((question) => ({
                    questionContent: question.questionContent.trim(),
                    passageIndex:
                        task.taskType === 'cloze_passage' || task.taskType === 'reading_comprehension'
                            ? 0
                            : question.passageIndex === 'none'
                                ? undefined
                                : Number(question.passageIndex),
                    choices: question.choices.map((choice) => ({
                        choiceContent: choice.choiceContent.trim(),
                        isCorrect: choice.isCorrect,
                    })),
                })),
            })),
        }
    }, [formData, tasks])

    const goToQuestionTab = () => {
        if (!formData.title.trim()) {
            toast.error('Vui long nhap tieu de de thi')
            return
        }

        if (!formData.classId.trim()) {
            toast.error('Vui long nhap class ID')
            return
        }

        setActiveTab('questions')
    }

    const submitCreateAssignment = async () => {
        if (!payloadPreview.tasks.length) {
            toast.error('Can it nhat 1 task')
            return
        }

        for (const task of payloadPreview.tasks) {
            if (!task.taskContent) {
                toast.error('Task content khong duoc de trong')
                return
            }

            const requiresPassage =
                task.taskType === 'cloze_passage' ||
                task.taskType === 'reading_comprehension'

            if (requiresPassage && !task.passages?.[0]?.passageContent?.trim()) {
                toast.error('Task dang chon can nhap doan van dung chung')
                return
            }

            if (!task.questions.length) {
                toast.error('Moi task phai co it nhat 1 cau hoi')
                return
            }

            for (const question of task.questions) {
                const requiresQuestionContent =
                    task.taskType !== 'pronounciation' &&
                    task.taskType !== 'word_stress' &&
                    task.taskType !== 'cloze_passage'

                if (requiresQuestionContent && !question.questionContent) {
                    toast.error('Question content khong duoc de trong')
                    return
                }

                if (question.choices.length < 2) {
                    toast.error('Moi cau hoi phai co it nhat 2 dap an')
                    return
                }

                const correctCount = question.choices.filter((choice) => choice.isCorrect).length
                if (correctCount !== 1) {
                    toast.error('Moi cau hoi phai co dung 1 dap an dung')
                    return
                }
            }
        }

        setIsSubmitting(true)
        try {
            // TODO: call API create assignment here with payloadPreview.
            await new Promise((resolve) => setTimeout(resolve, 800))
            toast.success('Tao de thi thanh cong')
            router.push('/teacher/quizzes')
        } catch (_error) {
            toast.error('Tao de thi that bai')
        } finally {
            setIsSubmitting(false)
        }
    }

    const topTabs = [
        { key: 'basic', label: t.teacher.assignments.createAssignment.tabAssignmentInfo.title },
        { key: 'questions', label: t.teacher.assignments.createAssignment.title },
    ] as const

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back()
            return
        }

        router.push('/teacher/quizzes')
    }

    const handleAddTask = () => {
        const newTask = createTask(tasks.length)
        setTasks((prev) => [...prev, newTask])
        setSelectedTaskId(newTask.id)
        setSelectedQuestionId(newTask.questions[0].id)
    }

    const handleSelectTask = (taskId: string) => {
        setSelectedTaskId(taskId)

        const selected = tasks.find((task) => task.id === taskId)
        setSelectedQuestionId(selected?.questions[0]?.id ?? '')
    }

    const handleEditTaskTitle = (taskId: string) => {
        const task = tasks.find((item) => item.id === taskId)
        if (!task) {
            return
        }

        const newTitle = window.prompt('Nhap ten task moi', task.taskTitle)
        if (!newTitle?.trim()) {
            return
        }

        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            taskTitle: newTitle.trim(),
        }))
    }

    const handleDeleteTask = (taskId: string) => {
        if (tasks.length === 1) {
            toast.error('Can it nhat mot task')
            return
        }

        setTasks((prev) => prev.filter((task) => task.id !== taskId))
    }

    const handleChangeTaskType = (taskId: string, taskType: TaskType) => {
        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            taskType,
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
                            <Button onClick={submitCreateAssignment} disabled={isSubmitting}>
                                {isSubmitting ? 'Dang luu...' : 'Luu de thi'}
                            </Button>
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
                            onEditTaskTitle={handleEditTaskTitle}
                            onDeleteTask={handleDeleteTask}
                            onChangeTaskType={handleChangeTaskType}
                            onChangeTaskDescription={handleChangeTaskDescription}
                            onAddQuestion={handleAddQuestion}
                            onSelectQuestion={handleSelectQuestion}
                            onChangeSharedPassage={updateSharedPassageContent}
                            onChangeQuestionContent={handleChangeQuestionContent}
                            onAddChoice={handleAddChoice}
                            onToggleCorrectChoice={handleToggleCorrectChoice}
                            onDeleteChoice={handleDeleteChoice}
                            onChangeChoiceContent={handleChangeChoiceContent}
                        />
                    )}
                </div>
            </Card >
        </div >
    )
}

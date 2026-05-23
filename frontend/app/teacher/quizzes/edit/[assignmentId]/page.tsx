'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getClassesByTeacherId } from '@/services/teacher/classes'
import {
    createAssignmentBasicInfoSchema,
    createAssignmentPreviewSchema,
    createAssignmentQuestionListSchema,
    createAssignmentTaskListSchema,
} from '@/lib/validators/assignment'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    getAssignmentById,
    getAssignmentChatMessagesById,
    getOlderChatMessagesForSession,
    updateAssignmentFullById,
    type TeacherChatResponse,
} from '@/services/teacher/assignments'
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
} from '../../_components/edit'
import type { Assignment, Choice, Class, Question, Task, TaskType } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'
import { getTaskTypeLabel } from '@/lib/language-mappers/task-type-mapper'

type ActiveTab = 'basic' | 'questions' | 'preview' | 'results' | 'aiMessages'

type StudentResult = {
    studentName: string
    email: string
    submittedAt: string
    score: string
    status: string
}

const emptyResults: StudentResult[] = []

function mapTaskToDraft(
    task: Task,
    getTaskTitleFromType: (taskType: TaskType) => string
): TaskDraft {
    const questions = (task.questions ?? []).map((question) => {
        const choices = (question.choices ?? []).map((choice: Choice) => ({
            id: choice.id ?? createId(),
            choiceContent: choice.choiceContent ?? '',
            isCorrect: question.correctChoiceId === choice.id
        }))

        if (choices.length < 2) {
            choices.push(createChoice())
        }

        const passageIndex =
            question.passageId && (task.passages?.length ?? 0) > 0
                ? String(
                    Math.max(
                        0,
                        task.passages?.findIndex((passage) => passage.id === question.passageId) ?? 0
                    )
                )
                : 'none'

        return {
            id: question.id ?? createId(),
            questionContent: question.questionContent ?? '',
            topicTag: '',
            passageIndex,
            choices
        }
    })

    const normalizedQuestions = questions.length > 0 ? questions : [createQuestion()]

    return {
        id: task.id ?? createId(),
        taskTitle: getTaskTitleFromType(task.taskType),
        taskDescription: task.taskContent || '',
        taskType: task.taskType,
        passages: (task.passages ?? []).map((passage) => ({
            id: passage.id ?? createId(),
            passageContent: passage.passageContent
        })),
        questions: normalizedQuestions
    }
}

function mapAssignmentToFormData(assignment: Assignment): AssignmentFormData {
    const dueDate = assignment.dueDate
        ? new Date(assignment.dueDate)
        : null

    return {
        title: assignment.title ?? '',
        description: assignment.description ?? '',
        classId: assignment.classId ?? '',
        dueDate:
            dueDate && !Number.isNaN(dueDate.getTime())
                ? new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)
                : '',
        isPublic: Boolean(assignment.isPublic),
        isSingleAttempt: Boolean(assignment.isSingleAttempt),
        canViewResult: Boolean(assignment.canViewResult)
    }
}

export default function EditQuizPage() {
    const { t, language } = useLanguage()
    const { accessToken, user } = useAuth()
    const router = useRouter()
    const params = useParams<{ assignmentId: string }>()
    const assignmentId = params?.assignmentId ?? ''

    const getTaskTitleFromType = (taskType: TaskType) => {
        return getTaskTypeLabel(taskType, language)
    }

    const initialTask = createTask('MULTIPLE_CHOICE', getTaskTitleFromType('MULTIPLE_CHOICE'))
    const [activeTab, setActiveTab] = useState<ActiveTab>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isClassesLoading, setIsClassesLoading] = useState(true)
    const [teacherClasses, setTeacherClasses] = useState<Array<{ id: string; name: string }>>([])
    const [chatMessagesData, setChatMessagesData] = useState<TeacherChatResponse | null>(null)
    const [isChatMessagesLoading, setIsChatMessagesLoading] = useState(false)
    const [formData, setFormData] = useState<AssignmentFormData>({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        isPublic: false,
        isSingleAttempt: true,
        canViewResult: true
    })
    const [tasks, setTasks] = useState<TaskDraft[]>([initialTask])
    const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask.id)
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialTask.questions[0].id)

    const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
    const selectedQuestion =
        selectedTask?.questions.find((question) => question.id === selectedQuestionId) ??
        selectedTask?.questions[0]

    const isPronunciationOrStress =
        selectedTask?.taskType === 'PRONUNCIATION' || selectedTask?.taskType === 'WORD_STRESS'
    const isClozePassage = selectedTask?.taskType === 'CLOZE_PASSAGE'
    const isReadingComprehension = selectedTask?.taskType === 'READING_COMPREHENSION'
    const usesSharedPassage = isClozePassage || isReadingComprehension
    const showQuestionComposer = !isPronunciationOrStress && !isClozePassage

    useEffect(() => {
        const fetchTeacherClasses = async () => {
            if (!accessToken || !user?.id) {
                setIsClassesLoading(false)
                return
            }

            setIsClassesLoading(true)
            try {
                const response = await getClassesByTeacherId(accessToken, user.id)
                const classOptions = (response.classes ?? [])
                    .filter((classItem: Class) => Boolean(classItem.id) && Boolean(classItem.name?.trim()))
                    .map((classItem: Class) => ({
                        id: classItem.id,
                        name: classItem.name?.trim() ?? '',
                    }))

                setTeacherClasses(classOptions)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Khong the tai danh sach lop hoc'
                toast.error(message)
            } finally {
                setIsClassesLoading(false)
            }
        }

        void fetchTeacherClasses()
    }, [accessToken, user?.id])

    useEffect(() => {
        const fetchAssignment = async () => {
            if (!accessToken || !assignmentId) {
                setIsLoading(false)
                return
            }

            try {
                const assignment = await getAssignmentById(accessToken, assignmentId)
                const mappedTasks =
                    (assignment.tasks ?? []).length > 0
                        ? (assignment.tasks ?? []).map((task) => mapTaskToDraft(task, getTaskTitleFromType))
                        : [createTask('MULTIPLE_CHOICE', getTaskTitleFromType('MULTIPLE_CHOICE'))]

                setFormData(mapAssignmentToFormData(assignment))
                setTasks(mappedTasks)
                setSelectedTaskId(mappedTasks[0].id)
                setSelectedQuestionId(mappedTasks[0].questions[0].id)
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Khong the tai chi tiet bai tap'
                toast.error(message)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchAssignment()
    }, [accessToken, assignmentId])

    useEffect(() => {
        const fetchChatMessages = async () => {
            if (!accessToken || !assignmentId || activeTab !== 'aiMessages') {
                return
            }

            setIsChatMessagesLoading(true)
            try {
                const response = await getAssignmentChatMessagesById(accessToken, assignmentId, undefined, 3)
                setChatMessagesData(response)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Khong the tai lich su AI messages'
                toast.error(message)
            } finally {
                setIsChatMessagesLoading(false)
            }
        }

        void fetchChatMessages()
    }, [accessToken, assignmentId, activeTab])

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
            )
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
                            passageContent
                        }
                    ]
                }
            }

            return {
                ...oldTask,
                passages: [
                    {
                        ...firstPassage,
                        passageContent
                    }
                ]
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

    const submitUpdateAssignment = async () => {
        if (!accessToken) {
            toast.error('Vui long dang nhap lai')
            return
        }

        if (!assignmentId) {
            toast.error('Khong tim thay assignment ID')
            return
        }

        const basicValidation = createAssignmentBasicInfoSchema(language).safeParse(formData)
        if (!basicValidation.success) {
            toast.error(basicValidation.error.issues[0]?.message)
            return
        }

        const previewValidation = createAssignmentPreviewSchema(language).safeParse({
            title: formData.title,
            tasks: payloadPreview.tasks,
        })

        if (!previewValidation.success) {
            toast.error(previewValidation.error.issues[0]?.message)
            return
        }

        setIsSubmitting(true)
        try {
            const result = await updateAssignmentFullById(accessToken, assignmentId, payloadPreview)

            setFormData(mapAssignmentToFormData(result.assignment))
            if ((result.assignment.tasks ?? []).length > 0) {
                const nextTasks = (result.assignment.tasks ?? []).map((task) => mapTaskToDraft(task, getTaskTitleFromType))
                setTasks(nextTasks)
                setSelectedTaskId(nextTasks[0].id)
                setSelectedQuestionId(nextTasks[0].questions[0].id)
            }
            toast.success(result.message || 'Cap nhat bai tap thanh cong')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Cap nhat bai tap that bai'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const topTabs = [
        { key: 'basic', label: t.teacher.assignments.createAssignment.tabAssignmentInfo.title },
        { key: 'questions', label: t.teacher.assignments.editAssignment.tabEdit.title },
        { key: 'preview', label: t.teacher.assignments.editAssignment.tableViewPreview.title },
        { key: 'results', label: t.teacher.assignments.editAssignment.tabStudentResults.title },
        { key: 'aiMessages', label: 'AI message' }
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
            taskTitle: newTitle.trim()
        }))
    }

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
            taskTitle: getTaskTitleFromType(taskType)
        }))
    }

    const handleChangeTaskDescription = (taskId: string, value: string) => {
        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            taskDescription: value
        }))
    }

    const handleAddQuestion = (taskId: string) => {
        const newQuestion = createQuestion()
        updateTask(taskId, (oldTask) => ({
            ...oldTask,
            questions: [...oldTask.questions, newQuestion]
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
            questions: nextQuestions
        }))
    }

    const handleChangeQuestionContent = (value: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            questionContent: value
        }))
    }

    const handleAddChoice = () => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: [...question.choices, createChoice()]
        }))
    }

    const handleToggleCorrectChoice = (choiceId: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: question.choices.map((item) => ({
                ...item,
                isCorrect: item.id === choiceId
            }))
        }))
    }

    const handleDeleteChoice = (choiceId: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: question.choices.filter((item) => item.id !== choiceId)
        }))
    }

    const handleChangeChoiceContent = (choiceId: string, value: string) => {
        updateSelectedQuestion((question) => ({
            ...question,
            choices: question.choices.map((item) =>
                item.id === choiceId ? { ...item, choiceContent: value } : item
            )
        }))
    }

    function ChatSessionView({ session }: { session: any }) {
        const containerRef = useRef<HTMLDivElement | null>(null)
        const INITIAL_VISIBLE = 3
        const LOAD_MORE = 10
        const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE)
        const prevScrollHeightRef = useRef<number>(0)

        // flatten prompts into individual messages
        const [allMessages, setAllMessages] = useState<any[]>(() => {
            const arr: Array<any> = []
                ; (session.prompts ?? []).forEach((prompt: any) => {
                    arr.push({
                        id: `${prompt.id}-user`,
                        role: 'user',
                        text: prompt.prompt,
                        createdAt: prompt.createdAt,
                        version: prompt.version
                    })

                    if (prompt.response?.response) {
                        arr.push({
                            id: `${prompt.id}-assistant`,
                            role: 'assistant',
                            text: prompt.response.response,
                            createdAt: prompt.response.createdAt ?? prompt.createdAt
                        })
                    }
                })

            return arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        })

        const messages = allMessages
        const [hasMoreOlder, setHasMoreOlder] = useState<boolean>(true)
        const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false)

        // reset visible when session changes
        useEffect(() => {
            setVisibleCount(INITIAL_VISIBLE)
        }, [session.id])

        // scroll handling: when user scrolls to top, load older messages
        const onScroll = () => {
            const el = containerRef.current
            if (!el) return
            if (el.scrollTop <= 8) {
                if (visibleCount < messages.length) {
                    // load more from already-fetched messages
                    prevScrollHeightRef.current = el.scrollHeight
                    setVisibleCount((v) => Math.min(messages.length, v + LOAD_MORE))
                    return
                }

                // need to fetch older from backend if available
                if (!hasMoreOlder || isLoadingOlder) return

                void (async () => {
                    setIsLoadingOlder(true)
                    try {
                        const earliest = messages[0]?.createdAt
                        const params = new URLSearchParams()
                        params.set('limit', String(LOAD_MORE))
                        if (earliest) params.set('before', new Date(earliest).toISOString())

                        const older: any[] | null = await getOlderChatMessagesForSession(
                            accessToken as string,
                            assignmentId,
                            session.id,
                            params.get('before') ?? undefined,
                            Number(params.get('limit') ?? LOAD_MORE)
                        )
                        if (!Array.isArray(older) || older.length === 0) {
                            setHasMoreOlder(false)
                            return
                        }

                        // transform prompts into messages
                        const transformed: any[] = []
                        older.forEach((prompt: any) => {
                            transformed.push({ id: `${prompt.id}-user`, role: 'user', text: prompt.prompt, createdAt: prompt.createdAt, version: prompt.version })
                            if (prompt.response?.response) transformed.push({ id: `${prompt.id}-assistant`, role: 'assistant', text: prompt.response.response, createdAt: prompt.response.createdAt ?? prompt.createdAt })
                        })

                        // prepend and sort
                        setAllMessages((prev) => {
                            const next = [...transformed, ...prev]
                            return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        })
                        // increase visible count by number of items fetched
                        prevScrollHeightRef.current = el.scrollHeight
                        setVisibleCount((v) => v + transformed.length)
                    } catch (err) {
                        // swallow - optional: show toast
                    } finally {
                        setIsLoadingOlder(false)
                    }
                })()
            }
        }

        // after visibleCount change (loading older), adjust scroll to keep position
        useEffect(() => {
            const el = containerRef.current
            if (!el) return

            // on initial mount or when increasing visibleCount, maintain view at bottom for first render
            requestAnimationFrame(() => {
                if (prevScrollHeightRef.current > 0) {
                    const newScroll = el.scrollHeight - prevScrollHeightRef.current
                    el.scrollTop = newScroll
                    prevScrollHeightRef.current = 0
                } else {
                    // initial load: scroll to bottom
                    el.scrollTop = el.scrollHeight
                }
            })
        }, [visibleCount, messages.length])

        const shown = messages.slice(Math.max(0, messages.length - visibleCount))

        return (
            <div className="p-4">
                <div className="relative z-10 flex h-[610px] flex-col gap-4 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm">
                    <div className="hidden lg:block absolute inset-0 rounded-xl bg-gradient-to-br from-background via-background to-background" />
                    <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#e6e7e9_40%,#d9dade_100%)] blur-[70px] opacity-50 dark:opacity-30 pointer-events-none" />

                    <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-xl border border-muted/40 bg-background/70">
                        <div
                            ref={containerRef}
                            onScroll={onScroll}
                            className="flex-1 overflow-y-auto px-4 py-4"
                        >
                            <div className="space-y-4">
                                {shown.length === 0 ? (
                                    <div className="text-sm text-muted-foreground text-center py-4">Chua co tin nhan nao trong session nay.</div>
                                ) : (
                                    shown.map((msg: any) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[60%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-sm bg-orange-100 text-orange-950 dark:bg-orange-500/20 dark:text-orange-100' : 'rounded-bl-sm border bg-muted/40 text-foreground'}`}>
                                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                                <div className="text-xs opacity-70 mt-2">{msg.version && msg.role === 'user' ? `Version ${msg.version} · ` : ''}{new Date(msg.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">{t.common.loading}</div>
    }

    return (
        <div className="p-4 md:p-8 space-y-4 bg-muted/20 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" onClick={handleGoBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-semibold">{t.teacher.assignments.editAssignment.title}</h1>
                </div>
                <Button type="button" onClick={submitUpdateAssignment} disabled={isSubmitting}>
                    {isSubmitting ? t.common.isSaving : t.common.save}
                </Button>
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

                    </div>
                </div>

                <div className="p-4">
                    {activeTab === 'basic' && (
                        <QuizBasicInfoSection
                            formData={formData}
                            setFormData={setFormData}
                            classes={teacherClasses}
                            isClassesLoading={isClassesLoading}
                            onSave={submitUpdateAssignment}
                            isSaving={isSubmitting}
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

                    {activeTab === 'preview' && <QuizPreviewContent payload={payloadPreview} />}

                    {activeTab === 'results' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <BarChart3 className="h-5 w-5" />
                                Student results
                            </div>

                            {emptyResults.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                    Chua co ket qua nop bai cua hoc sinh cho assignment nay.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Submitted at</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {emptyResults.map((result, index) => (
                                            <TableRow key={`${result.email}-${index}`}>
                                                <TableCell>{result.studentName}</TableCell>
                                                <TableCell>{result.email}</TableCell>
                                                <TableCell>{result.submittedAt}</TableCell>
                                                <TableCell>{result.score}</TableCell>
                                                <TableCell>{result.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    )}

                    {activeTab === 'aiMessages' && (
                        <div className="space-y-4">
                            {isChatMessagesLoading ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                    Dang tai lich su chat...
                                </div>
                            ) : (chatMessagesData?.chatSessions ?? []).length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                    Chua co AI message nao cho assignment nay.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(chatMessagesData?.chatSessions ?? []).map((session) => (
                                        <ChatSessionView key={session.id} session={session} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <QuizPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                payload={payloadPreview}
            />
        </div>
    )
}

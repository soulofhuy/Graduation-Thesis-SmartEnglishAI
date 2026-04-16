'use client'

import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QuestionDraft, TaskDraft } from './quiz-builder-types'
import type { TaskType } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

type QuizQuestionsSectionProps = {
    tasks: TaskDraft[]
    selectedTask: TaskDraft
    selectedQuestion: QuestionDraft
    usesSharedPassage: boolean
    showQuestionComposer: boolean
    isReadingComprehension: boolean
    getSharedPassageContent: (task: TaskDraft) => string
    onAddTask: () => void
    onSelectTask: (taskId: string) => void
    // onEditTaskTitle: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onChangeTaskType: (taskId: string, taskType: TaskType) => void
    onChangeTaskDescription: (taskId: string, value: string) => void
    onAddQuestion: (taskId: string) => void
    onDeleteQuestion: () => void
    onSelectQuestion: (questionId: string) => void
    onChangeSharedPassage: (taskId: string, value: string) => void
    onChangeQuestionContent: (value: string) => void
    onAddChoice: () => void
    onToggleCorrectChoice: (choiceId: string) => void
    onDeleteChoice: (choiceId: string) => void
    onChangeChoiceContent: (choiceId: string, value: string) => void
}

export function QuizQuestionsSection({
    tasks,
    selectedTask,
    selectedQuestion,
    usesSharedPassage,
    showQuestionComposer,
    isReadingComprehension,
    getSharedPassageContent,
    onAddTask,
    onSelectTask,
    onDeleteTask,
    onChangeTaskType,
    onChangeTaskDescription,
    onAddQuestion,
    onDeleteQuestion,
    onSelectQuestion,
    onChangeSharedPassage,
    onChangeQuestionContent,
    onAddChoice,
    onToggleCorrectChoice,
    onDeleteChoice,
    onChangeChoiceContent,
}: QuizQuestionsSectionProps) {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <Card className="xl:col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{t.teacher.assignments.createQuestionsAndTasks.createTask.title}</CardTitle>
                        <Button variant="secondary" size="sm" className="text-primary text-white" onClick={onAddTask}>
                            {t.teacher.assignments.createQuestionsAndTasks.createTask.addTaskButton}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {tasks.map((task) => (
                            <button
                                key={task.id}
                                type="button"
                                className={`px-3 py-1 rounded-full text-sm border ${task.id === selectedTask.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-foreground'
                                    }`}
                                onClick={() => onSelectTask(task.id)}
                            >
                                {task.taskTitle}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onDeleteTask(selectedTask.id)}
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                        <div className="grid gap-2">
                            <Label>{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdown}</Label>
                            <Select
                                value={selectedTask.taskType}
                                onValueChange={(value) => onChangeTaskType(selectedTask.id, value as TaskType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-----" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRONUNCIATION">{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue.PRONUNCIATION}</SelectItem>
                                    <SelectItem value="WORD_STRESS">{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue.WORD_STRESS}</SelectItem>
                                    <SelectItem value="SITUATIONAL_DIALOG">{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue.SITUATIONAL_DIALOG}</SelectItem>
                                    <SelectItem value="MULTIPLE_CHOICE">{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue.MULTIPLE_CHOICE}</SelectItem>
                                    <SelectItem value="CLOZE_PASSAGE">{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue.CLOZE_PASSAGE}</SelectItem>
                                    <SelectItem value="READING_COMPREHENSION">{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskTypeDropdownValue.READING_COMPREHENSION}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>{t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskDescription}</Label>
                            <RichTextEditor
                                minHeightClass="min-h-20"
                                placeholder={t.teacher.assignments.createQuestionsAndTasks.createTask.fieldTaskDescriptionPlaceholder}
                                value={selectedTask.taskDescription}
                                onChange={(value) => onChangeTaskDescription(selectedTask.id, value)}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{t.teacher.assignments.createQuestionsAndTasks.createQuestion.questionList.title}</p>
                            <Button type="button" variant="secondary" size="sm" onClick={() => onAddQuestion(selectedTask.id)}>
                                <Plus className="w-4 h-4 mr-1" /> {t.teacher.assignments.createQuestionsAndTasks.createQuestion.questionList.addQuestionButton}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-3 max-h-[38vh] overflow-auto pr-1">
                            {selectedTask.questions.map((question, index) => (
                                <button
                                    key={question.id}
                                    type="button"
                                    className={`h-11 w-11 rounded-md border text-sm font-medium flex items-center justify-center ${selectedQuestion.id === question.id
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-background'
                                        }`}
                                    onClick={() => onSelectQuestion(question.id)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="xl:col-span-8">
                <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xl">{t.teacher.assignments.createQuestionsAndTasks.createQuestion.title}</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            disabled={selectedTask.questions.length <= 1}
                            onClick={onDeleteQuestion}
                        >
                            <Trash2 className="w-4 h-4" />
                            {t.teacher.assignments.createQuestionsAndTasks.createQuestion.deleteButton}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                    {usesSharedPassage && (
                        <div className="grid gap-2">
                            <Label>{t.teacher.assignments.createQuestionsAndTasks.createQuestion.clozeTest.title}</Label>
                            <RichTextEditor
                                minHeightClass="min-h-32"
                                placeholder={t.teacher.assignments.createQuestionsAndTasks.createQuestion.clozeTest.passagePlaceholder}
                                value={getSharedPassageContent(selectedTask)}
                                onChange={(value) => onChangeSharedPassage(selectedTask.id, value)}
                            />
                        </div>
                    )}

                    {showQuestionComposer && (
                        <div className="grid gap-2">
                            <Label>{t.teacher.assignments.createQuestionsAndTasks.createQuestion.questionContent}</Label>
                            <RichTextEditor
                                minHeightClass="min-h-24"
                                placeholder={t.teacher.assignments.createQuestionsAndTasks.createQuestion.questionContentPlaceholder}
                                value={selectedQuestion.questionContent}
                                onChange={onChangeQuestionContent}
                            />
                        </div>
                    )}

                    <Separator className="my-4 h-[2px]" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xl">{t.teacher.assignments.createQuestionsAndTasks.createQuestion.choice.title}</Label>
                            <Button type="button" variant="outline" size="sm" onClick={onAddChoice}>
                                <Plus className="w-4 h-4 mr-1" /> {t.teacher.assignments.createQuestionsAndTasks.createQuestion.choice.addChoiceButton}
                            </Button>
                        </div>

                        {selectedQuestion.choices.map((choice, index) => (
                            <div key={choice.id} className="space-y-2 rounded-md border p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        className="flex items-center text-sm font-medium"
                                        onClick={() => onToggleCorrectChoice(choice.id)}
                                    >
                                        <CheckCircle2
                                            className={`w-5 h-5 mr-2 stroke-[2.5] ${choice.isCorrect ? 'text-green-600' : 'text-muted-foreground'
                                                }`}
                                        />
                                        {t.teacher.assignments.createQuestionsAndTasks.createQuestion.choice.choiceNo}{index + 1}
                                    </button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive"
                                        disabled={selectedQuestion.choices.length < 2}
                                        onClick={() => onDeleteChoice(choice.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t.teacher.assignments.createQuestionsAndTasks.createQuestion.choice.deleteChoiceButton}
                                    </Button>
                                </div>

                                <RichTextEditor
                                    minHeightClass="min-h-20"
                                    placeholder={t.teacher.assignments.createQuestionsAndTasks.createQuestion.choice.choicePlaceholder}
                                    value={choice.choiceContent}
                                    onChange={(value) => onChangeChoiceContent(choice.id, value)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

'use client'

import { FormattedContent } from '@/lib/view-details-assignment-helpers/format-content'
import { answerColumns } from '@/lib/view-details-assignment-helpers/choice-constants'
import { cn } from '@/lib/utils'

type ChoiceOptionLike = {
    choiceId: string
    choiceContent?: string | null
    isSelected?: boolean
    isCorrect?: boolean
}

type AnswerWithChoiceOptions = {
    choiceOptions?: ChoiceOptionLike[] | null
}

type ChoiceOptionsReviewProps<TAnswer extends AnswerWithChoiceOptions> = {
    answer: TAnswer
    showSelectionStatus?: boolean
}

export function ChoiceOptionsReview<TAnswer extends AnswerWithChoiceOptions>({
    answer,
    showSelectionStatus = false,
}: ChoiceOptionsReviewProps<TAnswer>) {
    if (!answer.choiceOptions?.length) {
        return null
    }

    return (
        <div className="ml-8 mt-3 grid gap-2">
            {answer.choiceOptions.map((choice, index) => {
                const marker = answerColumns[index] ?? String(index + 1)

                return (
                    <div
                        key={choice.choiceId}
                        className={cn(
                            'rounded border p-3 text-sm',
                            choice.isSelected && choice.isCorrect && 'border-green-300 bg-green-50',
                            choice.isSelected && !choice.isCorrect && 'border-red-300 bg-red-50',
                            !choice.isSelected && choice.isCorrect && 'border-emerald-300 bg-emerald-50',
                            !choice.isSelected && !choice.isCorrect && 'border-border bg-muted/30',
                        )}
                    >
                        <div className="flex items-start gap-2">
                            <span className="font-semibold text-foreground">{marker}.</span>
                            <FormattedContent
                                html={choice.choiceContent}
                                className="text-foreground [&_p]:my-0"
                            />
                        </div>

                        {showSelectionStatus ? (
                            <div className="mt-1 text-xs text-muted-foreground">
                                {choice.isSelected ? 'Bạn đã chọn' : 'Không chọn'}
                                {choice.isCorrect ? ' • Đáp án đúng' : ''}
                            </div>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}

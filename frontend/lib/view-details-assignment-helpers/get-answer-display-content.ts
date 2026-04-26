import { hasRenderableContent } from '@/lib/view-details-assignment-helpers/format-content';

type AnswerLike = {
  questionContent?: string | null;
  taskContent?: string | null;
  passageContent?: string | null;
};

export const getAnswerDisplayContent = <T extends AnswerLike>(answer: T) => {
  const questionContent = hasRenderableContent(answer.questionContent)
    ? answer.questionContent
    : null;
  const taskContent = hasRenderableContent(answer.taskContent)
    ? answer.taskContent
    : null;
  const passageContent = hasRenderableContent(answer.passageContent)
    ? answer.passageContent
    : null;

  return {
    questionContent: questionContent ?? taskContent,
    passageContent
  };
};

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type StudentAttemptAnswerInput = {
  questionId: string;
  selectedChoiceId: string;
};

export type StudentAttemptPayload = {
  attemptId?: string;
  assignmentId: string;
  draftAnswer?: unknown | null;
  answers?: StudentAttemptAnswerInput[];
};

export type StudentAttemptAnswer = {
  id?: string;
  attemptId?: string;
  questionId: string;
  selectedChoiceId: string;
  question?: unknown;
  selectedChoice?: unknown;
};

export type StudentAttemptResultQuestionAnswer = {
  questionId: string;
  questionContent: string;
  taskType: string | null;
  taskContent: string | null;
  passageContent: string | null;
  choiceOptions?: {
    choiceId: string;
    choiceContent: string;
    isSelected: boolean;
    isCorrect: boolean;
  }[];
  selectedChoiceId: string;
  selectedChoiceContent: string;
  correctChoiceId: string | null;
  correctChoiceContent: string | null;
  isCorrect: boolean;
};

export type StudentAttemptResult = {
  id: string;
  attemptId: string;
  studentId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  questionAnswers: StudentAttemptResultQuestionAnswer[];
  createdAt?: string | null;
};

export type StudentAttempt = {
  id: string;
  studentId: string;
  assignmentId: string;
  status: string;
  draftAnswer?: unknown | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  answers?: StudentAttemptAnswer[] | null;
  result?: StudentAttemptResult | null;
};

const buildAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

export const startOrGetInProgressAttempt = async (
  token: string,
  assignmentId: string
) => {
  const response = await fetch(`${getApiBaseUrl()}/attempts/start`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ assignmentId })
  });

  const payload = (await response.json()) as
    | ApiSuccess<StudentAttempt>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to start attempt';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Attempt response is missing data');
  }

  return payload.data;
};

export const submitAttempt = async (
  token: string,
  payloadInput: StudentAttemptPayload
) => {
  const response = await fetch(`${getApiBaseUrl()}/attempts/submit`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payloadInput)
  });

  const payload = (await response.json()) as
    | ApiSuccess<StudentAttempt>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to submit attempt';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Submit attempt response is missing data');
  }

  return payload.data;
};

export const saveDraftAttempt = async (
  token: string,
  attemptId: string,
  selectedAnswers: Record<string, string>
) => {
  const response = await fetch(`${getApiBaseUrl()}/attempts/${attemptId}/draft`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ draftAnswer: selectedAnswers })
  });

  if (!response.ok) {
    throw new Error('Failed to save draft');
  }

  return response.json();
};

export const getLatestAttemptForStudent = async (
  token: string,
  assignmentId: string
) => {
  const response = await fetch(
    `${getApiBaseUrl()}/attempts/latest/${assignmentId}`,
    {
      method: 'GET',
      headers: buildAuthHeaders(token)
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<StudentAttempt>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch latest attempt';
    throw new Error(message);
  }

  if (!payload.data) {
    return null;
  }

  return payload.data;
};

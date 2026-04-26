import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type StudyProgressTaskTypeStat = {
  taskType: string;
  totalQuestions: number;
  correctQuestions: number;
};

export type StudyProgressOverview = {
  totalAssignmentsDone: number;
  totalQuestionsDone: number;
  bestTaskType: StudyProgressTaskTypeStat | null;
  weakestTaskType: StudyProgressTaskTypeStat | null;
};

export type StudyProgressMonthly = {
  month: string;
  totalQuestions: number;
  correctQuestions: number;
};

export type StudentStudyProgress = {
  overview: StudyProgressOverview;
  monthlyCorrectByTime: StudyProgressMonthly[];
  taskTypeStats: StudyProgressTaskTypeStat[];
};

const buildAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

export const getStudentStudyProgress = async (token: string) => {
  const response = await fetch(`${getApiBaseUrl()}/students/study-progress`, {
    method: 'GET',
    headers: buildAuthHeaders(token)
  });

  const payload = (await response.json()) as
    | ApiSuccess<StudentStudyProgress>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch study progress';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Study progress response is missing data');
  }

  return payload.data;
};

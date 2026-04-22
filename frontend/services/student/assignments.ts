import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type {
  Assignment,
  Choice,
  Class,
  Passage,
  Question,
  Task,
  User
} from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type AssignmentsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type StudentAssignmentAttemptSummary = {
  status: 'SUBMITTED' | 'IN_PROGRESS';
  label: 'DONE' | 'IN_PROGRESS';
  correctCount?: number;
  totalCount?: number;
  score?: number;
  attemptId: string;
  startedAt: string;
  submittedAt: string | null;
};

export type StudentAssignedAssignment = Assignment & {
  class: Pick<Class, 'id' | 'name' | 'classCode' | 'teacherId'>;
  creator: Pick<User, 'id' | 'email' | 'role' | 'profile'>;
  _count: {
    tasks: number;
  };
  attemptSummary: StudentAssignmentAttemptSummary | null;
};

export type StudentAssignedAssignmentsResponse = {
  data: StudentAssignedAssignment[];
  pagination: AssignmentsPagination;
};

export type StudentTaskQuestionChoice = Pick<Choice, 'id' | 'choiceContent'>;

export type StudentTaskQuestion = Pick<
  Question,
  'id' | 'questionContent' | 'passageId'
> & {
  choices?: StudentTaskQuestionChoice[] | null;
};

export type StudentTaskPassage = Pick<Passage, 'id' | 'passageContent'> & {
  questions?: StudentTaskQuestion[] | null;
};

export type StudentAssignmentTask = Pick<
  Task,
  'id' | 'taskType' | 'taskContent'
> & {
  questions?: StudentTaskQuestion[] | null;
  passages?: StudentTaskPassage[] | null;
};

export type StudentAssignmentDetailResponse = Assignment & {
  class?: Pick<Class, 'id' | 'name' | 'teacherId'> | null;
  tasks?: StudentAssignmentTask[] | null;
};

export async function getAssignmentsAssignedToMyClasses(
  token: string,
  page = 1,
  limit = 20
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(
    `${getApiBaseUrl()}/assignments-students/get-assignments-for-student?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<StudentAssignedAssignmentsResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch assigned assignments';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Assigned assignments response is missing data');
  }

  return payload.data;
}

export async function getAssignmentByIdForStudentToDoTest(
  token: string,
  assignmentId: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/assignments-for-student/${assignmentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<StudentAssignmentDetailResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch assignment detail';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Assignment detail response is missing data');
  }

  return payload.data;
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type StudentSummary = {
  id: string;
  name: string;
  email?: string | null;
  attemptsCount?: number;
  bestCorrectCount?: number | null;
  totalQuestions?: number | null;
  lastAttemptAt?: string | null;
};

export type AdminResultStudent = {
  studentId: string;
  email: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
  } | null;
  assignment: {
    assignmentId: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    isSingleAttempt: boolean;
    canViewResult: boolean;
    totalQuestions: number;
    latestAttemptId: string | null;
    latestStatus: string | null;
    latestCorrectCount: number | null;
    bestCorrectCount: number | null;
    submittedAttemptCount: number;
  };
};

export type AdminClassProgressResponse = {
  class: {
    id: string;
    name: string | null;
    classCode: string;
    description: string | null;
    teacherId: string;
  };
  assignment: {
    id: string;
    title: string;
  };
  totalStudents: number;
  students: AdminResultStudent[];
  assignmentStatistic: {
    submittedCount: number;
    notSubmittedCount: number;
    highestCorrectCount: number;
    highestCorrectStudentName: string | null;
  };
};

export type AdminStudentAssignmentDetail = {
  class: {
    id: string;
    name: string | null;
    classCode: string;
    teacherId: string;
  };
  student: {
    studentId: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
    } | null;
  };
  assignment: {
    assignmentId: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    isSingleAttempt: boolean;
    canViewResult: boolean;
  };
  attempts: Array<{
    attemptId: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
    draftAnswer: unknown;
    answerCount: number;
    result: {
      id: string;
      score: number;
      correctCount: number;
      totalCount: number;
      questionAnswers: unknown;
      createdAt: string;
    } | null;
    answers: Array<{
      id: string;
      questionId: string;
      selectedChoiceId: string;
      question: {
        id: string;
        questionContent: string;
        correctChoiceId: string | null;
        task: {
          id: string;
          taskContent: string;
          taskType: string;
        };
        choices: Array<{
          id: string;
          choiceContent: string;
        }>;
      };
      selectedChoice: {
        id: string;
        choiceContent: string;
      };
    }>;
  }>;
};

export type StudentsListResponse = {
  data: StudentSummary[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export async function getStudentsByAssignmentClass(
  token: string,
  assignmentId: string,
  classId: string,
  page = 1,
  limit = 10,
  search = ''
): Promise<StudentsListResponse> {
  if (!token) throw new Error('No auth token');

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (search) params.set('search', search);

  const url = `${getApiBaseUrl()}/admin/classes/${encodeURIComponent(
    classId
  )}/assignments/${encodeURIComponent(assignmentId)}/progress-on-assignments?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = (await res.json()) as ApiError;
    throw new Error(err.message || 'Failed to load students');
  }

  const payload = (await res.json()) as ApiSuccess<AdminClassProgressResponse>;
  if (!payload.status || !payload.data)
    throw new Error(payload.message || 'Failed');

  const students = payload.data.students.map(student => ({
    id: student.studentId,
    name:
      `${student.profile?.firstName ?? ''} ${student.profile?.lastName ?? ''}`.trim() ||
      student.email,
    email: student.email,
    attemptsCount: student.assignment.submittedAttemptCount,
    bestCorrectCount: student.assignment.bestCorrectCount,
    totalQuestions: student.assignment.totalQuestions,
    lastAttemptAt: null
  }));

  return {
    data: students,
    pagination: {
      page,
      limit,
      totalItems: payload.data.totalStudents,
      totalPages: Math.max(1, Math.ceil(payload.data.totalStudents / limit)),
      hasNextPage: page * limit < payload.data.totalStudents,
      hasPrevPage: page > 1
    }
  };
}

export async function getStudentResults(
  token: string,
  assignmentId: string,
  studentId: string
): Promise<AdminStudentAssignmentDetail> {
  if (!token) throw new Error('No auth token');

  const url = `${getApiBaseUrl()}/admin/assignments/${encodeURIComponent(
    assignmentId
  )}/students/${encodeURIComponent(studentId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = (await res.json()) as ApiError;
    throw new Error(err.message || 'Failed to load student results');
  }

  const payload =
    (await res.json()) as ApiSuccess<AdminStudentAssignmentDetail>;
  if (!payload.status || !payload.data) {
    throw new Error(payload.message || 'Failed to load student results');
  }

  return payload.data;
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type StudentSummary = {
  id: string;
  name: string;
  email?: string | null;
  attemptsCount?: number;
  bestScore?: number | null;
  lastAttemptAt?: string | null;
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

  const url = `${getApiBaseUrl()}/admin/assignments/${encodeURIComponent(
    assignmentId
  )}/classes/${encodeURIComponent(classId)}/students?${params.toString()}`;

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

  const payload = (await res.json()) as ApiSuccess<StudentsListResponse>;
  if (!payload.status || !payload.data)
    throw new Error(payload.message || 'Failed');

  return payload.data;
}

export async function getStudentResults(
  token: string,
  assignmentId: string,
  studentId: string
) {
  if (!token) throw new Error('No auth token');

  const url = `${getApiBaseUrl()}/admin/assignments/${encodeURIComponent(
    assignmentId
  )}/students/${encodeURIComponent(studentId)}/results`;

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

  const payload = await res.json();
  return payload;
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Assignment } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type AdminAssignmentsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type AdminAssignmentRow = Assignment & {
  taskCount?: number;
  attemptCount?: number;
  teacher?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  classInfo?: {
    id: string;
    name: string | null;
    classCode: string;
  } | null;
  classes?: Array<{
    id: string;
    name: string | null;
    classCode: string;
  }>;
};

export type GetAllAssignmentsResponse = {
  data: AdminAssignmentRow[];
  pagination: AdminAssignmentsPagination;
};

export async function getAllAssignments(
  token: string,
  page = 1,
  limit = 10
): Promise<GetAllAssignmentsResponse> {
  if (!token) {
    throw new Error('No authentication token found');
  }

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(
    `${getApiBaseUrl()}/admin/get-all-assignments?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Failed to fetch assignments');
  }

  const payload: ApiSuccess<GetAllAssignmentsResponse> = await response.json();

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || 'Failed to fetch assignments');
  }

  return payload.data;
}

export async function deleteAssignment(token: string, assignmentId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/admin/delete-assignment/${encodeURIComponent(assignmentId)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Delete assignment failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Assignment, Class, User } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type AssignmentsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type StudentAssignedAssignment = Assignment & {
  class: Pick<Class, 'id' | 'name' | 'classCode' | 'teacherId'>;
  creator: Pick<User, 'id' | 'email' | 'role' | 'profile'>;
  _count: {
    tasks: number;
  };
};

export type StudentAssignedAssignmentsResponse = {
  data: StudentAssignedAssignment[];
  pagination: AssignmentsPagination;
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

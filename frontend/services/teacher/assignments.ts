import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Assignment, CreateAssignmentInput } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export async function createAssignment(
  token: string,
  assignmentData: CreateAssignmentInput
) {
  const response = await fetch(`${getApiBaseUrl()}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(assignmentData)
  });

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Create assignment failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Create assignment response is missing data');
  }

  return { assignment: payload.data, message: payload.message };
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ClassMember } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export const requestToJoinClass = async (token: string, classCode: string) => {
  const response = await fetch(`${getApiBaseUrl()}/classes/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ classCode })
  });

  const payload = (await response.json()) as ApiSuccess<ClassMember> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Request to join class failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Request to join class response is missing data');
  }

  return { class: payload.data, message: payload.message };
};

export const getAllPendingRequestsToJoinClassByStudent = async (
  token: string
) => {
  const response = await fetch(`${getApiBaseUrl()}/classes/pending-requests`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as
    | ApiSuccess<ClassMember[]>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch pending requests';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Pending requests response is missing data');
  }

  return { pendingRequests: payload.data, message: payload.message };
};

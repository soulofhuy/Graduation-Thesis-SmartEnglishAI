import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
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

export const getAllApprovedClassesByStudent = async (token: string) => {
  const response = await fetch(`${getApiBaseUrl()}/classes/approved`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Class[]> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch approved classes';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Approved classes response is missing data');
  }

  return { approvedClasses: payload.data, message: payload.message };
};

export const getAllRequestsToJoinClassByStudent = async (token: string) => {
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

export const getStudentsByClassId = async (token: string, classId: string) => {
  const response = await fetch(
    `${getApiBaseUrl()}/get-students-by-class/${classId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const payload = (await response.json()) as ApiSuccess<Class> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch class students';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Class students response is missing data');
  }

  return { classDetail: payload.data, message: payload.message };
};

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
import type { ClassMember } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type PaginatedClassesResponse = {
  items: Class[];
  pagination: Pagination;
};

const buildQueryString = (page?: number, limit?: number) => {
  const searchParams = new URLSearchParams();

  if (page !== undefined) {
    searchParams.set('page', String(page));
  }

  if (limit !== undefined) {
    searchParams.set('limit', String(limit));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

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

export const getAllApprovedClassesByStudent = async (
  token: string,
  page?: number,
  limit?: number
) => {
  const response = await fetch(
    `${getApiBaseUrl()}/classes/approved${buildQueryString(page, limit)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<Class[] | PaginatedClassesResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch approved classes';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Approved classes response is missing data');
  }

  if (Array.isArray(payload.data)) {
    return { approvedClasses: payload.data, message: payload.message };
  }

  return {
    approvedClasses: payload.data.items,
    pagination: payload.data.pagination,
    message: payload.message
  };
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

export const getBannedClassByStudent = async (token: string) => {
  const response = await fetch(`${getApiBaseUrl()}/classes/banned`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Class[]> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch banned classes';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Banned classes response is missing data');
  }

  return { bannedClasses: payload.data, message: payload.message };
};

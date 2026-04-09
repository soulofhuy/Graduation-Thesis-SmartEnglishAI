import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
import type { ClassMember } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

type ClassStudentsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type BannedStudentsResponse = Class & {
  pagination: ClassStudentsPagination;
};

export const getAllBannedStudentsByClassId = async (
  token: string,
  classId: string,
  page = 1,
  limit = 10
) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(
    `${getApiBaseUrl()}/get-banned-students-by-class/${classId}?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch banned students');
  }

  const data: ApiSuccess<BannedStudentsResponse> = await response.json();
  return data.data;
};

export const toggleBanStudentInClass = async (
  token: string,
  classId: string,
  studentId: string
) => {
  const response = await fetch(`${getApiBaseUrl()}/toggle-ban-student`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      classId,
      studentId
    })
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to update student ban status');
  }

  const data: ApiSuccess<ClassMember> = await response.json();
  return data.data;
};

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type ClassStudentsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ClassStudentsResponse = Class & {
  pagination: ClassStudentsPagination;
};

export const getAllStudentsByClassId = async (
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
    `${getApiBaseUrl()}/get-students-by-class/${classId}?${searchParams.toString()}`,
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
    throw new Error(errorData.message || 'Failed to fetch students');
  }

  const data: ApiSuccess<ClassStudentsResponse> = await response.json();
  return data.data;
};

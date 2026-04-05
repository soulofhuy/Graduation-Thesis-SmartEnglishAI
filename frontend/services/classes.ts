import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export const getAllStudentsByClassId = async (
  token: string,
  classId: string
) => {
  const response = await fetch(
    `${getApiBaseUrl()}/get-students-by-class/${classId}`,
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
  const data: ApiSuccess<Class> = await response.json();
  return data.data;
};

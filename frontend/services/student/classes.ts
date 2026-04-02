import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export async function createClass(token: string, classData: Class) {
  const response = await fetch(`${getApiBaseUrl()}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(classData)
  });

  const payload = (await response.json()) as ApiSuccess<Class> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Create class failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Create class response is missing data');
  }

  return { class: payload.data, message: payload.message };
}

export async function getClassesByTeacherId(token: string, teacherId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/classes-by-teacher/${teacherId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  const payload = (await response.json()) as ApiSuccess<Class[]> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Get classes failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Classes response is missing data');
  }

  return { classes: payload.data, message: payload.message };
}

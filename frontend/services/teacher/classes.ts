import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export async function createClass(token: string, classData: Partial<Class>) {
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

export async function getClassesByTeacherId(
  token: string,
  teacherId: string,
  includePending = false
) {
  const searchParams = new URLSearchParams();
  if (includePending) {
    searchParams.set('includePending', 'true');
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${getApiBaseUrl()}/classes-by-teacher/${teacherId}${queryString ? `?${queryString}` : ''}`,
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

export async function approveStudentJoinClass(
  token: string,
  classId: string,
  studentId: string
) {
  const response = await fetch(`${getApiBaseUrl()}/classes/approve-student`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ classId, studentId })
  });

  const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Approve request failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

export async function rejectStudentJoinClass(
  token: string,
  classId: string,
  studentId: string
) {
  const response = await fetch(`${getApiBaseUrl()}/classes/reject-student`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ classId, studentId })
  });

  const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Reject request failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

export async function updateClass(
  token: string,
  classId: string,
  classData: Partial<Class>
) {
  const response = await fetch(`${getApiBaseUrl()}/classes/${classId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(classData)
  });

  const payload = (await response.json()) as ApiSuccess<Class> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Update class failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Update class response is missing data');
  }

  return { class: payload.data, message: payload.message };
}

export async function generateClassCode(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/classes/generate-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as
    | ApiSuccess<{ classCode: string }>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Generate class code failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Generate class code response is missing data');
  }

  return payload.data;
}

export const toggleClassStatus = async (token: string, classId: string) => {
  const response = await fetch(
    `${getApiBaseUrl()}/classes/${classId}/toggle-status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
  const payload = (await response.json()) as ApiSuccess<Class> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Toggle class status failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Toggle class status response is missing data');
  }

  return { class: payload.data, message: payload.message };
};

export async function getDeactivatedClasses(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/classes/deactivated`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Class[]> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Get deactivated classes failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Deactivated classes response is missing data');
  }

  return { classes: payload.data, message: payload.message };
}

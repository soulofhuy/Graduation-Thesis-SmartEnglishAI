import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Class, Assignment } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export async function getAdminDeactivatedClasses(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/trash/classes`, {
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

export async function getAdminDeactivatedAssignments(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/trash/assignments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Assignment[]> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Get deactivated assignments failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Deactivated assignments response is missing data');
  }

  return { assignments: payload.data, message: payload.message };
}

export async function restoreAdminClass(token: string, classId: string) {
  const response = await fetch(`${getApiBaseUrl()}/trash/classes/${classId}/restore`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Class> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Restore class failed';
    throw new Error(message);
  }

  return { class: payload.data, message: payload.message };
}

export async function deleteAdminClass(token: string, classId: string) {
  const response = await fetch(`${getApiBaseUrl()}/trash/classes/${classId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Delete class failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

export async function restoreAdminAssignment(token: string, assignmentId: string) {
  const response = await fetch(`${getApiBaseUrl()}/trash/assignments/${assignmentId}/restore`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Restore assignment failed';
    throw new Error(message);
  }

  return { assignment: payload.data, message: payload.message };
}

export async function deleteAdminAssignment(token: string, assignmentId: string) {
  const response = await fetch(`${getApiBaseUrl()}/trash/assignments/${assignmentId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Delete assignment failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export interface Class {
  id: string;
  name: string;
  description: string | null;
  classCode: string;
  teacherId: string;
  needsTeacherApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
  teacher: {
    id: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  studentCount: number;
  approvedStudentCount: number;
  bannedStudentCount: number;
  assignmentCount: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAllClassesResponse {
  data: Class[];
  pagination: PaginationMetadata;
}

export type CreateAdminClassPayload = {
  name: string;
  description?: string | null;
  teacherId: string;
  needsTeacherApproval: boolean;
};

export const getAllClasses = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<GetAllClassesResponse> => {
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${getApiBaseUrl()}/admin/get-all-classes?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch classes');
  }

  const data = await response.json();
  console.log('API Response for getAllClasses:', data);
  return data.data;
};

export async function createAdminClass(
  token: string,
  classData: CreateAdminClassPayload
) {
  const response = await fetch(`${getApiBaseUrl()}/admin/create-class`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(classData)
  });

  const payload = (await response.json()) as ApiSuccess<Class> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to create class';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Create class response is missing data');
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

export async function toggleClassStatus(token: string, classId: string) {
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
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type AdminUserProfile = {
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deactivatedAt?: string | null;
  profile?: AdminUserProfile | null;
};

export type AdminUsersPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type AdminUsersResponse = {
  data: AdminUser[];
  pagination: AdminUsersPagination;
};

export async function getAllUsers(token: string, page = 1, limit = 10) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(
    `${getApiBaseUrl()}/admin/get-all-users?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<AdminUsersResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch users';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Users response is missing data');
  }

  return payload.data;
}

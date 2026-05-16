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

export async function getAllTeachers(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/admin/get-all-teachers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const payload = (await response.json()) as ApiSuccess<AdminUser[]> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch teachers';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Teachers response is missing data');
  }

  return payload.data;
}

export type UpdateAdminUserPasswordResponse = {
  id: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  isActive: boolean;
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

export async function updateAdminUserPassword(
  token: string,
  userId: string,
  newPassword: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/admin/update-password/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newPassword })
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<UpdateAdminUserPasswordResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to update password';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Password update response is missing data');
  }

  return payload.data;
}

export async function getUserProfile(token: string, userId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/admin/get-user/${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const payload = (await response.json()) as
    | ApiSuccess<{
        id: string;
        email: string;
        role: 'TEACHER' | 'STUDENT';
        isActive: boolean;
        profile?: AdminUserProfile | null;
      }>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch user profile';
    throw new Error(message);
  }

  if (!payload.data) throw new Error('Profile response is missing data');

  return payload.data;
}

export async function updateUserProfile(
  token: string,
  userId: string,
  payload: Partial<AdminUserProfile>
) {
  const response = await fetch(
    `${getApiBaseUrl()}/admin/update-user/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  const body = (await response.json()) as ApiSuccess<any> | ApiError;

  if (!response.ok || !body.status) {
    const message = body?.message || 'Failed to update user profile';
    throw new Error(message);
  }

  if (!body.data) throw new Error('Update profile response is missing data');

  return body.data;
}

export async function toggleUserActive(token: string, userId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/admin/toggle-user/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const body = (await response.json()) as ApiSuccess<any> | ApiError;

  if (!response.ok || !body.status) {
    const message = body?.message || 'Failed to toggle user active status';
    throw new Error(message);
  }

  if (!body.data) throw new Error('Toggle response is missing data');

  return body.data;
}

export async function createAdminUser(
  token: string,
  email: string,
  password: string,
  role: 'TEACHER' | 'STUDENT',
  profile?: Partial<AdminUserProfile>
) {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      role
    })
  });

  const body = (await response.json()) as
    | ApiSuccess<{
        id: string;
        email: string;
        role: 'TEACHER' | 'STUDENT';
        isActive: boolean;
      }>
    | ApiError;

  if (!response.ok || !body.status) {
    const message = body?.message || 'Failed to create user';
    throw new Error(message);
  }

  if (!body.data) throw new Error('Create user response is missing data');

  const userId = body.data.id;

  if (
    profile &&
    Object.keys(profile).some(key => profile[key as keyof typeof profile])
  ) {
    try {
      await updateUserProfile(token, userId, profile);
    } catch (err) {
      console.warn('Profile update failed after user creation:', err);
    }
  }

  return body.data;
}

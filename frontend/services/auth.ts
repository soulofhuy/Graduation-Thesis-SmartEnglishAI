import type { AuthUser, Role } from '@/lib/types';
import {
  ApiError,
  ApiSuccess,
  LoginResponse,
  RegisterResponse
} from '@/lib/types/responses';

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return 'http://localhost:8000/api';
  }
  return baseUrl.replace(/\/+$/, '');
};

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const payload = (await response.json()) as
    | ApiSuccess<LoginResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Login failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Login response is missing data');
  }

  const { user, token } = payload.data;
  const message = payload.message;

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    isActive: user.isActive ?? true,
    deactivatedAt: user.deactivatedAt ?? null
  };

  return { user: authUser, token, message };
}

const toRole = (role: 'teacher' | 'student') =>
  role === 'teacher' ? 'TEACHER' : 'STUDENT';

export async function registerUser(
  email: string,
  password: string,
  role: 'teacher' | 'student'
) {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, role: toRole(role) })
  });

  const payload = (await response.json()) as
    | ApiSuccess<RegisterResponse>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Register failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Register response is missing data');
  }

  const user = payload.data;
  const message = payload.message;

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    isActive: user.isActive ?? true,
    deactivatedAt: user.deactivatedAt ?? null
  };

  return { user: authUser, message };
}

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { AuthUser, Role } from '@/lib/types';
import {
  ApiError,
  ApiSuccess,
  LoginResponse,
  RegisterResponse
} from '@/lib/types/responses';

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

export async function logoutUser(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<null> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Logout failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
) {
  const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const payload = (await response.json()) as ApiSuccess<null> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Change password failed';
    throw new Error(message);
  }

  return { message: payload.message };
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/auth/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    }
  );

  const payload = (await response.json()) as ApiSuccess<null> | ApiError;

  if (!response.ok || !payload.status) {
    const message =
      payload?.message || 'Failed to send password reset OTP';

    throw new Error(message);
  }

  return {
    message: payload.message
  };
}

export async function verifyPasswordResetOTP(
  email: string,
  otp: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/auth/verify-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        otp
      })
    }
  );

  const payload = (await response.json()) as ApiSuccess<null> | ApiError;

  if (!response.ok || !payload.status) {
    const message =
      payload?.message || 'OTP verification failed';

    throw new Error(message);
  }

  return {
    message: payload.message
  };
}

export async function resetPassword(
  email: string,
  newPassword: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/auth/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        newPassword
      })
    }
  );

  const payload = (await response.json()) as ApiSuccess<null> | ApiError;

  if (!response.ok || !payload.status) {
    const message =
      payload?.message || 'Password reset failed';

    throw new Error(message);
  }

  return {
    message: payload.message
  };
}

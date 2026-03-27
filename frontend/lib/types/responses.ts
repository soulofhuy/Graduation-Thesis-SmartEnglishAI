import type { AuthUser, Role } from '@/lib/types';

export type ApiSuccess<T> = {
  status: true;
  message: string;
  data: T | null;
  error: null;
};

export type ApiError = {
  status: false;
  message: string;
  data: null;
  error: unknown;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    role: Role;
    profile?: AuthUser['profile'] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    isActive?: boolean;
    deactivatedAt?: string | null;
    password?: string;
  };
  token: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  role: Role;
  profile?: AuthUser['profile'] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isActive?: boolean;
  deactivatedAt?: string | null;
  password?: string;
};

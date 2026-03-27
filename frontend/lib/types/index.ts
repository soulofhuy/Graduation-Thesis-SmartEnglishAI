export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  profile?: Profile | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isActive: boolean;
  deactivatedAt?: string | null;
}

export type AuthUser = Omit<User, 'password'>;

export interface Profile {
  id: string;
  userId: string;
  user: User;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

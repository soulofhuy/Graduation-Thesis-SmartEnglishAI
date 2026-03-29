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

export interface Class {
  id: string;
  name?: string | null;
  description?: string | null;
  teacherId: string;
  teacher?: User | null;
  students?: User[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  needsTeacherApproval: boolean;
  isActive: boolean;
  deactivatedAt?: string | null;
}

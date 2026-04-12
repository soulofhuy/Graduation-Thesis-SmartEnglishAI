export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type TaskType =
  | 'PRONUNCIATION'
  | 'WORD_STRESS'
  | 'SITUATIONAL_DIALOG'
  | 'MULTIPLE_CHOICE'
  | 'CLOZE_PASSAGE'
  | 'READING_COMPREHENSION';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  profile?: Profile | null;
  taughtClasses?: Class[] | null;
  studentClasses?: ClassMember[] | null;
  approvedClasses?: ClassMember[] | null;
  rejectedClasses?: ClassMember[] | null;
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
  classMembers?: ClassMember[] | null;
  students?: User[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  needsTeacherApproval: boolean;
  isActive: boolean;
  deactivatedAt?: string | null;
  classCode?: string;
  approvedStudentsCount?: number;
  pendingStudentsList?: ClassMember[];
}

export interface ClassMember {
  id: string;
  classId: string;
  studentId: string;
  approverId?: string | null;
  rejectorId?: string | null;
  class?: Class | null;
  student?: User | null;
  approver?: User | null;
  rejector?: User | null;
  joinedAt?: string | null;
  isBanned: boolean;
  bannedAt?: string | null;
  isApproved: boolean;
  approvedAt?: string | null;
  isRejected: boolean;
  rejectedAt?: string | null;
}

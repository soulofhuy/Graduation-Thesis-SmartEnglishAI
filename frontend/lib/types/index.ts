export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export const TASK_TYPES = [
  'PRONUNCIATION',
  'WORD_STRESS',
  'SITUATIONAL_DIALOG',
  'MULTIPLE_CHOICE',
  'CLOZE_PASSAGE',
  'READING_COMPREHENSION'
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

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
  assignmentCount?: number;
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

export interface Assignment {
  id: string;
  title?: string;
  description?: string | null;
  createdBy?: string;
  classId?: string;
  isPublic?: boolean;
  dueDate?: string | null;
  isSingleAttempt?: boolean;
  canViewResult?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  isActive: boolean;
  deactivatedAt?: string | null;
  creator?: User | null;
  class?: Class | null;
  tasks?: Task[] | null;
}

export interface Task {
  id: string;
  assignmentId: string;
  taskContent: string;
  taskType: TaskType;
  createdAt?: string | null;
  updatedAt?: string | null;
  assignment?: Assignment | null;
  questions?: Question[] | null;
  passages?: Passage[] | null;
  choices?: Choice[] | null;
}

export interface Question {
  id: string;
  questionContent: string;
  createdBy?: string | null;
  taskId: string;
  passageId?: string | null;
  correctChoiceId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  task?: Task | null;
  creator?: User | null;
  passage?: Passage | null;
  choices?: Choice[] | null;
  correctChoice?: Choice | null;
}

export interface Choice {
  id: string;
  questionId?: string | null;
  taskId?: string | null;
  passageId?: string | null;
  choiceContent: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  question?: Question | null;
  task?: Task | null;
  passage?: Passage | null;
  correctFor?: Question | null;
}

export interface Passage {
  id: string;
  passageContent: string;
  createdBy?: string | null;
  taskId: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  task?: Task | null;
  creator?: User | null;
  questions?: Question[] | null;
  choices?: Choice[] | null;
}

export type {
  CreateAssignmentInput,
  CreateChoiceInput,
  CreatePassageInput,
  CreateQuestionInput,
  CreateTaskInput
} from './create-test-input';

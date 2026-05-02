import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type TeacherOverviewStatistics = {
  totalClasses: number;
  totalStudents: number;
  totalPendingStudents: number;
  totalAssignments: number;
};

export type RecentAssignmentDetail = {
  id: string;
  title: string;
  className: string;
  createdAt: Date;
  dueDate: Date | null;
  submittedCount: number;
};

export type TeacherOverview = {
  statistics: TeacherOverviewStatistics;
  recentAssignments: RecentAssignmentDetail[];
};

export const getTeacherOverview = async (token: string) => {
  const response = await fetch(`${getApiBaseUrl()}/teachers/overview`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const payload = (await response.json()) as
    | ApiSuccess<TeacherOverview>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch overview for teacher';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Overview response is missing data');
  }

  return payload.data;
};

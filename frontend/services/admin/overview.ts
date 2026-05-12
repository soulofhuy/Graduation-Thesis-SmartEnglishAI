import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type OverviewStatisticItem = {
  total: number;
  growthRate: number;
};

export type OverviewStatistics = {
  totalUsers: OverviewStatisticItem;
  totalTeachers: OverviewStatisticItem;
  totalStudents: OverviewStatisticItem;
  totalAssignments: OverviewStatisticItem;
};

export type UserGrowthByMonth = {
  month: string;
  teachers: number;
  students: number;
};

export type AssignmentGrowthByMonth = {
  month: string;
  assignments: number;
};

export type SubmissionGrowthByMonth = {
  month: string;
  submissions: number;
  passedSubmissions: number;
};

export type AdminOverview = {
  year: number;
  statistics: OverviewStatistics;
  userGrowthByMonth: UserGrowthByMonth[];
  assignmentGrowthByMonth: AssignmentGrowthByMonth[];
  submissionGrowthByMonth: SubmissionGrowthByMonth[];
};

export const getAdminOverview = async (token: string, year?: number) => {
  const query = year ? `?year=${year}` : '';
  const response = await fetch(`${getApiBaseUrl()}/admin/overview${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const payload = (await response.json()) as
    | ApiSuccess<AdminOverview>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Failed to fetch admin overview';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Admin overview response is missing data');
  }

  return payload.data;
};

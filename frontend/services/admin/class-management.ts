import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';

export interface Class {
  id: string;
  name: string;
  description: string | null;
  classCode: string;
  teacherId: string;
  needsTeacherApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
  teacher: {
    id: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  studentCount: number;
  approvedStudentCount: number;
  bannedStudentCount: number;
  assignmentCount: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAllClassesResponse {
  data: Class[];
  pagination: PaginationMetadata;
}

export const getAllClasses = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<GetAllClassesResponse> => {
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${getApiBaseUrl()}/admin/get-all-classes?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch classes');
  }

  const data = await response.json();
  console.log('API Response for getAllClasses:', data);
  return data.data;
};

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { Assignment, CreateAssignmentInput } from '@/lib/types';
import type { CreateTaskInput } from '@/lib/types/create-test-input';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type AssignmentsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type TeacherAssignmentsResponse = {
  data: Assignment[];
  pagination: AssignmentsPagination;
};

export type TeacherChatResponse = {
  assignmentId: string;
  chatSessions: Array<{
    id: string;
    assignmentId: string | null;
    userId: string;
    title: string;
    updatedAt: string;
    createdAt: string;
    deletedAt: string | null;
    user: {
      id: string;
      email: string;
      profile: {
        firstName: string | null;
        lastName: string | null;
      } | null;
    };
    prompts: Array<{
      id: string;
      userId: string;
      chatSessionId: string;
      parentPromptId: string | null;
      prompt: string;
      effectivePrompt: string | null;
      version: number;
      type: string;
      createdAt: string;
      response: {
        id: string;
        promptId: string;
        response: string;
        createdAt: string;
      } | null;
    }>;
  }>;
};

export async function createAssignment(
  token: string,
  assignmentData: CreateAssignmentInput
) {
  const response = await fetch(`${getApiBaseUrl()}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(assignmentData)
  });

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Create assignment failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Create assignment response is missing data');
  }

  return { assignment: payload.data, message: payload.message };
}

export async function getAssignmentsCreatedByMe(
  token: string,
  page = 1,
  limit = 10
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(
    `${getApiBaseUrl()}/assignments/created-by-me?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch assignments');
  }

  const payload: ApiSuccess<TeacherAssignmentsResponse> = await response.json();

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || 'Failed to fetch assignments');
  }

  return payload.data;
}

export async function getAssignmentById(token: string, assignmentId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/assignments-for-teacher/${assignmentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch assignment detail');
  }

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || 'Failed to fetch assignment detail');
  }

  return payload.data;
}

export async function getAssignmentChatMessagesById(
  token: string,
  assignmentId: string,
  studentId?: string,
  latest?: number
) {
  const searchParams = new URLSearchParams(
    studentId?.trim() ? { studentId: studentId.trim() } : {}
  );

  if (latest !== undefined) {
    searchParams.set('latest', String(latest));
  }

  const url = `${getApiBaseUrl()}/assignments-for-teacher/${encodeURIComponent(
    assignmentId
  )}/chat-messages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch chat messages');
  }

  const payload = (await response.json()) as
    | ApiSuccess<TeacherChatResponse>
    | ApiError;

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || 'Failed to fetch chat messages');
  }

  return payload.data;
}

export async function getOlderChatMessagesForSession(
  token: string,
  assignmentId: string,
  sessionId: string,
  before?: string,
  limit = 20
) {
  const searchParams = new URLSearchParams();
  searchParams.set('limit', String(limit));
  if (before) searchParams.set('before', before);

  const url = `${getApiBaseUrl()}/assignments-for-teacher/${encodeURIComponent(
    assignmentId
  )}/chat-messages/${encodeURIComponent(sessionId)}/older?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch older chat messages');
  }

  const payload = (await response.json()) as ApiSuccess<any[]> | ApiError;

  if (!payload.status) {
    throw new Error(payload.message || 'Failed to fetch older chat messages');
  }

  return payload.data;
}

export async function getAssignmentsByClassId(token: string, classId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/classes/${encodeURIComponent(classId)}/assignments`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(
      errorData.message || 'Failed to fetch assignments by class'
    );
  }

  const payload = (await response.json()) as
    | ApiSuccess<Assignment[]>
    | ApiError;

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || 'Failed to fetch assignments by class');
  }

  return payload.data;
}

// type UpdateAssignmentInput = {
//   title?: string;
//   description?: string;
//   dueDate?: string | null;
//   isPublic?: boolean;
//   isSingleAttempt?: boolean;
//   canViewResult?: boolean;
// };

export async function updateAssignmentById(
  token: string,
  assignmentId: string,
  assignmentData: Partial<Assignment>
) {
  const response = await fetch(
    `${getApiBaseUrl()}/assignments/${encodeURIComponent(assignmentId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
    }
  );

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Update assignment failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Update assignment response is missing data');
  }

  return { assignment: payload.data, message: payload.message };
}

export type UpdateAssignmentFullInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  classId: string;
  isPublic: boolean;
  isSingleAttempt: boolean;
  canViewResult: boolean;
  tasks: CreateTaskInput[];
  forceDeleteAttempts?: boolean;
};

export async function updateAssignmentFullById(
  token: string,
  assignmentId: string,
  assignmentData: UpdateAssignmentFullInput
) {
  const response = await fetch(
    `${getApiBaseUrl()}/assignments/${encodeURIComponent(assignmentId)}/full`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
    }
  );

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Update assignment failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Update assignment response is missing data');
  }

  return { assignment: payload.data, message: payload.message };
}

export async function toggleAssignmentActiveStatus(
  token: string,
  assignmentId: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/assignments/toggle-active-status/${assignmentId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const payload = (await response.json()) as ApiSuccess<Assignment> | ApiError;

  if (!response.ok || !payload.status) {
    const message =
      payload?.message || 'Toggle assignment active status failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Toggle assignment response is missing data');
  }

  return { assignment: payload.data, message: payload.message };
}

export async function getDeactivatedAssignments(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/assignments/deactivated`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as
    | ApiSuccess<Assignment[]>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Get deactivated assignments failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Deactivated assignments response is missing data');
  }

  return { assignments: payload.data, message: payload.message };
}

export async function deleteAssignment(token: string, assignmentId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/assignments/delete/${assignmentId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
  const payload = (await response.json()) as ApiSuccess<unknown> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Delete assignment failed';
    throw new Error(message);
  }
  return { message: payload.message };
}

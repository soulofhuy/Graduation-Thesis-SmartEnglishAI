import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { CreateAssignmentInput } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

export type AIPromptType = 'ASSIGMMENT_CREATION' | 'RESULT_ANALYSIS';

export type AIResponseModel = {
  id: string;
  promptId: string;
  response: string;
  createdAt: string;
};

export type AIPromptModel = {
  id: string;
  userId: string;
  chatSessionId: string;
  prompt: string;
  type: AIPromptType;
  createdAt: string;
  response: AIResponseModel | null;
};

export type ChatSessionModel = {
  id: string;
  assignmentId: string | null;
  userId: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  prompts: AIPromptModel[];
};

export type SendChatMessageRequest = {
  prompt: string;
  assignmentTitle?: string;
  assignmentDescription?: string;
  classId?: string;
  dueDate?: string;
  isPublic?: boolean;
  isSingleAttempt?: boolean;
  canViewResult?: boolean;
  assignmentId?: string;
  chatSessionId?: string;
  chatSessionTitle?: string;
  type?: AIPromptType;
};

export type SendChatMessageResponse = {
  assignment: CreateAssignmentInput;
  chatSession: ChatSessionModel | null;
  prompt: AIPromptModel;
  response: AIResponseModel;
};

const CHAT_SESSION_API_BASE = `${getApiBaseUrl()}/ai/chat-session`;

export function createAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<{ data: T; message: string }> {
  const payload = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || fallbackMessage;
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error(`${fallbackMessage} - response is missing data`);
  }

  return {
    data: payload.data,
    message: payload.message
  };
}

export async function sendAIChatMessage(
  token: string,
  body: SendChatMessageRequest
) {
  const response = await fetch(`${CHAT_SESSION_API_BASE}/message`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(body)
  });

  const result = await parseApiResponse<SendChatMessageResponse>(
    response,
    'Send chat message failed'
  );

  return result;
}

export async function getAIChatSessionsByAssignmentId(
  token: string,
  assignmentId: string
) {
  const response = await fetch(
    `${CHAT_SESSION_API_BASE}/assignment/${assignmentId}`,
    {
      method: 'GET',
      headers: createAuthHeaders(token)
    }
  );

  const result = await parseApiResponse<ChatSessionModel[]>(
    response,
    'Get chat sessions by assignment failed'
  );

  return result;
}

export async function getAIChatSessionById(
  token: string,
  chatSessionId: string
) {
  const response = await fetch(`${CHAT_SESSION_API_BASE}/${chatSessionId}`, {
    method: 'GET',
    headers: createAuthHeaders(token)
  });

  const result = await parseApiResponse<ChatSessionModel>(
    response,
    'Get chat session failed'
  );

  return result;
}

export async function linkAIChatSessionToAssignment(
  token: string,
  chatSessionId: string,
  assignmentId: string
) {
  const response = await fetch(
    `${CHAT_SESSION_API_BASE}/${chatSessionId}/assignment`,
    {
      method: 'PATCH',
      headers: createAuthHeaders(token),
      body: JSON.stringify({ assignmentId })
    }
  );

  const result = await parseApiResponse<ChatSessionModel>(
    response,
    'Link chat session to assignment failed'
  );

  return result;
}

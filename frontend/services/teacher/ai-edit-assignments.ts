import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { ChatSessionModel } from './ai-chat-sessions';
import { createAuthHeaders, parseApiResponse } from './ai-chat-sessions';

export type AIEditConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
};

type EditAssignmentRequest = {
  message: string;
  currentAssignment: object;
  conversationHistory?: AIEditConversationTurn[];
  assignmentId?: string;
  chatSessionId?: string;
  chatSessionTitle?: string;
};

type EditAssignmentResponseData = {
  assignment: any;
  explanation: string;
  chatSession: ChatSessionModel | null;
};

export async function editAssignmentWithAI(
  token: string,
  message: string,
  currentAssignment: object,
  options?: {
    conversationHistory?: AIEditConversationTurn[];
    assignmentId?: string;
    chatSessionId?: string;
    chatSessionTitle?: string;
  }
) {
  const response = await fetch(`${getApiBaseUrl()}/ai/edit-assignment`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify({
      message,
      currentAssignment,
      conversationHistory: options?.conversationHistory ?? [],
      ...(options?.assignmentId ? { assignmentId: options.assignmentId } : {}),
      ...(options?.chatSessionId ? { chatSessionId: options.chatSessionId } : {}),
      ...(options?.chatSessionTitle ? { chatSessionTitle: options.chatSessionTitle } : {})
    } satisfies EditAssignmentRequest)
  });

  const { data, message: responseMessage } =
    await parseApiResponse<EditAssignmentResponseData>(response, 'Edit assignment with AI failed');

  return {
    assignment: data.assignment,
    explanation: data.explanation,
    chatSession: data.chatSession,
    message: responseMessage
  };
}

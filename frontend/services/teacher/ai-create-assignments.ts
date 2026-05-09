import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { CreateAssignmentInput } from '@/lib/types';
import type { ChatSessionModel } from './ai-chat-sessions';
import { createAuthHeaders, parseApiResponse } from './ai-chat-sessions';

type GenerateAssignmentRequest = {
  topic: string;
  assignmentId?: string;
  chatSessionId?: string;
  chatSessionTitle?: string;
};

type GenerateAssignmentResponseData =
  | CreateAssignmentInput
  | {
      assignment: CreateAssignmentInput;
      chatSession: ChatSessionModel | null;
    };

function unwrapGeneratedAssignmentData(data: GenerateAssignmentResponseData) {
  if ('tasks' in data) {
    return {
      assignment: data,
      chatSession: null
    };
  }

  return {
    assignment: data.assignment,
    chatSession: data.chatSession
  };
}

export async function generateAssignmentFromPrompt(
  token: string,
  topic: string,
  options?: Omit<GenerateAssignmentRequest, 'topic'>
) {
  const response = await fetch(`${getApiBaseUrl()}/ai/generate-assignment`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify({
      topic,
      ...(options?.assignmentId ? { assignmentId: options.assignmentId } : {}),
      ...(options?.chatSessionId
        ? { chatSessionId: options.chatSessionId }
        : {}),
      ...(options?.chatSessionTitle
        ? { chatSessionTitle: options.chatSessionTitle }
        : {})
    } satisfies GenerateAssignmentRequest)
  });

  const { data, message } =
    await parseApiResponse<GenerateAssignmentResponseData>(
      response,
      'Generate assignment failed'
    );

  const unwrapped = unwrapGeneratedAssignmentData(data);

  return {
    assignment: unwrapped.assignment,
    chatSession: unwrapped.chatSession,
    message
  };
}

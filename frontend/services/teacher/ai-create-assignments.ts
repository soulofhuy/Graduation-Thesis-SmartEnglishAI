import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';
import type { CreateAssignmentInput } from '@/lib/types';
import type { ApiError, ApiSuccess } from '@/lib/types/responses';

type GenerateAssignmentRequest = {
  topic: string;
};

export async function generateAssignmentFromPrompt(
  token: string,
  topic: string
) {
  const response = await fetch(`${getApiBaseUrl()}/ai/generate-assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ topic } satisfies GenerateAssignmentRequest)
  });

  const payload = (await response.json()) as
    | ApiSuccess<CreateAssignmentInput>
    | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Generate assignment failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Generate assignment response is missing data');
  }

  return { assignment: payload.data, message: payload.message };
}

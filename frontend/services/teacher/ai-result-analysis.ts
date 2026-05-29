import {
  getApiBaseUrl,
  getTextToSqlApiBaseUrl
} from '@/lib/api-base-url/get-api-base-url';

type SendAnalysisChatPayload = {
  accessToken: string;
  userId: string;
  chatSessionId?: string | null;
  prompt: string;
};

// chỗ này là API được gọi từ backend để có thể lấy data từ AI
const getAIAnalysisResponse = async (prompt: string) => {
  const response = await fetch(`${getTextToSqlApiBaseUrl()}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: prompt
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get response from AI');
  }

  const data = await response.json();
  return data.response;
};

export const aiResultAnalysisService = {
  sendAnalysisChat: async (payload: SendAnalysisChatPayload) => {
    try {
      const aiResponse = await getAIAnalysisResponse(payload.prompt);
      const saveData = {
        ...payload,
        response: aiResponse
      };
      const savedResponse = await fetch(
        `${getApiBaseUrl()}/result-analysis/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.accessToken}`
          },
          body: JSON.stringify(saveData)
        }
      );

      const savedResponseData = await savedResponse.json();

      if (!savedResponse.ok) {
        throw new Error(
          savedResponseData.error || 'Failed to save analysis chat'
        );
      }

      return savedResponseData.data?.aiResponse;
    } catch (error) {
      console.error('Error in sendAnalysisChat:', error);
      throw error;
    }
  },

  getAnalysisChatHistory: async (accessToken: string) => {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/result-analysis/chat/history`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const { data, error } = await response.json();

      if (!response.ok) {
        throw new Error(error || 'Failed to load analysis chat history');
      }

      return (data ?? []).flatMap((session: any) =>
        (session.prompts ?? []).flatMap((prompt: any) => {
          const messages = [
            {
              id: prompt.id,
              role: 'USER',
              content: prompt.prompt,
              createdAt: prompt.createdAt,
              chatSessionId: session.id
            }
          ];

          if (prompt.response) {
            messages.push({
              id: prompt.response.id,
              role: 'AI',
              content: prompt.response.response,
              createdAt: prompt.response.createdAt,
              chatSessionId: session.id
            });
          }

          return messages;
        })
      );
    } catch (error) {
      console.error('Error getting analysis chat history:', error);
      throw error;
    }
  }
};

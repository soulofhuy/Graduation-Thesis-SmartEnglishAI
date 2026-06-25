import {
  getApiBaseUrl,
  getTextToSqlApiBaseUrl
} from '@/lib/api-base-url/get-api-base-url';

type ConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
};

type SendAnalysisChatPayload = {
  accessToken: string;
  userId: string;
  chatSessionId?: string | null;
  prompt: string;
  conversationHistory?: ConversationTurn[];
};

type AnalysisChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type AnalysisChatMessage = {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  createdAt: string;
  chatSessionId: string;
};

type AnalysisChatSessionDetail = AnalysisChatSession & {
  messages: AnalysisChatMessage[];
};

// chỗ này là API được gọi từ backend để có thể lấy data từ AI
const getAIAnalysisResponse = async (prompt: string, conversationHistory: ConversationTurn[] = []) => {
  const response = await fetch(`${getTextToSqlApiBaseUrl()}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: prompt,
      conversation_history: conversationHistory
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get response from AI');
  }

  const data = await response.json();
  return data.analysis;
};

export const aiResultAnalysisService = {
  sendAnalysisChat: async (payload: SendAnalysisChatPayload) => {
    try {
      const aiResponse = await getAIAnalysisResponse(payload.prompt, payload.conversationHistory ?? []);
      // const aiResponse =
      //   'Đây là phản hồi giả định từ AI cho prompt: ' + payload.prompt;
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

      return (data ?? []) as AnalysisChatSession[];
    } catch (error) {
      console.error('Error getting analysis chat history:', error);
      throw error;
    }
  },

  getAnalysisChatSessionDetail: async (
    accessToken: string,
    chatSessionId: string
  ) => {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/result-analysis/chat/${chatSessionId}`,
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
        throw new Error(error || 'Failed to load analysis chat session detail');
      }

      return data as AnalysisChatSessionDetail;
    } catch (error) {
      console.error('Error getting analysis chat session detail:', error);
      throw error;
    }
  }
};

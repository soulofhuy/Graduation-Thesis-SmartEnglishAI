import {
  getApiBaseUrl,
  getTextToSqlApiBaseUrl
} from '@/lib/api-base-url/get-api-base-url';

type SendAnalysisChatPayload = {
  chatSessionId?: string | null;
  prompt: string;
  assignmentId?: string;
  classId?: string;
};

// 1. Call Python backend to get AI response
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
  return data.response; // Assuming the python API returns { "response": "..." }
};

// 2. Save chat exchange to Node.js backend and get history
export const aiResultAnalysisService = {
  sendAnalysisChat: async (payload: SendAnalysisChatPayload) => {
    try {
      // Step 1: Get response from Python AI service
      const aiResponse = await getAIAnalysisResponse(payload.prompt);

      // Step 2: Save the entire exchange to our Node.js backend
      const saveData = {
        ...payload,
        response: aiResponse
      };

      const { data } = await fetch(`${getApiBaseUrl()}/result-analysis/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      }).then(res => res.json());

      return data;
    } catch (error) {
      console.error('Error in sendAnalysisChat:', error);
      throw error;
    }
  },

  getAnalysisChatHistory: async () => {
    try {
      const { data } = await fetch(
        `${getApiBaseUrl()}/result-analysis/chat/history`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).then(res => res.json());

      return data;
    } catch (error) {
      console.error('Error getting analysis chat history:', error);
      throw error;
    }
  }
};

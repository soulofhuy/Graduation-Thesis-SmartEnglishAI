import { getAI } from '@/utils/ai/ai-initialization';
import { sampleAssignmentPayload } from '../../../../postman/create-assignment-sample';

export type AIConversationTurn = {
  prompt: string;
  response?: string | null;
};

export type GenerateAssignmentContentInput = {
  topic: string;
  conversationHistory?: AIConversationTurn[];
};

const extractJsonPayload = (rawText: string): string | null => {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const fencedContent = fencedMatch[1].trim();
    if (fencedContent.startsWith('{') || fencedContent.startsWith('[')) {
      return fencedContent;
    }
  }

  const objectStart = rawText.indexOf('{');
  if (objectStart === -1) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = objectStart; i < rawText.length; i += 1) {
    const char = rawText[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') depth += 1;
      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          return rawText.slice(objectStart, i + 1).trim();
        }
      }
    }
  }

  return null;
};

export type GenerateAssignmentPayload = {
  topic: string;
};

export type GenerateAssignmentResult = {
  assignment: any;
  rawText: string;
};

class AIGenerateAssignmentServices {
  static buildPrompt(topic: string, conversationHistory: AIConversationTurn[]) {
    const historyBlock = conversationHistory.length
      ? conversationHistory
          .map((turn, index) => {
            const parts = [
              `Turn ${index + 1}`,
              `User prompt: ${turn.prompt.trim()}`
            ];

            if (turn.response?.trim()) {
              parts.push(`AI response: ${turn.response.trim()}`);
            }

            return parts.join('\n');
          })
          .join('\n\n')
      : 'No previous conversation in this chat session.';

    return `
You are continuing an existing chat session for generating an English exam.

Previous conversation history:
${historyBlock}

Current user request:
${topic}

Return only the final exam payload that best follows the latest user request and the prior conversation context.

Format: ${JSON.stringify(sampleAssignmentPayload)}
    `.trim();
  }

  static generateAssignmentContent = async (
    input: string | GenerateAssignmentContentInput
  ): Promise<GenerateAssignmentResult> => {
    try {
      const topic = typeof input === 'string' ? input : input.topic;
      const conversationHistory =
        typeof input === 'string' ? [] : (input.conversationHistory ?? []);
      const prompt = AIGenerateAssignmentServices.buildPrompt(
        topic,
        conversationHistory
      );
      const ai = await getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const rawText = typeof response.text === 'string' ? response.text : '';
      const jsonPayload = extractJsonPayload(rawText);

      if (!jsonPayload) {
        throw new Error('AI returned empty content');
      }

      try {
        return {
          assignment: JSON.parse(jsonPayload),
          rawText
        };
      } catch {
        throw new Error('AI returned non-JSON content');
      }
    } catch (error) {
      console.error('Error generating assignment:', error);
      throw new Error('Failed to generate assignment');
    }
  };

  static generateAssignment = async (topic: string) => {
    const result =
      await AIGenerateAssignmentServices.generateAssignmentContent(topic);

    return result.assignment;
  };
}

export default AIGenerateAssignmentServices;

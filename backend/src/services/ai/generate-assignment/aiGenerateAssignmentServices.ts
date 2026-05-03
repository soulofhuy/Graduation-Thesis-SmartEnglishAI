import { getAI } from '@/utils/ai/ai-initialization';
import { sampleAssignmentPayload } from '../../../../postman/create-assignment-sample';

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

class AIGenerateAssignmentServices {
  static generateAssignment = async (topic: string) => {
    try {
      const prompt = `
                    Prompt: ${topic}
                    Format: ${JSON.stringify(sampleAssignmentPayload)}
                `;
      const ai = await getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const rawText = typeof response.text === 'string' ? response.text : '';
      console.log(rawText);

      const jsonPayload = extractJsonPayload(rawText);
      if (!jsonPayload) {
        throw new Error('AI returned empty content');
      }

      try {
        return JSON.parse(jsonPayload);
      } catch {
        throw new Error('AI returned non-JSON content');
      }
    } catch (error) {
      console.error('Error generating assignment:', error);
      throw new Error('Failed to generate assignment');
    }
  };
}

export default AIGenerateAssignmentServices;

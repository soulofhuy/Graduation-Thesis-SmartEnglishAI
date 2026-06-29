import { getAI } from '@/utils/ai/ai-initialization';
import { sampleAssignmentPayload } from '../../../../postman/create-assignment-sample';

export type AIConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export type EditAssignmentResult = {
  assignment: any;
  explanation: string;
  rawText: string;
};

const extractJsonPayload = (rawText: string): string | null => {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const content = fencedMatch[1].trim();
    if (content.startsWith('{') || content.startsWith('[')) return content;
  }

  const objectStart = rawText.indexOf('{');
  if (objectStart === -1) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = objectStart; i < rawText.length; i += 1) {
    const char = rawText[i];
    if (isEscaped) { isEscaped = false; continue; }
    if (char === '\\') { isEscaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{') depth += 1;
      if (char === '}') {
        depth -= 1;
        if (depth === 0) return rawText.slice(objectStart, i + 1).trim();
      }
    }
  }
  return null;
};

class AIEditAssignmentServices {
  static buildPrompt(
    currentAssignment: any,
    message: string,
    conversationHistory: AIConversationTurn[]
  ): string {
    const historyBlock = conversationHistory.length
      ? conversationHistory
          .map((turn) => {
            const label = turn.role === 'user' ? 'Teacher' : 'Assistant';
            return `${label}: ${turn.content.trim()}`;
          })
          .join('\n\n')
      : 'No previous conversation.';

    const sampleFormat = JSON.stringify(
      {
        taskContent: 'Part description',
        taskType: 'MULTIPLE_CHOICE',
        passages: [],
        questions: [
          {
            questionContent: 'Question text here',
            passageIndex: 0,
            choices: [
              { choiceContent: 'Option A', isCorrect: false },
              { choiceContent: 'Option B', isCorrect: true },
              { choiceContent: 'Option C', isCorrect: false },
              { choiceContent: 'Option D', isCorrect: false }
            ]
          }
        ]
      },
      null,
      2
    );

    return `
You are an expert English language teacher assistant. You help teachers edit their English quiz assignments.

## Your task
The teacher has described a change they want to make. You must:
1. Apply the requested changes to the current assignment JSON
2. Return the COMPLETE modified assignment (all fields, all tasks, all questions)
3. Provide a brief explanation of what you changed

## Assignment structure rules
- taskType must be one of: MULTIPLE_CHOICE, READING_COMPREHENSION, CLOZE_PASSAGE, PRONUNCIATION, WORD_STRESS, SITUATIONAL_DIALOG
- Each question must have at least 2 choices, exactly one with isCorrect: true
- For READING_COMPREHENSION / CLOZE_PASSAGE, include passages and set passageIndex on questions
- For other taskTypes, passageIndex should be 0 or omitted
- Preserve all existing content that was not mentioned for change
- Only modify what the teacher explicitly requested

## Example task format
${sampleFormat}

## Previous conversation
${historyBlock}

## Current assignment (full JSON)
${JSON.stringify(currentAssignment, null, 2)}

## Teacher's latest request
${message}

## Response format (MUST be valid JSON, no extra text outside)
{
  "modified_assignment": {
    "title": "...",
    "description": "...",
    "tasks": [ ... ]
  },
  "explanation": "Brief description of what was changed"
}
`.trim();
  }

  static editAssignmentContent = async (
    currentAssignment: any,
    message: string,
    conversationHistory: AIConversationTurn[] = []
  ): Promise<EditAssignmentResult> => {
    const prompt = AIEditAssignmentServices.buildPrompt(
      currentAssignment,
      message,
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
      throw new Error('AI returned empty or unparseable content');
    }

    const parsed = JSON.parse(jsonPayload);

    if (!parsed.modified_assignment || typeof parsed.modified_assignment !== 'object') {
      throw new Error('AI response missing modified_assignment field');
    }

    return {
      assignment: parsed.modified_assignment,
      explanation: parsed.explanation ?? '',
      rawText
    };
  };
}

export default AIEditAssignmentServices;

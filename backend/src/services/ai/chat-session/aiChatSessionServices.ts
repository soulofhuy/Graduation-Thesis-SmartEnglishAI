import prisma from '@/utils/prisma';
import AIGenerateAssignmentServices from '@/services/ai/generate-assignment/aiGenerateAssignmentServices';
import { AIPromptType } from '@/generated/prisma/client';

type ChatSessionRecord = Awaited<ReturnType<typeof prisma.chatSession.create>>;

export type SendChatMessageInput = {
  userId: string;
  prompt: string;
  assignmentId?: string;
  chatSessionId?: string;
  chatSessionTitle?: string;
  type?: AIPromptType;
};

export type PersistChatExchangeInput = SendChatMessageInput & {
  rawText: string;
};

class AIChatSessionServices {
  static buildDefaultTitle(prompt: string) {
    const normalized = prompt.trim().replace(/\s+/g, ' ');
    if (!normalized) {
      return 'AI Chat Session';
    }

    return normalized.length > 64
      ? `${normalized.slice(0, 64).trimEnd()}...`
      : normalized;
  }

  static async createChatSession(params: {
    userId: string;
    title?: string;
    assignmentId?: string;
  }): Promise<ChatSessionRecord> {
    return prisma.chatSession.create({
      data: {
        userId: params.userId,
        title: params.title?.trim() || 'AI Chat Session',
        ...(params.assignmentId ? { assignmentId: params.assignmentId } : {})
      }
    });
  }

  static async resolveSession(input: {
    userId: string;
    assignmentId?: string;
    chatSessionId?: string;
    chatSessionTitle?: string;
    prompt: string;
  }): Promise<ChatSessionRecord> {
    let session: ChatSessionRecord | null = input.chatSessionId
      ? await prisma.chatSession.findFirst({
          where: {
            id: input.chatSessionId,
            userId: input.userId,
            deletedAt: null
          }
        })
      : null;

    if (!session && input.assignmentId) {
      session = await prisma.chatSession.findFirst({
        where: {
          assignmentId: input.assignmentId,
          userId: input.userId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    if (!session) {
      session = await AIChatSessionServices.createChatSession({
        userId: input.userId,
        ...(input.assignmentId ? { assignmentId: input.assignmentId } : {}),
        title:
          input.chatSessionTitle ||
          AIChatSessionServices.buildDefaultTitle(input.prompt)
      });
    }

    if (input.assignmentId && !session.assignmentId) {
      session = await prisma.chatSession.update({
        where: {
          id: session.id
        },
        data: {
          assignmentId: input.assignmentId
        }
      });
    }

    return session;
  }

  static async findSessionForUser(chatSessionId: string, userId: string) {
    return prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId,
        deletedAt: null
      },
      include: {
        prompts: {
          include: {
            response: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
  }

  static async linkSessionToAssignment(
    chatSessionId: string,
    assignmentId: string,
    userId: string
  ) {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId,
        deletedAt: null
      }
    });

    if (!session) {
      throw new Error('Chat session not found');
    }

    if (session.assignmentId && session.assignmentId !== assignmentId) {
      throw new Error('Chat session already linked to another assignment');
    }

    return prisma.chatSession.update({
      where: {
        id: chatSessionId
      },
      data: {
        assignmentId
      }
    });
  }

  static async getChatSessionsByAssignmentId(
    assignmentId: string,
    userId: string
  ) {
    return prisma.chatSession.findMany({
      where: {
        assignmentId,
        userId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        prompts: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            response: true
          }
        }
      }
    });
  }

  static async getChatSessionById(chatSessionId: string, userId: string) {
    return AIChatSessionServices.findSessionForUser(chatSessionId, userId);
  }

  static async sendMessage(input: SendChatMessageInput) {
    const promptText = input.prompt.trim();

    if (!promptText) {
      throw new Error('Prompt is required');
    }

    const { rawText, assignment } =
      await AIGenerateAssignmentServices.generateAssignmentContent(promptText);

    const exchange = await AIChatSessionServices.recordPromptAndResponse({
      ...input,
      prompt: promptText,
      rawText
    });

    return {
      assignment,
      chatSession: exchange.chatSession,
      prompt: exchange.prompt,
      response: exchange.response
    };
  }

  static async recordPromptAndResponse(input: PersistChatExchangeInput) {
    const promptText = input.prompt.trim();
    const session = await AIChatSessionServices.resolveSession({
      userId: input.userId,
      ...(input.assignmentId ? { assignmentId: input.assignmentId } : {}),
      ...(input.chatSessionId ? { chatSessionId: input.chatSessionId } : {}),
      ...(input.chatSessionTitle
        ? { chatSessionTitle: input.chatSessionTitle }
        : {}),
      prompt: promptText
    });

    const promptRecord = await prisma.aIPrompt.create({
      data: {
        userId: input.userId,
        chatSessionId: session.id,
        prompt: promptText,
        type: input.type ?? AIPromptType.ASSIGMMENT_CREATION
      }
    });

    const responseRecord = await prisma.aIResponse.create({
      data: {
        promptId: promptRecord.id,
        response: input.rawText
      }
    });

    const updatedSession = await prisma.chatSession.findUnique({
      where: {
        id: session.id
      },
      include: {
        prompts: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            response: true
          }
        }
      }
    });

    return {
      chatSession: updatedSession,
      prompt: promptRecord,
      response: responseRecord
    };
  }
}

export default AIChatSessionServices;

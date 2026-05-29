import prisma from '@/utils/prisma';
import { AIPromptType } from '@/generated/prisma/client';

export const saveResultAnalysisChat = async (
  userId: string,
  chatSessionId: string | null,
  prompt: string,
  response: string
) => {
  return prisma.$transaction(async tx => {
    let session = null;

    if (chatSessionId) {
      session = await tx.chatSession.findFirst({
        where: {
          id: chatSessionId,
          userId,
          deletedAt: null
        }
      });

      if (!session) {
        throw new Error('Chat session not found');
      }
    } else {
      session = await tx.chatSession.findFirst({
        where: {
          userId,
          deletedAt: null,
          prompts: {
            some: {
              type: AIPromptType.RESULT_ANALYSIS
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    }

    if (!session) {
      session = await tx.chatSession.create({
        data: {
          userId,
          title: 'Result Analysis Chat'
        }
      });
    }

    await tx.chatSession.update({
      where: {
        id: session.id
      },
      data: {
        updatedAt: new Date()
      }
    });

    const userPrompt = await tx.aIPrompt.create({
      data: {
        userId,
        chatSessionId: session.id,
        prompt,
        type: AIPromptType.RESULT_ANALYSIS
      }
    });

    const aiResponse = await tx.aIResponse.create({
      data: {
        promptId: userPrompt.id,
        response
      }
    });

    return { session, userPrompt, aiResponse };
  });
};

export const getAnalysisChatHistory = async (userId: string) => {
  const sessions = await prisma.chatSession.findMany({
    where: {
      userId,
      deletedAt: null,
      prompts: {
        some: {
          type: AIPromptType.RESULT_ANALYSIS
        }
      }
    },
    include: {
      prompts: {
        where: {
          type: AIPromptType.RESULT_ANALYSIS
        },
        include: {
          response: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return sessions;
};

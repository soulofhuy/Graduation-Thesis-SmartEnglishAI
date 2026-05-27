import prisma from '@/utils/prisma';
import { AIPromptType } from '@/generated/prisma/client';

export const saveResultAnalysisChat = async (
  userId: string,
  chatSessionId: string | null,
  prompt: string,
  response: string
) => {
  let session;

  if (chatSessionId) {
    session = await prisma.chatSession.findUnique({
      where: { id: chatSessionId }
    });
    if (session) {
      session = await prisma.chatSession.update({
        where: { id: chatSessionId },
        data: { updatedAt: new Date() }
      });
    }
  }

  if (!session) {
    session = await prisma.chatSession.create({
      data: {
        userId,
        title: 'Result Analysis Chat'
      }
    });
  }

  const userPrompt = await prisma.aIPrompt.create({
    data: {
      userId,
      chatSessionId: session.id,
      prompt,
      type: AIPromptType.RESULT_ANALYSIS
    }
  });

  const aiResponse = await prisma.aIResponse.create({
    data: {
      promptId: userPrompt.id,
      response
    }
  });

  return { session, userPrompt, aiResponse };
};

export const getAnalysisChatHistory = async (userId: string) => {
  const sessions = await prisma.chatSession.findMany({
    where: {
      userId,
      prompts: {
        some: {
          type: AIPromptType.RESULT_ANALYSIS
        }
      }
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
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return sessions;
};

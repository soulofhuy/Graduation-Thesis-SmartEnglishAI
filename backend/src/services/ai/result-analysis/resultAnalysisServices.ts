import prisma from '@/utils/prisma';
import { AIPromptType } from '@/generated/prisma/client';

type ResultAnalysisHistoryMessage = {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  createdAt: Date;
};

type ResultAnalysisHistorySession = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

type ResultAnalysisSessionMessage = {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  createdAt: Date;
};

type ResultAnalysisSessionDetail = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ResultAnalysisSessionMessage[];
};

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
    }

    if (!session) {
      session = await tx.chatSession.create({
        data: {
          userId,
          title: prompt.slice(0, 10).trim() || 'Result Analysis Chat'
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

  return sessions.map(session => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt ?? new Date(),
    updatedAt: session.updatedAt
  })) satisfies ResultAnalysisHistorySession[];
};

export const getAnalysisChatSessionDetail = async (
  userId: string,
  chatSessionId: string
) => {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: chatSessionId,
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
    }
  });

  if (!session) {
    return null;
  }

  const messages = session.prompts.flatMap(prompt => {
    const promptCreatedAt = prompt.createdAt ?? session.createdAt ?? new Date();
    const aiCreatedAt = prompt.response?.createdAt ?? promptCreatedAt;

    return [
      {
        id: prompt.id,
        role: 'USER' as const,
        content: prompt.prompt,
        createdAt: promptCreatedAt
      },
      ...(prompt.response
        ? [
            {
              id: prompt.response.id,
              role: 'AI' as const,
              content: prompt.response.response,
              createdAt: aiCreatedAt
            }
          ]
        : [])
    ];
  });

  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt ?? new Date(),
    updatedAt: session.updatedAt,
    messages
  } satisfies ResultAnalysisSessionDetail;
};

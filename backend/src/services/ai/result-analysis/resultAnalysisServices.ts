import prisma from '@/utils/prisma';
import { AIPromptType } from '@/generated/prisma/client';

export const saveResultAnalysisChat = async (
  userId: string,
  chatSessionId: string | null,
  prompt: string,
  response: string,
  assignmentId?: string,
  classId?: string
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
    let title = 'Result Analysis Chat';
    if (assignmentId) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });
      if (assignment) {
        title = `Analysis for ${assignment.title}`;
      }
    } else if (classId) {
      const classInfo = await prisma.class.findUnique({
        where: { id: classId }
      });
      if (classInfo) {
        title = `Analysis for class ${classInfo.name}`;
      }
    }

    session = await prisma.chatSession.create({
      data: {
        userId,
        title,
        assignmentId: assignmentId || null
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

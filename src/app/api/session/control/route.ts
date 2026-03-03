import { NextRequest } from 'next/server';
import { handleErrorResponse, successResponse } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { broadcastToSession, eventNames } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionId } = body;

    if (!sessionId) {
      return successResponse({ error: 'sessionId is required' }, 400);
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                choices: {
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
        },
        players: true,
      },
    });

    if (!session) {
      return successResponse({ error: 'Session not found' }, 404);
    }

    if (action === 'start') {
      // Start the game
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'active',
          startedAt: new Date(),
          currentQuestionIndex: 0,
        },
      });

      const currentQuestion = session.quiz.questions[0];

      // Broadcast game start
      await broadcastToSession(session.joinCode, eventNames.QUESTION_START, {
        questionIndex: 0,
        totalQuestions: session.quiz.questions.length,
        question: currentQuestion,
      });

      return successResponse(updatedSession);
    } else if (action === 'next') {
      // Move to next question
      const nextIndex = session.currentQuestionIndex + 1;

      if (nextIndex >= session.quiz.questions.length) {
        // Game over
        const updatedSession = await prisma.session.update({
          where: { id: sessionId },
          data: {
            status: 'finished',
            endedAt: new Date(),
          },
        });

        const finalLeaderboard = await prisma.player.findMany({
          where: { sessionId },
          orderBy: { score: 'desc' },
        });

        await broadcastToSession(session.joinCode, eventNames.GAME_OVER, {
          leaderboard: finalLeaderboard,
        });

        return successResponse(updatedSession);
      }

      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          currentQuestionIndex: nextIndex,
        },
      });

      const nextQuestion = session.quiz.questions[nextIndex];

      await broadcastToSession(session.joinCode, eventNames.QUESTION_START, {
        questionIndex: nextIndex,
        totalQuestions: session.quiz.questions.length,
        question: nextQuestion,
      });

      return successResponse(updatedSession);
    }

    return successResponse(
      { error: 'Invalid action. Use "start" or "next"' },
      400
    );
  } catch (error) {
    return handleErrorResponse(error);
  }
}
